const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'bot',
  execute: async (message, args) => {
    const client = message.client;
    
    // Get all servers the bot is in
    const servers = client.guilds.cache.map(guild => ({
      name: guild.name,
      memberCount: guild.memberCount,
      id: guild.id
    }));

    // Create server list string
    const serverList = servers.map((server, index) => 
      `${index + 1}. ${server.name} (${server.memberCount} members)`
    ).join('\n');

    const embed = new EmbedBuilder()
      .setColor('#2b2d31')
      .setTitle('🤖 Wisdom Bot Information')
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .addFields(
        { 
          name: '👨‍💻 Creator Information',
          value: '╔══════ 👨‍💻 CREATOR INFO 👨‍💻 ══════╗\n' +
                 '║ Created by: Apollo\n' +
                 '║ Contact for Discord Bots:\n' +
                 '║ [Instagram](https://www.instagram.com/apollo_bevedere2)\n' +
                 '╚════════════════════════════════╝',
          inline: false
        },
        {
          name: '📊 Bot Statistics',
          value: `╔══════ 📊 BOT STATS 📊 ══════╗\n` +
                 `║ Servers: ${client.guilds.cache.size}\n` +
                 `║ Users: ${client.users.cache.size}\n` +
                 `║ Commands: ${client.commands.size}\n` +
                 `║ Ping: ${client.ws.ping}ms\n` +
                 `╚════════════════════════════════╝`,
          inline: false
        },
        {
          name: '🏠 Servers',
          value: serverList.length > 1024 
            ? 'Too many servers to display!' 
            : `╔══════ 🏠 SERVER LIST 🏠 ══════╗\n${serverList}\n╚════════════════════════════════╝`,
          inline: false
        }
      )
      .setFooter({ 
        text: 'BY Apollo For WisdomTEAM',
        iconURL: client.user.displayAvatarURL()
      })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
}; 