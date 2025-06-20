const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'verifyall',
  description: 'Gives a role to all server members',
  async execute(message, args) {
    // Load trusted users and staff
    const teamData = JSON.parse(fs.readFileSync('./config/team.json', 'utf8'));
    const trustedUsers = teamData.trusted || [];
    const ownerId = process.env.OWNER_ID;

    // Check if user has permission
    if (![ownerId, ...staffIds, ...trustedUsers].includes(message.author.id)) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Access Denied')
        .setDescription('This command is reserved for the Wisdom Team only.')
        .setFooter({ text: 'Contact Apollo for access' });
      return message.reply({ embeds: [embed] });
    }

    const role = message.mentions.roles.first();
    if (!role) {
      return message.reply('Please mention a role to give to all members.');
    }

    const statusEmbed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('Mass Role Assignment')
      .setDescription(`Starting to give ${role.name} to all members...`)
      .setFooter({ text: 'This may take a while' });

    const statusMsg = await message.reply({ embeds: [statusEmbed] });

    try {
      let successCount = 0;
      let failCount = 0;

      const members = await message.guild.members.fetch();
      for (const [, member] of members) {
        try {
          if (!member.roles.cache.has(role.id)) {
            await member.roles.add(role);
            successCount++;
          }
        } catch (error) {
          failCount++;
          console.error(`Failed to add role to ${member.user.tag}:`, error);
        }
      }

      const resultEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Mass Role Assignment Complete')
        .addFields(
          { name: 'Successfully Added', value: successCount.toString(), inline: true },
          { name: 'Failed', value: failCount.toString(), inline: true },
          { name: 'Role', value: role.name, inline: true }
        )
        .setFooter({ text: `Executed by ${message.author.tag}` })
        .setTimestamp();

      statusMsg.edit({ embeds: [resultEmbed] });
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Error')
        .setDescription('An error occurred while assigning roles.')
        .setFooter({ text: 'Check console for details' });

      statusMsg.edit({ embeds: [errorEmbed] });
    }
  },
}; 