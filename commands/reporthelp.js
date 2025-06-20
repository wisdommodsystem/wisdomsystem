const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'reporthelp',
  description: 'Shows how to use the report system and how it works.',
  usage: '+reporthelp',
  examples: ['+reporthelp'],
  async execute(message, args) {
    const embed = new EmbedBuilder()
      .setColor('#ffa500')
      .setTitle('🚨 Report System Help')
      .setDescription("Here's how to use the report system and how it works:")
      .addFields(
        { name: '📝 How to Report a User', value: 'Use `+report @user <reason>` to report a user. Example: `+report @user had khona mrid fkro`' },
        { name: '👮 Who Can Report', value: 'Anyone can use the report command to report a user.' },
        { name: '📬 DM Notification', value: 'When a user is reported, they receive a DM with the report details and a link to the server rules.' },
        { name: '📋 Viewing Reports', value: 'Use `+reportlist` to see all reported users, or `+reportlist @user` to see detailed reports for a specific user.' },
        { name: '🗑️ Removing Reports', value: 'Use `+reportremove @user` to remove all reports for a user. Only trusted staff, the owner, and staff members can use this command.' }
      )
      .setFooter({ text: 'Wisdom Moderation System' })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
}; 