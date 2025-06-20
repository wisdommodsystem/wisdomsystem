const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'moveall',
  execute: async (message, args) => {
    const ownerId = process.env.OWNER_ID;
    const team = JSON.parse(fs.readFileSync('./config/team.json'));
    const trustedUsers = team.trustedUsers;

    // Check if user is owner or trusted
    if (message.author.id !== ownerId && !trustedUsers.includes(message.author.id)) {
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('⛔ Access Denied')
        .setDescription('╔══════ ⛔ OWNER & TRUSTED ONLY ⛔ ══════╗\n' +
                        '║ This command is reserved for the owner and trusted users.\n' +
                        '║ Contact 🧠 Apollo for access.\n' +
                        '╚════════════════════════════════╝')
        .setFooter({ text: 'BY Apollo For WisdomTEAM' });
      return message.channel.send({ embeds: [embed] });
    }

    // Check if bot has required permissions
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
      return message.reply('❌ I need the "Move Members" permission to move users. Please ask an administrator to grant this permission.');
    }

    const targetChannelId = args[0];
    if (!targetChannelId) {
      return message.reply('❌ Please provide a channel ID to move users to.');
    }

    const targetChannel = message.guild.channels.cache.get(targetChannelId);
    if (!targetChannel) {
      return message.reply('❌ Invalid channel ID. Please provide a valid voice channel ID.');
    }

    if (targetChannel.type !== 2) { // 2 is the type for voice channels
      return message.reply('❌ The specified channel is not a voice channel.');
    }

    try {
      const movedMembers = [];
      const failedMoves = [];

      // Get all members in voice channels
      const voiceMembers = message.guild.members.cache.filter(member => 
        member.voice.channel && 
        member.voice.channel.id !== targetChannelId
      );

      for (const [, member] of voiceMembers) {
        try {
          await member.voice.setChannel(targetChannel, `Moved by ${message.author.tag}`);
          movedMembers.push(member.user.tag);
        } catch (error) {
          failedMoves.push(member.user.tag);
        }
      }

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Mass Move Complete')
        .setDescription(`Successfully moved users to ${targetChannel.name}.`)
        .addFields(
          { name: '✅ Moved Users', value: movedMembers.length > 0 ? movedMembers.join('\n') : 'None', inline: true },
          { name: '❌ Failed Moves', value: failedMoves.length > 0 ? failedMoves.join('\n') : 'None', inline: true }
        )
        .setFooter({ text: `Moved by ${message.author.tag}` });

      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Moveall error:', error);
      return message.reply(`❌ Failed to move users. Error: ${error.message}`);
    }
  }
}; 