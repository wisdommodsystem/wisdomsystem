const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'smiya',
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
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
      return message.reply('❌ I need the "Manage Nicknames" permission to change nicknames. Please ask an administrator to grant this permission.');
    }

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) {
      return message.reply('❌ Please mention a user to change their nickname.');
    }

    // Check if the target user's nickname is changeable
    if (!target.manageable) {
      return message.reply('❌ I cannot change this user\'s nickname. They may have higher permissions than me.');
    }

    const newNickname = args.slice(1).join(' ');
    if (!newNickname) {
      return message.reply('❌ Please provide a new nickname.');
    }

    try {
      await target.setNickname(newNickname, `Nickname changed by ${message.author.tag}`);
      return message.reply(`✅ Changed ${target.user.tag}'s nickname to "${newNickname}".`);
    } catch (error) {
      if (error.code === 50013) {
        return message.reply('❌ I don\'t have permission to change nicknames. Please make sure I have the "Manage Nicknames" permission and my role is above the target user\'s role.');
      }
      return message.reply(`❌ Failed to change nickname. Error: ${error.message}`);
    }
  }
}; 