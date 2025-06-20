const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'invites',
  aliases: ['inv'],
  description: 'Shows how many people a user has invited',
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

    const target = message.mentions.users.first();
    if (!target) {
      return message.reply('Please mention a user to check their invites.');
    }

    try {
      const invites = await message.guild.invites.fetch();
      const userInvites = invites.filter(inv => inv.inviter && inv.inviter.id === target.id);
      const totalInvites = userInvites.reduce((acc, invite) => acc + invite.uses, 0);

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle(`Invite Statistics for ${target.username}`)
        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Total Invites', value: totalInvites.toString(), inline: true },
          { name: 'Active Invites', value: userInvites.size.toString(), inline: true }
        )
        .setFooter({ text: `Requested by ${message.author.tag}` })
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('There was an error fetching invite data.');
    }
  },
}; 