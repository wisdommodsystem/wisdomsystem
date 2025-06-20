const fs = require('fs');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'team',
  execute(message) {
    const team = JSON.parse(fs.readFileSync('./config/team.json'));
    const userList = team.trustedUsers.map(id => `<@${id}>`).join(', ') || 'No trusted users.';

    return message.channel.send({
      embeds: [new EmbedBuilder()
        .setColor('Blue')
        .setTitle('👥 Trusted Users 👥')
        .setDescription(userList)
        .setThumbnail('https://example.com/team-icon.png')
        .setFooter({ text: 'BY Apollo For WisdomTEAM', iconURL: 'https://example.com/footer-icon.png' })]
    });
  }
};