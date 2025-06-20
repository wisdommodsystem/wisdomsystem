const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'mute',
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
      return message.reply('❌ Please mention a user to mute.');
    }

    try {
      await target.edit({ mute: true });
      return message.reply(`🔇 ${target.user.tag} has been server muted.`);
    } catch (error) {
      return message.reply(`❌ Failed to mute ${target.user.tag}. Error: ${error.message}`);
    }
  }
}; 