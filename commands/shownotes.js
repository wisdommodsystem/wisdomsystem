const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const Note = require('../models/Note');

module.exports = {
  name: 'shownotes',
  description: 'Shows all notes about a user or lists all users with notes',
  usage: '+shownotes [@user] [category] [priority]',
  examples: [
    '+shownotes',
    '+shownotes @user',
    '+shownotes @user warning',
    '+shownotes @user high'
  ],
  async execute(message, args) {
    // Check MongoDB connection
    if (!global.mongoConnected) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Database Error')
        .setDescription('The database is currently not connected. Please try again in a few moments.')
        .setFooter({ text: 'Contact support if the issue persists' });
      return message.reply({ embeds: [embed] });
    }

    // Load trusted users and staff
    const teamData = JSON.parse(fs.readFileSync('./config/team.json', 'utf8'));
    const trustedUsers = teamData.trusted || [];
    const ownerId = process.env.OWNER_ID;
    const staffData = JSON.parse(fs.readFileSync('./config/staff.json', 'utf8'));
    const staffIds = staffData.staffIds || [];

    // Check if user has permission
    if (![ownerId, ...staffIds, ...trustedUsers].includes(message.author.id)) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔒 Access Denied')
        .setDescription('This command is reserved for the Wisdom Team only.')
        .setFooter({ text: 'Contact Apollo for access' });
      return message.reply({ embeds: [embed] });
    }

    // If no user is mentioned, show all users with notes
    if (!message.mentions.users.first()) {
      try {
        const allNotes = await Note.find().sort({ lastUpdated: -1 });
        
        if (!allNotes || allNotes.length === 0) {
          const embed = new EmbedBuilder()
            .setColor('#808080')
            .setTitle('📭 No Notes Found')
            .setDescription('No notes found in the database.')
            .setFooter({ text: 'Use +addnote to add a note' });
          return message.reply({ embeds: [embed] });
        }

        // Create paginated embeds for all users with notes
        const usersPerPage = 10;
        const pages = Math.ceil(allNotes.length / usersPerPage);

        for (let i = 0; i < pages; i++) {
          const start = i * usersPerPage;
          const end = start + usersPerPage;
          const currentUsers = allNotes.slice(start, end);

          const embed = new EmbedBuilder()
            .setColor('#00bfff')
            .setTitle(`📋 Users with Notes (Page ${i + 1}/${pages})`)
            .setDescription(`📊 Total Users with Notes: ${allNotes.length}`)
            .setFooter({ text: 'Use +shownotes @user to view specific user notes' })
            .setTimestamp();

          currentUsers.forEach((userNote, index) => {
            const noteCount = userNote.notes.length;
            const warningCount = userNote.notes.filter(n => n.category === 'warning').length;
            const infoCount = userNote.notes.filter(n => n.category === 'info').length;
            const positiveCount = userNote.notes.filter(n => n.category === 'positive').length;
            const negativeCount = userNote.notes.filter(n => n.category === 'negative').length;
            const otherCount = userNote.notes.filter(n => n.category === 'other').length;

            embed.addFields({
              name: `👤 ${userNote.username}`,
              value: `📝 **Total Notes:** ${noteCount}\n` +
                    `⚠️ **Warnings:** ${warningCount}\n` +
                    `ℹ️ **Info:** ${infoCount}\n` +
                    `✅ **Positive:** ${positiveCount}\n` +
                    `❌ **Negative:** ${negativeCount}\n` +
                    `📌 **Other:** ${otherCount}\n` +
                    `🕒 **Last Updated:** ${userNote.lastUpdated.toLocaleString()}`
            });
          });

          message.channel.send({ embeds: [embed] });
        }
        return;
      } catch (error) {
        console.error('Error in shownotes command:', error);
        const errorEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Error Viewing Notes')
          .setDescription(`There was an error viewing the notes: ${error.message}`)
          .setFooter({ text: 'Please try again or contact support if the issue persists' });
        
        return message.reply({ embeds: [errorEmbed] });
      }
    }

    // If user is mentioned, show their notes
    const target = message.mentions.users.first();
    try {
      const userNote = await Note.findOne({ userId: target.id });
      
      if (!userNote || userNote.notes.length === 0) {
        const embed = new EmbedBuilder()
          .setColor('#808080')
          .setTitle('📭 No Notes Found')
          .setDescription(`No notes found for ${target.tag}`)
          .setFooter({ text: 'Use +addnote to add a note' });
        return message.reply({ embeds: [embed] });
      }

      // Filter notes based on arguments
      let filteredNotes = userNote.notes;
      const filterArg = args[1]?.toLowerCase();
      
      if (filterArg) {
        if (['warning', 'info', 'positive', 'negative', 'other'].includes(filterArg)) {
          filteredNotes = filteredNotes.filter(note => note.category === filterArg);
        } else if (['low', 'medium', 'high'].includes(filterArg)) {
          filteredNotes = filteredNotes.filter(note => note.priority === filterArg);
        }
      }

      // Sort notes by timestamp (newest first)
      filteredNotes.sort((a, b) => b.timestamp - a.timestamp);

      // Create paginated embeds
      const notesPerPage = 5;
      const pages = Math.ceil(filteredNotes.length / notesPerPage);
      
      for (let i = 0; i < pages; i++) {
        const start = i * notesPerPage;
        const end = start + notesPerPage;
        const currentNotes = filteredNotes.slice(start, end);

        const embed = new EmbedBuilder()
          .setColor(this.getCategoryColor(filterArg))
          .setTitle(`📋 Notes for ${target.tag} (Page ${i + 1}/${pages})`)
          .setDescription(`📊 Total Notes: ${userNote.totalNotes}`)
          .setThumbnail(target.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: `Last Updated: ${userNote.lastUpdated.toLocaleString()}` })
          .setTimestamp();

        currentNotes.forEach((note, index) => {
          const noteNumber = start + index + 1;
          const categoryEmoji = this.getCategoryEmoji(note.category);
          const priorityEmoji = this.getPriorityEmoji(note.priority);
          const privacyEmoji = note.isPrivate ? '🔒' : '🌐';
          
          embed.addFields({
            name: `${categoryEmoji} Note #${noteNumber} ${priorityEmoji} ${privacyEmoji}`,
            value: `**Content:** ${note.content}\n**Added by:** ${note.addedByTag}\n**Date:** ${note.timestamp.toLocaleString()}`
          });
        });

        message.channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Error in shownotes command:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error Viewing Notes')
        .setDescription(`There was an error viewing the notes: ${error.message}`)
        .setFooter({ text: 'Please try again or contact support if the issue persists' });
      
      message.reply({ embeds: [errorEmbed] });
    }
  },

  getCategoryColor(category) {
    const colors = {
      warning: '#ffa500',  // Orange
      info: '#00bfff',    // Blue
      positive: '#00ff00', // Green
      negative: '#ff0000', // Red
      other: '#808080'    // Gray
    };
    return colors[category] || colors.other;
  },

  getCategoryEmoji(category) {
    const emojis = {
      warning: '⚠️',
      info: 'ℹ️',
      positive: '✅',
      negative: '❌',
      other: '📌'
    };
    return emojis[category] || '📌';
  },

  getPriorityEmoji(priority) {
    const emojis = {
      low: '⬇️',
      medium: '➡️',
      high: '⬆️'
    };
    return emojis[priority] || '➡️';
  }
}; 