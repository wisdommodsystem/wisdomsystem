const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  execute: async (message, args) => {
    const publicCommands = [
      { name: 'avatar', description: 'Shows user avatar', aliases: ['A', 'a', 'Av', 'AV', 'av'] },
      { name: 'banner', description: 'Shows user banner', aliases: ['B', 'b', 'Ba', 'BA', 'ba'] },
      { name: 'userinfo', description: 'Shows user information', aliases: ['U', 'u', 'user'] },
      { name: 'bot', description: 'Shows bot information' },
      { name: 'wisdom', description: 'Shows server information' }
    ];

    const embed = new EmbedBuilder()
      .setColor('#2b2d31')
      .setTitle('📚 Help Menu')
      .setDescription('╔══════ 📚 AVAILABLE COMMANDS 📚 ══════╗\n' +
                     '║ Here are all the public commands:\n' +
                     '╚════════════════════════════════╝')
      .addFields(
        publicCommands.map(cmd => ({
          name: `🔹 ${cmd.name}`,
          value: `╔══════ 🔹 COMMAND INFO 🔹 ══════╗\n` +
                 `║ Description: ${cmd.description}\n` +
                 `║ Aliases: ${cmd.aliases ? cmd.aliases.join(', ') : 'None'}\n` +
                 `║ Usage: +${cmd.name}\n` +
                 `╚════════════════════════════════╝`,
          inline: false
        }))
      )
      .setFooter({ 
        text: 'BY Apollo For WisdomTEAM',
        iconURL: message.client.user.displayAvatarURL()
      })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
}; 