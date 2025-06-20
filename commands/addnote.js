const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const Note = require('../models/Note');

module.exports = {
  name: 'addnote',
  description: 'Adds a note about a user',
  usage: '+addnote @user [category] [priority] [private] <note content>',
  examples: [
    '+addnote @user This is a note',
    '+addnote @user warning high This is a warning note',
    '+addnote @user positive private This is a private positive note'
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

    // Parse arguments
    const target = message.mentions.users.first();
    if (!target) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Missing User')
        .setDescription('Please mention a user to add a note about.')
        .addFields(
          { name: '📝 Usage', value: this.usage },
          { name: '💡 Examples', value: this.examples.join('\n') }
        );
      return message.reply({ embeds: [embed] });
    }

    // Parse category, priority, and privacy
    let category = 'other';
    let priority = 'medium';
    let isPrivate = false;
    let contentStartIndex = 1;

    if (args[1]) {
      const categoryArg = args[1].toLowerCase();
      if (['warning', 'info', 'positive', 'negative', 'other'].includes(categoryArg)) {
        category = categoryArg;
        contentStartIndex = 2;
      }
    }

    if (args[contentStartIndex]) {
      const priorityArg = args[contentStartIndex].toLowerCase();
      if (['low', 'medium', 'high'].includes(priorityArg)) {
        priority = priorityArg;
        contentStartIndex++;
      }
    }

    if (args[contentStartIndex]?.toLowerCase() === 'private') {
      isPrivate = true;
      contentStartIndex++;
    }

    // Get note content
    const content = args.slice(contentStartIndex).join(' ');
    if (!content) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Missing Content')
        .setDescription('Please provide content for the note.')
        .addFields(
          { name: '📝 Usage', value: this.usage },
          { name: '💡 Examples', value: this.examples.join('\n') }
        );
      return message.reply({ embeds: [embed] });
    }

    try {
      // Find or create user note document
      let userNote = await Note.findOne({ userId: target.id });
      if (!userNote) {
        userNote = new Note({
          userId: target.id,
          username: target.tag,
          notes: []
        });
      }

      // Add new note
      userNote.notes.push({
        content,
        category,
        priority,
        isPrivate,
        addedBy: message.author.id,
        addedByTag: message.author.tag,
        timestamp: new Date()
      });

      // Save to database
      await userNote.save();

      // Create success embed
      const embed = new EmbedBuilder()
        .setColor(this.getCategoryColor(category))
        .setTitle('📝 Note Added Successfully')
        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: '👤 User', value: target.tag, inline: true },
          { name: '📌 Category', value: this.getCategoryEmoji(category) + ' ' + category.toUpperCase(), inline: true },
          { name: '⚡ Priority', value: this.getPriorityEmoji(priority) + ' ' + priority.toUpperCase(), inline: true },
          { name: '🔒 Privacy', value: isPrivate ? 'Private' : 'Public', inline: true },
          { name: '📋 Content', value: content },
          { name: '👮 Added By', value: message.author.tag, inline: true },
          { name: '🕒 Timestamp', value: new Date().toLocaleString(), inline: true }
        )
        .setFooter({ text: `Total Notes: ${userNote.totalNotes}` })
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in addnote command:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error Adding Note')
        .setDescription(`There was an error adding the note: ${error.message}`)
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