const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const Report = require('../models/Report');

module.exports = {
  name: 'reportremove',
  description: 'Removes all reports for a user from the report system',
  usage: '+reportremove @user',
  examples: ['+reportremove @user'],
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

    // Check if a user was mentioned
    const target = message.mentions.users.first();
    if (!target) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Missing User')
        .setDescription('Please mention a user to remove their reports.')
        .addFields(
          { name: '📝 Usage', value: this.usage },
          { name: '💡 Examples', value: this.examples.join('\n') }
        );
      return message.reply({ embeds: [embed] });
    }

    try {
      const result = await Report.deleteOne({ userId: target.id });
      if (result.deletedCount === 0) {
        const embed = new EmbedBuilder()
          .setColor('#808080')
          .setTitle('📭 No Reports Found')
          .setDescription(`No reports found for ${target.tag}.`);
        return message.reply({ embeds: [embed] });
      }

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Reports Removed')
        .setDescription(`All reports for **${target.tag}** have been removed from the system.`);
      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in reportremove command:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error Removing Reports')
        .setDescription(`There was an error removing the reports: ${error.message}`)
        .setFooter({ text: 'Please try again or contact support if the issue persists' });
      message.reply({ embeds: [errorEmbed] });
    }
  }
}; 