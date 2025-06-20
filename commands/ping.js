const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  execute: async (message, args) => {
    try {
      const ping = Date.now() - message.createdTimestamp;
      const apiPing = Math.round(message.client.ws.ping);

      const embed = new EmbedBuilder()
        .setColor('#00ffff')
        .setTitle('📡 WISDOM BOT STATUS')
        .setDescription(`
✅ **Status:** Online and Operational  
📶 **Bot Ping:** \`${ping}ms\`  
🌐 **API Latency:** \`${apiPing}ms\`  
💡 **Uptime:** <t:${Math.floor(message.client.readyTimestamp / 1000)}:R>  
🧠 **Developer:** Apollo (The GOAT)
        `)
        .setThumbnail(message.client.user.displayAvatarURL())
        .setFooter({ text: 'BY Apollo For WisdomTEAM 🚀', iconURL: 'https://cdn-icons-png.flaticon.com/512/1055/1055646.png' })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error in ping command:', error);
      message.reply('❌ There was an error executing the ping command.');
    }
  }
};