const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'slowmode',
  description: 'Sets the slowmode for the current channel',
  async execute(message, args) {
    // Load trusted users and staff
    const teamData = JSON.parse(fs.readFileSync('./config/team.json', 'utf8'));
    const trustedUsers = teamData.trusted || [];
    const ownerId = process.env.OWNER_ID;
    const staffData = JSON.parse(fs.readFileSync('./config/staff.json', 'utf8'));
    const staffIds = staffData.staffIds || [];

    // Check if user has permission
    if (![ownerId, ...staffIds, ...trustedUsers].includes(message.author.id)) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Access Denied')
        .setDescription('This command is reserved for the Wisdom Team only.')
        .setFooter({ text: 'Contact Apollo for access' });
      return message.reply({ embeds: [embed] });
    }

    const seconds = parseInt(args[0]);
    if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
      return message.reply('Please provide a valid number of seconds (0-21600).');
    }

    try {
      await message.channel.setRateLimitPerUser(seconds);

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Slowmode Updated')
        .setDescription(`Slowmode has been set to ${seconds} seconds`)
        .setFooter({ text: `Set by ${message.author.tag}` })
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('There was an error setting the slowmode.');
    }
  },
}; 