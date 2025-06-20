const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const Warning = require('../models/Warning');

module.exports = {
  name: 'showwarnings',
  description: 'Shows all warned members and who warned them.',
  usage: '+showwarnings [@user]',
  examples: ['+showwarnings', '+showwarnings @user1'],
  async execute(message, args) {
    // Load permissions
    const teamData = JSON.parse(fs.readFileSync('./config/team.json', 'utf8'));
    const trustedUsers = teamData.trusted || [];
    const ownerId = process.env.OWNER_ID;

    if (![ownerId, ...trustedUsers].includes(message.author.id)) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔒 Access Denied')
        .setDescription('This command is reserved for trusted staff only.')
        .setFooter({ text: 'Contact Apollo for access' });
      return message.reply({ embeds: [embed] });
    }

    // Check if a user was mentioned
    const target = message.mentions.users.first();
    if (target) {
      try {
        const userWarning = await Warning.findOne({ userId: target.id });
        if (!userWarning) {
          const embed = new EmbedBuilder()
            .setColor('#808080')
            .setTitle('📭 No Warnings Found')
            .setDescription(`No warnings found for ${target.tag}.`);
          return message.reply({ embeds: [embed] });
        }

        const embed = new EmbedBuilder()
          .setColor('#ffa500')
          .setTitle(`⚠️ Warnings for ${target.tag}`)
          .setDescription(`Total Warnings: ${userWarning.warnings.length}/3`)
          .setFooter({ text: 'If the user reaches 3 warnings, they will be kicked.' })
          .setTimestamp();

        userWarning.warnings.forEach((warning, index) => {
          embed.addFields({
            name: `Warning #${index + 1}`,
            value:
              `• Reason: ${warning.reason}\n` +
              `• Warned By: ${warning.warnerTag}\n` +
              `• Time: ${new Date(warning.timestamp).toLocaleString()}`
          });
        });

        return message.reply({ embeds: [embed] });
      } catch (error) {
        console.error('Error fetching user warnings:', error);
        const errorEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Error Viewing Warnings')
          .setDescription(`There was an error viewing the warnings: ${error.message}`)
          .setFooter({ text: 'Please try again or contact support if the issue persists' });
        return message.reply({ embeds: [errorEmbed] });
      }
    }

    // If no user mentioned, show all warned users
    try {
      const allWarnings = await Warning.find().sort({ lastWarned: -1 });
      if (!allWarnings || allWarnings.length === 0) {
        const embed = new EmbedBuilder()
          .setColor('#808080')
          .setTitle('📭 No Warnings Found')
          .setDescription('No users have been warned yet.');
        return message.reply({ embeds: [embed] });
      }

      // Paginate if many warned users
      const usersPerPage = 5;
      const pages = Math.ceil(allWarnings.length / usersPerPage);
      for (let i = 0; i < pages; i++) {
        const start = i * usersPerPage;
        const end = start + usersPerPage;
        const currentUsers = allWarnings.slice(start, end);

        const embed = new EmbedBuilder()
          .setColor('#ffa500')
          .setTitle(`⚠️ Warned Users (Page ${i + 1}/${pages})`)
          .setDescription(`Total Warned Users: ${allWarnings.length}`)
          .setFooter({ text: 'If a user reaches 3 warnings, they will be kicked.' })
          .setTimestamp();

        currentUsers.forEach(userWarning => {
          const warningCount = userWarning.warnings.length;
          const lastWarning = userWarning.warnings[warningCount - 1];
          embed.addFields({
            name: `👤 ${userWarning.username} (${userWarning.userId}) | ⚠️ Warnings: ${warningCount}/3`,
            value:
              `• Last Reason: ${lastWarning?.reason || 'N/A'}\n` +
              `• Last Warner: ${lastWarning?.warnerTag || 'N/A'}\n` +
              `• Last Time: ${lastWarning?.timestamp ? new Date(lastWarning.timestamp).toLocaleString() : 'N/A'}`
          });
        });

        await message.channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Error in showwarnings command:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error Viewing Warnings')
        .setDescription(`There was an error viewing the warnings: ${error.message}`)
        .setFooter({ text: 'Please try again or contact support if the issue persists' });
      message.reply({ embeds: [errorEmbed] });
    }
  }
}; 