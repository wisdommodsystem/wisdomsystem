const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'gol',
  execute: async (message, args) => {
    const ownerId = process.env.OWNER_ID;

    // Check if the user is the owner
    if (message.author.id !== ownerId) {
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('⛔ Access Denied')
        .setDescription('╔══════ ⛔ OWNER ONLY ⛔ ══════╗\n' +
                        '║ This command is reserved for the owner only!\n' +
                        '║ Only Apollo can use this command.\n' +
                        '╚════════════════════════════════╝')
        .setFooter({ text: 'BY Apollo For WisdomTEAM' });
      return message.channel.send({ embeds: [embed] });
    }

    // Get the message content after the command
    const content = args.join(' ');
    if (!content) {
      return message.reply('❌ Please provide a message to send.');
    }

    try {
      const embed = new EmbedBuilder()
        .setColor('#00ffff')
        .setDescription(content)
        .setFooter({ text: 'BY Apollo For WisdomTEAM 🚀', iconURL: 'https://cdn-icons-png.flaticon.com/512/1055/1055646.png' })
        .setTimestamp();

      // Delete the original command message
      await message.delete().catch(console.error);

      // Send the embedded message
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error in gol command:', error);
      message.reply('❌ There was an error sending the message.').catch(console.error);
    }
  }
}; 