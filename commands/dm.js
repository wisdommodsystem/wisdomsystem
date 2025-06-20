const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'dm',
  description: 'Sends a direct message to a user',
  async execute(message, args) {
    // Load trusted users
    const teamData = JSON.parse(fs.readFileSync('./config/team.json', 'utf8'));
    const trustedUsers = teamData.trusted || [];
    const ownerId = process.env.OWNER_ID;

    // Check if user has permission (only owner and trusted users)
    if (![ownerId, ...trustedUsers].includes(message.author.id)) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Access Denied')
        .setDescription('This command is reserved for the bot owner and trusted users only.')
        .setFooter({ text: 'Contact Apollo for access' });
      return message.reply({ embeds: [embed] });
    }

    const target = message.mentions.members.first();
    if (!target) {
      return message.reply('Please mention a user to send a message to.');
    }

    const dmContent = args.slice(1).join(' ');
    if (!dmContent) {
      return message.reply('Please provide a message to send.');
    }

    try {
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Message from Wisdom Team')
        .setDescription(dmContent)
        .setFooter({ text: `Sent by ${message.author.tag}` })
        .setTimestamp();

      await target.send({ embeds: [embed] });

      const confirmEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Message Sent')
        .setDescription(`Successfully sent message to ${target.user.tag}`)
        .addFields(
          { name: 'Message', value: dmContent }
        )
        .setFooter({ text: `Sent by ${message.author.tag}` })
        .setTimestamp();

      message.reply({ embeds: [confirmEmbed] });
    } catch (error) {
      console.error(error);
      message.reply('Failed to send the message. The user might have DMs disabled.');
    }
  },
}; 