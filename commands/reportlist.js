const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const Report = require('../models/Report');

module.exports = {
  name: 'reportlist',
  description: 'Shows all users who have been reported and their reports',
  usage: '+reportlist',
  examples: ['+reportlist'],
  async execute(message, args) {
    // Load trusted users
    const teamData = JSON.parse(fs.readFileSync('./config/team.json', 'utf8'));
    const trustedUsers = teamData.trusted || [];
    const ownerId = process.env.OWNER_ID;

    // Check if user has permission
    if (![ownerId, ...trustedUsers].includes(message.author.id)) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔒 Access Denied')
        .setDescription('This command is reserved for trusted staff only.')
        .setFooter({ text: 'Contact Apollo for access' });
      return message.reply({ embeds: [embed] });
    }

    // Check MongoDB connection
    if (!global.mongoConnected) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Database Error')
        .setDescription('The database is currently not connected. Please try again in a few moments.')
        .setFooter({ text: 'Contact support if the issue persists' });
      return message.reply({ embeds: [embed] });
    }

    try {
      const allReports = await Report.find().sort({ lastReported: -1 });
      if (!allReports || allReports.length === 0) {
        const embed = new EmbedBuilder()
          .setColor('#808080')
          .setTitle('📭 No Reports Found')
          .setDescription('No users have been reported yet.')
          .setFooter({ text: 'Use +report to report a user' });
        return message.reply({ embeds: [embed] });
      }

      // Paginate if there are many reported users
      const usersPerPage = 5;
      const pages = Math.ceil(allReports.length / usersPerPage);
      for (let i = 0; i < pages; i++) {
        const start = i * usersPerPage;
        const end = start + usersPerPage;
        const currentUsers = allReports.slice(start, end);

        const embed = new EmbedBuilder()
          .setColor('#ffa500')
          .setTitle(`🚨 Reported Users (Page ${i + 1}/${pages})`)
          .setDescription(`Total Reported Users: ${allReports.length}`)
          .setFooter({ text: 'Use +report to report a user' })
          .setTimestamp();

        currentUsers.forEach(userReport => {
          const reportCount = userReport.reports.length;
          const lastReason = userReport.reports[reportCount - 1]?.reason || 'N/A';
          const lastReporter = userReport.reports[reportCount - 1]?.reporterTag || 'N/A';
          const lastTime = userReport.reports[reportCount - 1]?.timestamp ? new Date(userReport.reports[reportCount - 1].timestamp).toLocaleString() : 'N/A';

          embed.addFields({
            name: `👤 ${userReport.username} (${userReport.userId})` + ` | 📝 Reports: ${reportCount}`,
            value:
              `• Last Reason: ${lastReason}\n` +
              `• Last Reporter: ${lastReporter}\n` +
              `• Last Time: ${lastTime}\n` +
              `• [Click to see all details with +reportlist ${userReport.userId}]`
          });
        });

        await message.channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Error in reportlist command:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error Viewing Reports')
        .setDescription(`There was an error viewing the reports: ${error.message}`)
        .setFooter({ text: 'Please try again or contact support if the issue persists' });
      message.reply({ embeds: [errorEmbed] });
    }
  }
}; 