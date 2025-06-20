const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'timeout',
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
      return message.reply('❌ I need the "Moderate Members" permission to timeout users. Please ask an administrator to grant this permission.');
    }

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) {
      return message.reply('❌ Please mention a user to timeout.');
    }

    // Check if the target user is timeoutable
    if (!target.moderatable) {
      // Get the bot's highest role
      const botHighestRole = message.guild.members.me.roles.highest;
      // Get the target's highest role
      const targetHighestRole = target.roles.highest;

      return message.reply(`❌ I cannot timeout this user because:\n` +
                          `• My highest role (${botHighestRole.name}) is not higher than the user's highest role (${targetHighestRole.name})\n` +
                          `• Please make sure my role is above the user's role in the server settings.`);
    }

    const duration = args[1];
    if (!duration) {
      return message.reply('⏱️ Please specify timeout duration (e.g. 50m, 2h, 5d).');
    }

    // Parse duration
    const timeValue = parseInt(duration.slice(0, -1));
    const timeUnit = duration.slice(-1).toLowerCase();
    
    if (isNaN(timeValue) || timeValue <= 0) {
      return message.reply('❌ Please provide a valid number for the duration.');
    }

    let milliseconds;
    switch (timeUnit) {
      case 'm': // minutes
        milliseconds = timeValue * 60 * 1000;
        break;
      case 'h': // hours
        milliseconds = timeValue * 60 * 60 * 1000;
        break;
      case 'd': // days
        milliseconds = timeValue * 24 * 60 * 60 * 1000;
        break;
      default:
        return message.reply('❌ Invalid time unit. Use m (minutes), h (hours), or d (days).');
    }

    // Discord's maximum timeout duration is 28 days
    if (milliseconds > 28 * 24 * 60 * 60 * 1000) {
      return message.reply('❌ Timeout duration cannot exceed 28 days.');
    }

    try {
      await target.timeout(milliseconds, `Timed out by ${message.author.tag}`);
      
      // Format the duration for the response message
      let formattedDuration;
      if (timeUnit === 'm') {
        formattedDuration = `${timeValue} minute${timeValue === 1 ? '' : 's'}`;
      } else if (timeUnit === 'h') {
        formattedDuration = `${timeValue} hour${timeValue === 1 ? '' : 's'}`;
      } else if (timeUnit === 'd') {
        formattedDuration = `${timeValue} day${timeValue === 1 ? '' : 's'}`;
      }

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ User Timed Out')
        .setDescription(`Successfully timed out ${target.user.tag} for ${formattedDuration}.`)
        .setFooter({ text: `Timed out by ${message.author.tag}` });

      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Timeout error:', error);
      if (error.code === 50013) {
        return message.reply('❌ I don\'t have permission to timeout users. Please make sure I have the "Moderate Members" permission and my role is above the target user\'s role.');
      }
      return message.reply(`❌ Failed to timeout ${target.user.tag}. Error: ${error.message}`);
    }
  }
}; 