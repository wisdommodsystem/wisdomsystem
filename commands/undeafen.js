const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'undeafen',
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
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.DeafenMembers)) {
      return message.reply('❌ I need the "Deafen Members" permission to undeafen users. Please ask an administrator to grant this permission.');
    }

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) {
      return message.reply('❌ Please mention a user to undeafen.');
    }

    // Check if the target user is in a voice channel
    if (!target.voice.channel) {
      return message.reply('❌ The target user must be in a voice channel.');
    }

    // Check if the target user is moderatable
    if (!target.moderatable) {
      // Get the bot's highest role
      const botHighestRole = message.guild.members.me.roles.highest;
      // Get the target's highest role
      const targetHighestRole = target.roles.highest;

      return message.reply(`❌ I cannot undeafen this user because:\n` +
                          `• My highest role (${botHighestRole.name}) is not higher than the user's highest role (${targetHighestRole.name})\n` +
                          `• Please make sure my role is above the user's role in the server settings.`);
    }

    try {
      // Check if user is already undeafened
      if (!target.voice.serverDeaf) {
        return message.reply('❌ This user is not server deafened.');
      }

      // Undeafen the user
      await target.voice.setDeaf(false, `Undeafened by ${message.author.tag}`);
      
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ User Undeafened')
        .setDescription(`Successfully undeafened ${target.user.tag}.`)
        .setFooter({ text: `Undeafened by ${message.author.tag}` });

      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Undeafen error:', error);
      if (error.code === 50013) {
        return message.reply('❌ I don\'t have permission to undeafen users. Please make sure I have the "Deafen Members" permission and my role is above the target user\'s role.');
      }
      return message.reply(`❌ Failed to undeafen ${target.user.tag}. Error: ${error.message}`);
    }
  }
}; 