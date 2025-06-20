const { EmbedBuilder } = require('discord.js');
const voiceStateUpdate = require('../events/voiceStateUpdate');

module.exports = {
  name: 'tracktimer',
  description: 'Toggle the voice channel tracking system on or off (Owner only)',
  aliases: ['track', 'toggletrack'],
  async execute(message, args) {
    // Check if user is the bot owner
    const ownerId = process.env.OWNER_ID;
    if (message.author.id !== ownerId) {
      const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('🚫 Access Denied')
        .setDescription('**This command is restricted to the bot owner only.**')
        .setFooter({ text: 'System Tracker by Apollo • Wisdom Circle', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    try {
      const currentStatus = voiceStateUpdate.isTrackingEnabled();
      const newStatus = !currentStatus;
      // Toggle the tracking system
      voiceStateUpdate.setTrackingEnabled(newStatus);

      // Gradient color effect (pick a nice blue/purple)
      const color = newStatus ? '#6a82fb' : '#fc5c7d';
      const statusEmoji = newStatus ? '🟢' : '🔴';
      const statusText = newStatus ? 'Tracking Enabled' : 'Tracking Disabled';
      const statusDesc = newStatus
        ? 'Voice channel tracking is now **active**! All users will be tracked and logged.'
        : 'Voice channel tracking has been **paused**. No new tracking will occur until re-enabled.';
      const divider = '━━━━━━━━━━━━━━━━━━━━';

      const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(`${statusEmoji} ${statusText}`)
        .setDescription(`**${divider}**\n${statusDesc}\n**${divider}**`)
        .addFields(
          { name: '🎤 System Status', value: newStatus ? '`🟢 Active`' : '`🔴 Inactive`', inline: true },
          { name: '👑 Owner', value: `<@${ownerId}>`, inline: true },
          { name: '⏰ Toggled At', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: true },
        )
        .addFields(
          { name: '✨ Visual', value: newStatus ? '```diff\n+ Tracking is ON!\n```' : '```fix\n- Tracking is OFF!\n```', inline: false },
        )
        .setThumbnail(message.client.user.displayAvatarURL())
        .setImage(newStatus
          ? 'https://i.imgur.com/8Km9tLL.gif' // blue/purple gradient bar
          : 'https://i.imgur.com/3ZUrjUP.gif' // red/pink gradient bar
        )
        .setFooter({ text: 'System Tracker by Apollo • Wisdom Circle', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
      // Log the action
      console.log(`Voice tracking ${newStatus ? 'enabled' : 'disabled'} by ${message.author.tag}`);
    } catch (error) {
      console.error('Error toggling voice tracking:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('❌ Error')
        .setDescription('An error occurred while toggling the tracking system.')
        .addFields(
          { name: '🔧 Error', value: error.message, inline: false }
        )
        .setFooter({ text: 'System Tracker by Apollo • Wisdom Circle', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      await message.reply({ embeds: [errorEmbed] });
    }
  }
}; 