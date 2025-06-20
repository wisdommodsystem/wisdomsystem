const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const Warning = require('../models/Warning');

module.exports = {
  name: 'removewarn',
  description: 'Removes all warnings for a user from the warning system.',
  usage: '+removewarn @user',
  examples: ['+removewarn @user1'],
  async execute(message, args) {
    // Load permissions
    const teamData = JSON.parse(fs.readFileSync('./config/team.json', 'utf8'));
    const trustedUsers = teamData.trusted || [];
    const ownerId = process.env.OWNER_ID;
    const staffData = JSON.parse(fs.readFileSync('./config/staff.json', 'utf8'));
    const staffIds = staffData.staffIds || [];

    if (![ownerId, ...trustedUsers, ...staffIds].includes(message.author.id)) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔒 Access Denied')
        .setDescription('This command is reserved for trusted staff only.')
        .setFooter({ text: 'Contact Apollo for access' });
      return message.reply({ embeds: [embed] });
    }

    // Check if a user was mentioned
    const target = message.mentions.users.first();
    if (!target) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Missing User')
        .setDescription('Please mention a user to remove their warnings.')
        .addFields(
          { name: '📝 Usage', value: this.usage },
          { name: '💡 Examples', value: this.examples.join('\n') }
        );
      return message.reply({ embeds: [embed] });
    }

    try {
      const result = await Warning.deleteOne({ userId: target.id });
      if (result.deletedCount === 0) {
        const embed = new EmbedBuilder()
          .setColor('#808080')
          .setTitle('📭 No Warnings Found')
          .setDescription(`No warnings found for ${target.tag}.`);
        return message.reply({ embeds: [embed] });
      }

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Warnings Removed')
        .setDescription(`All warnings for **${target.tag}** have been removed from the system.`);
      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in removewarn command:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error Removing Warnings')
        .setDescription(`There was an error removing the warnings: ${error.message}`)
        .setFooter({ text: 'Please try again or contact support if the issue persists' });
      message.reply({ embeds: [errorEmbed] });
    }
  }
}; 