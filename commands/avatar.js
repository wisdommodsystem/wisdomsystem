const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'avatar',
  aliases: ['A', 'a', 'Av', 'AV', 'av'],
  execute: async (message, args) => {
    const user = message.mentions.users.first() || message.author;
    const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 4096 });

    const embed = new EmbedBuilder()
      .setColor('#2b2d31')
      .setTitle(`🖼️ ${user.username}'s Avatar`)
      .setImage(avatarUrl)
      .setFooter({ 
        text: `Requested by ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL()
      })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
}; 