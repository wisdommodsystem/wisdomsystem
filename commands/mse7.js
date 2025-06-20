const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'mse7',
  execute: async (message, args) => {
    const ownerId = process.env.OWNER_ID;
    const team = JSON.parse(fs.readFileSync('./config/team.json'));
    const trustedUsers = team.trustedUsers;

    // Check if user is owner or trusted
    if (message.author.id !== ownerId && !trustedUsers.includes(message.author.id)) {
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('⛔ Access Denied')
        .setDescription('╔══════ ⛔ OWNER & TRUSTED ONLY ⛔ ══════╗\n' +
                        '║ This command is reserved for the owner and trusted users.\n' +
                        '║ Contact 🧠 Apollo for access.\n' +
                        '╚════════════════════════════════╝')
        .setFooter({ text: 'BY Apollo For WisdomTEAM' });
      return message.channel.send({ embeds: [embed] });
    }

    // Check if bot has required permissions
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('❌ I need the "Manage Messages" permission to delete messages. Please ask an administrator to grant this permission.');
    }

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount <= 0 || amount > 100) {
      return message.reply('❌ Please provide a valid number between 1 and 100.');
    }

    try {
      // Delete the command message first
      await message.delete();

      // Fetch and delete messages
      const messages = await message.channel.messages.fetch({ limit: amount });
      const deletedMessages = await message.channel.bulkDelete(messages, true);

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Messages Deleted')
        .setDescription(`Successfully deleted ${deletedMessages.size} messages.`)
        .setFooter({ text: `Deleted by ${message.author.tag}` });

      const confirmation = await message.channel.send({ embeds: [embed] });
      
      // Delete the confirmation message after 5 seconds
      setTimeout(() => {
        confirmation.delete().catch(console.error);
      }, 5000);

    } catch (error) {
      console.error('Mse7 error:', error);
      if (error.code === 10008) {
        return message.reply('❌ Some messages are too old to be deleted (older than 14 days).');
      }
      return message.reply(`❌ Failed to delete messages. Error: ${error.message}`);
    }
  }
}; 