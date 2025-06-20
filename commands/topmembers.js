const { EmbedBuilder } = require('discord.js');
const StaffActivity = require('../models/StaffActivity');

module.exports = {
  name: 'topmembers',
  description: 'Shows top 10 members by voice time and messages',
  usage: '+topmembers',
  examples: ['+topmembers'],
  async execute(message, args) {
    try {
      // Get all staff activity data
      const allStaff = await StaffActivity.find().sort({ voiceTime: -1, messages: -1 });

      // Calculate combined score (voice time + messages)
      const staffWithScore = allStaff.map(staff => ({
        ...staff.toObject(),
        combinedScore: (staff.voiceTime * 0.6) + (staff.messages * 0.4) // Weight voice time more heavily
      }));

      // Sort by combined score
      const topOverall = staffWithScore
        .sort((a, b) => b.combinedScore - a.combinedScore)
        .slice(0, 10);

      // Get top 10 members for each category
      const topMessages = await StaffActivity.find()
        .sort({ messages: -1 })
        .limit(10);

      const topVoice = await StaffActivity.find()
        .sort({ voiceTime: -1 })
        .limit(10);

      // Create main embed with advanced design
      const embed = new EmbedBuilder()
        .setColor('#ff69b4')
        .setTitle('👑 Top 10 Server Members')
        .setDescription('```\n🌟 Most active members this month\n```')
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .setFooter({ 
          text: `Requested by ${message.author.tag} • Updated every 24 hours`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      // Add overall top 10 list
      let overallRankings = '';
      topOverall.forEach((staff, index) => {
        const totalMinutes = staff.voiceTime;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;

        let timeString = '';
        if (days > 0) timeString += `${days}d `;
        if (remainingHours > 0) timeString += `${remainingHours}h `;
        if (minutes > 0) timeString += `${minutes}m`;

        const progress = Math.round((staff.combinedScore / (topOverall[0]?.combinedScore || 1)) * 15);
        const progressBar = '█'.repeat(progress) + '░'.repeat(15 - progress);
        
        overallRankings += `**#${index + 1}** ${staff.username}\n┣ Messages: \`${staff.messages.toLocaleString()}\`\n┣ Voice: \`${timeString}\`\n┗ Score: \`${progressBar}\`\n\n`;
      });

      embed.addFields({
        name: '🏆 Top 10 Overall Members',
        value: overallRankings || '```\nNo data available\n```',
        inline: false
      });

      // Add message rankings with numbers and progress bars
      let messageRankings = '';
      topMessages.forEach((staff, index) => {
        const progress = Math.round((staff.messages / (topMessages[0]?.messages || 1)) * 15);
        const progressBar = '█'.repeat(progress) + '░'.repeat(15 - progress);
        messageRankings += `**#${index + 1}** ${staff.username}\n┣ Messages: \`${staff.messages.toLocaleString()}\`\n┗ Progress: \`${progressBar}\`\n\n`;
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

        const progress = Math.round((staff.voiceTime / (topVoice[0]?.voiceTime || 1)) * 15);
        const progressBar = '█'.repeat(progress) + '░'.repeat(15 - progress);
        voiceRankings += `**#${index + 1}** ${staff.username}\n┣ Time: \`${timeString}\`\n┗ Progress: \`${progressBar}\`\n\n`;
      });
      embed.addFields({
        name: '🎤 Top Voice Time',
        value: voiceRankings || '```\nNo data available\n```',
        inline: true
      });

      // Add a note about the ranking system
      embed.addFields({
        name: '📊 Ranking System',
        value: '```\n• Overall ranking combines voice time (60%) and messages (40%)\n• Voice time is tracked in minutes\n• Message count includes all channels\n• Only active members are shown\n• Rankings are updated daily\n```',
        inline: false
      });

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in topmembers command:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error Fetching Top Members')
        .setDescription(`There was an error fetching the top members: ${error.message}`)
        .setFooter({ text: 'Please try again or contact support if the issue persists' });
      message.reply({ embeds: [errorEmbed] });
    }
  }
};
