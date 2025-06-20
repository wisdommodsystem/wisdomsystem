const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'move',
  execute: async (message, args) => {
    const ownerId = process.env.OWNER_ID;
    const team = JSON.parse(fs.readFileSync('./config/team.json'));
    const staffData = JSON.parse(fs.readFileSync('./config/staff.json'));
    const trustedUsers = team.trustedUsers;
    const staffIds = staffData.staffIds;

    // Check if user is owner, staff, or trusted
    if (message.author.id !== ownerId && !staffIds.includes(message.author.id) && !trustedUsers.includes(message.author.id)) {
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('⛔ Access Denied')
        .setDescription('╔══════ ⛔ WISDOM TEAM ONLY ⛔ ══════╗\n' +
                        '║ You are not part of the 🔥 Wisdom Team!\n' +
                        '║ This command is reserved for trusted staff.\n' +
                        '║ Contact 🧠 Apollo for access.\n' +
                        '╚════════════════════════════════╝')
        .setFooter({ text: 'BY Apollo For WisdomTEAM' });
      return message.channel.send({ embeds: [embed] });
    }

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) {
      return message.reply('❌ Please mention a user to move.');
    }

    const channelId = args[1] || message.member.voice.channelId;
    if (!channelId) {
      return message.reply('🚫 You must be in a voice channel or provide a channel ID.');
    }

    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || channel.type !== 2) {
      return message.reply('⚠️ Invalid voice channel.');
    }

    try {
      await target.voice.setChannel(channel);
      return message.reply(`🚚 Moved ${target.user.tag} to <#${channel.id}>.`);
    } catch (error) {
      return message.reply(`❌ Failed to move ${target.user.tag}. Error: ${error.message}`);
    }
  }
}; 