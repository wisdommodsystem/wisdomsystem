const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'lock',
  description: 'Locks the current channel',
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
        .setColor('#ff4d4d')
        .setTitle('🚫 Access Denied')
        .setDescription('**This command is reserved for the Wisdom Team only.**')
        .setThumbnail(message.client.user.displayAvatarURL())
        .addFields(
          { name: 'Need Access?', value: 'Contact Apollo for access.', inline: true },
          { name: 'Your ID', value: `${message.author.id}`, inline: true }
        )
        .setFooter({ text: 'Wisdom Circle • Security', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: false
      });

      const embed = new EmbedBuilder()
        .setColor('#2d3436')
        .setTitle('🔒 Channel Locked')
        .setDescription(`**${message.channel}** has been locked for everyone except staff.`)
        .addFields(
          { name: 'Channel', value: `${message.channel.name}`, inline: true },
          { name: 'Server', value: `${message.guild.name}`, inline: true },
          { name: '🔔 Why?', value: 'Keeping the peace and order! ✨', inline: false }
        )
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .setImage('https://cdn.discordapp.com/attachments/1343303595881398315/1385666702741864570/Lock_Screen_Animation.gif?ex=6856e62e&is=685594ae&hm=5a7ee2208459f2a15c5650dddf101606e9fffd42a1244fc68f42c253d766132b&')
        .setFooter({ text: `Locked by ${message.author.tag} • Wisdom Circle`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#e84118')
        .setTitle('❌ Error Locking Channel')
        .setDescription('There was an error locking the channel. Please try again or contact Apollo.')
        .addFields(
          { name: 'Error', value: error.message || 'Unknown error', inline: false }
        )
        .setFooter({ text: 'Wisdom Circle • Error', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      message.reply({ embeds: [errorEmbed] });
    }
  },
}; 