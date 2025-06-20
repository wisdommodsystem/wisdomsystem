const { EmbedBuilder } = require('discord.js');
const StaffActivity = require('../models/StaffActivity');
const fs = require('fs');
const path = require('path');
const OWNER_ID = process.env.OWNER_ID;

module.exports = {
  name: 'topteam',
  description: 'Shows the top staff members by activity',
  usage: '+topteam',
  examples: ['+topteam'],
  async execute(message, args) {
    try {
      // Only allow the owner to use this command
      if (message.author.id !== OWNER_ID) {
        return message.reply('❌ This command is only available to the bot owner.');
      }

      // Get top 5 staff for each category
      const topMessages = await StaffActivity.find()
        .sort({ messages: -1 })
        .limit(5);

      const topVoice = await StaffActivity.find()
        .sort({ voiceTime: -1 })
        .limit(5);

      const topInvites = await StaffActivity.find()
        .sort({ invites: -1 })
        .limit(5);

      // Create main embed with advanced design
      const embed = new EmbedBuilder()
        .setColor('#ffd700')
        .setTitle('🌟 Wisdom Staff Activity Rankings')
        .setDescription('```\n📊 Staff performance metrics for this month\n```')
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .setFooter({ 
          text: `Requested by ${message.author.tag} • Updated every 24 hours`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      // Add message rankings with medals and progress bars
      let messageRankings = '';
      const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
      topMessages.forEach((staff, index) => {
        const progress = Math.round((staff.messages / (topMessages[0]?.messages || 1)) * 10);
        const progressBar = '█'.repeat(progress) + '░'.repeat(10 - progress);
        messageRankings += `${medals[index]} **${staff.username}**\n┣ Messages: \`${staff.messages.toLocaleString()}\`\n┗ Progress: \`${progressBar}\`\n\n`;
      });
      embed.addFields({
        name: '📝 Message Activity',
        value: messageRankings || '```\nNo data available\n```',
        inline: true
      });

      // Add voice time rankings with better formatting and progress bars
      let voiceRankings = '';
      topVoice.forEach((staff, index) => {
        const totalMinutes = staff.voiceTime;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;

        let timeString = '';
        if (days > 0) timeString += `${days}d `;
        if (remainingHours > 0) timeString += `${remainingHours}h `;
        if (minutes > 0) timeString += `${minutes}m`;

        const progress = Math.round((staff.voiceTime / (topVoice[0]?.voiceTime || 1)) * 10);
        const progressBar = '█'.repeat(progress) + '░'.repeat(10 - progress);
        voiceRankings += `${medals[index]} **${staff.username}**\n┣ Time: \`${timeString}\`\n┗ Progress: \`${progressBar}\`\n\n`;
      });
      embed.addFields({
        name: '🎤 Voice Activity',
        value: voiceRankings || '```\nNo data available\n```',
        inline: true
      });

      // Add invite rankings with progress bars
      let inviteRankings = '';
      topInvites.forEach((staff, index) => {
        const progress = Math.round((staff.invites / (topInvites[0]?.invites || 1)) * 10);
        const progressBar = '█'.repeat(progress) + '░'.repeat(10 - progress);
        inviteRankings += `${medals[index]} **${staff.username}**\n┣ Invites: \`${staff.invites.toLocaleString()}\`\n┗ Progress: \`${progressBar}\`\n\n`;
      });
      embed.addFields({
        name: '📨 Invite Activity',
        value: inviteRankings || '```\nNo data available\n```',
        inline: true
      });

      // Add a note about the ranking system
      embed.addFields({
        name: '📊 Ranking System',
        value: '```\n• Rankings are updated daily\n• Voice time is tracked in minutes\n• Message count includes all channels\n• Only active staff are shown\n```',
        inline: false
      });

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in topteam command:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error Fetching Staff Rankings')
        .setDescription(`There was an error fetching the staff rankings: ${error.message}`)
        .setFooter({ text: 'Please try again or contact support if the issue persists' });
      message.reply({ embeds: [errorEmbed] });
    }
  }
};