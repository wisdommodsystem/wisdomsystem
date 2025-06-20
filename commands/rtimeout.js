const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'rtimeout',
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

    // Check if bot has required permissions
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply('❌ I need the "Moderate Members" permission to remove timeouts. Please ask an administrator to grant this permission.');
    }

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) {
      return message.reply('❌ Please mention a user to remove timeout from.');
    }

    // Check if the target user is timeoutable
    if (!target.moderatable) {
      return message.reply('❌ I cannot modify this user\'s timeout. They may have higher permissions than me.');
    }

    try {
      await target.timeout(null, `Timeout removed by ${message.author.tag}`);
      return message.reply(`✅ Timeout removed from ${target.user.tag}.`);
    } catch (error) {
      if (error.code === 50013) {
        return message.reply('❌ I don\'t have permission to remove timeouts. Please make sure I have the "Moderate Members" permission and my role is above the target user\'s role.');
      }
      return message.reply(`❌ Failed to remove timeout from ${target.user.tag}. Error: ${error.message}`);
    }
  }
}; 