const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'unlock',
  description: 'Unlocks the current channel',
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
        SendMessages: true
      });

      const embed = new EmbedBuilder()
        .setColor('#00b894')
        .setTitle('🔓 Channel Unlocked')
        .setDescription(`**${message.channel}** is now open for everyone!`)
        .addFields(
          { name: 'Channel', value: `${message.channel.name}`, inline: true },
          { name: 'Server', value: `${message.guild.name}`, inline: true },
          { name: '🎉 Welcome Back!', value: 'Let the conversation flow! 🚀', inline: false }
        )
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .setImage('https://cdn.discordapp.com/attachments/1343303595881398315/1385669561096863825/Audi_Lock_and_Unlock_Micro_Interaction_Concept.gif?ex=6856e8d7&is=68559757&hm=8e8741211d8075a4371166417f3482976de0726616366f0462cac6c239f27eac&')
        .setFooter({ text: `Unlocked by ${message.author.tag} • Wisdom Circle`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#e84118')
        .setTitle('❌ Error Unlocking Channel')
        .setDescription('There was an error unlocking the channel. Please try again or contact Apollo.')
        .addFields(
          { name: 'Error', value: error.message || 'Unknown error', inline: false }
        )
        .setFooter({ text: 'Wisdom Circle • Error', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      message.reply({ embeds: [errorEmbed] });
    }
  },
}; 