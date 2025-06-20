const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'userinfo',
  aliases: ['U', 'u', 'user'],
  execute: async (message, args) => {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);
    const roles = member.roles.cache
      .filter(role => role.id !== message.guild.id)
      .map(role => role.toString())
      .join(', ') || 'No roles';

    const embed = new EmbedBuilder()
      .setColor('#2b2d31')
      .setTitle(`👤 User Information`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .addFields(
        { 
          name: '👤 User',
          value: `╔══════ 👤 USER INFO 👤 ══════╗\n` +
                 `║ Username: ${user.tag}\n` +
                 `║ ID: ${user.id}\n` +
                 `║ Created: <t:${Math.floor(user.createdTimestamp / 1000)}:R>\n` +
                 `╚════════════════════════════════╝`,
          inline: false
        },
        {
          name: '📊 Member',
          value: `╔══════ 📊 MEMBER INFO 📊 ══════╗\n` +
                 `║ Joined: <t:${Math.floor(member.joinedTimestamp / 1000)}:R>\n` +
                 `║ Nickname: ${member.nickname || 'None'}\n` +
                 `║ Roles: ${roles}\n` +
                 `╚════════════════════════════════╝`,
          inline: false
        }
      )
      .setFooter({ 
        text: `Requested by ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL()
      })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
}; 