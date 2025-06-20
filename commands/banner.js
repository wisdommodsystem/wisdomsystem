const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'banner',
  aliases: ['B', 'b', 'Ba', 'BA', 'ba'],
  execute: async (message, args) => {
    const user = message.mentions.users.first() || message.author;
    const fetchedUser = await user.fetch();
    const bannerUrl = fetchedUser.bannerURL({ dynamic: true, size: 4096 });

    if (!bannerUrl) {
      return message.reply('This user does not have a banner!');
    }

    const embed = new EmbedBuilder()
      .setColor('#2b2d31')
      .setTitle(`🎨 ${user.username}'s Banner`)
      .setImage(bannerUrl)
      .setFooter({ 
        text: `Requested by ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL()
      })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
}; 