const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'warninghelp',
  description: 'Shows how to use the warning system and how it works.',
  usage: '+warninghelp',
  examples: ['+warninghelp'],
  async execute(message, args) {
    const embed = new EmbedBuilder()
      .setColor('#ffa500')
      .setTitle('⚠️ Warning System Help')
      .setDescription("Here's how to use the warning system and how it works:")
      .addFields(
        { name: '📝 How to Warn a User', value: 'Use `+warn @user <reason>` to warn a user. Example: `+warn @user Spamming`' },
        { name: '👮 Who Can Warn', value: 'Only trusted staff, the owner, and staff members can use the warn command.' },
        { name: '📊 Warning Limits', value: 'Users can receive up to 3 warnings. If they reach 3 warnings, they will be kicked from the server.' },
        { name: '📬 DM Notification', value: 'When a user is warned, they receive a DM with the warning count and a link to the server rules.' },
        { name: '📋 Viewing Warnings', value: 'Use `+showwarnings` to see all warned users, or `+showwarnings @user` to see detailed warnings for a specific user.' },
        { name: '🗑️ Removing Warnings', value: 'Use `+removewarn @user` to remove all warnings for a user. Only trusted staff, the owner, and staff members can use this command.' }
      )
      .setFooter({ text: 'Wisdom Moderation System' })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
}; 