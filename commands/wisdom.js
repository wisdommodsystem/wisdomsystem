const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'wisdom',
  execute: async (message, args) => {
    const server = message.guild;
    const owner = await server.fetchOwner();
    const totalMembers = server.memberCount;
    const onlineMembers = server.members.cache.filter(member => member.presence?.status === 'online').size;
    const totalChannels = server.channels.cache.size;
    const totalRoles = server.roles.cache.size;
    const createdAt = server.createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const embed = new EmbedBuilder()
      .setColor('#2b2d31')
      .setTitle(`📊 ${server.name} Server Information`)
      .setThumbnail(server.iconURL({ dynamic: true, size: 1024 }))
      .addFields(
        { name: '👑 Server Owner', value: `${owner.user.tag}`, inline: true },
        { name: '🆔 Server ID', value: server.id, inline: true },
        { name: '📅 Created On', value: createdAt, inline: true },
        { name: '👥 Members', value: `Total: ${totalMembers}\nOnline: ${onlineMembers}`, inline: true },
        { name: '📝 Channels', value: `Total: ${totalChannels}`, inline: true },
        { name: '🎭 Roles', value: totalRoles.toString(), inline: true }
      )
      .setFooter({ text: 'BY Apollo For WisdomTEAM' })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};