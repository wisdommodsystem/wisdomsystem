const { EmbedBuilder } = require('discord.js');
const StaffActivity = require('../models/StaffActivity');

module.exports = {
  name: 'leaderboard',
  description: 'Shows the top members by voice time and messages',
  aliases: ['l', 'L', 'leader'],
  usage: '+leaderboard',
  examples: ['+leaderboard', '+l', '+L', '+leader'],
  async execute(message, args) {
    try {
      // Get top members for each category
      const topMessages = await StaffActivity.find()
        .sort({ messages: -1 })
        .limit(3);

      const topVoice = await StaffActivity.find()
        .sort({ voiceTime: -1 })
        .limit(3);

      // Create main embed with advanced design
      const embed = new EmbedBuilder()
        .setColor('#00bfff')
        .setTitle('🏆 Server Leaderboard')
        .setDescription('```\n🌟 Top performing members this month\n```')
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .setFooter({ 
          text: `Requested by ${message.author.tag} • Updated every 24 hours`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      // Add message rankings with medals and progress bars
      let messageRankings = '';
      const medals = ['🥇', '🥈', '🥉'];
      topMessages.forEach((staff, index) => {
        const progress = Math.round((staff.messages / (topMessages[0]?.messages || 1)) * 10);
        const progressBar = '█'.repeat(progress) + '░'.repeat(10 - progress);
        messageRankings += `${medals[index]} **${staff.username}**\n┣ Messages: \`${staff.messages.toLocaleString()}\`\n┗ Progress: \`${progressBar}\`\n\n`;
      });
      embed.addFields({
        name: '📝 Top Message Senders',
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
        name: '🎤 Top Voice Time',
        value: voiceRankings || '```\nNo data available\n```',
        inline: true
      });

      // Add a note about the ranking system
      embed.addFields({
        name: '📊 How to Rank Up',
        value: '```\n• Be active in voice channels\n• Participate in text channels\n• Interact with other members\n• Help and support others\n```',
        inline: false
      });

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in leaderboard command:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error Fetching Leaderboard')
        .setDescription(`There was an error fetching the leaderboard: ${error.message}`)
        .setFooter({ text: 'Please try again or contact support if the issue persists' });
      message.reply({ embeds: [errorEmbed] });
    }
  }
}; 