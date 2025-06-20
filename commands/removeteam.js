const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'removeteam',
  execute: async (message, args) => {
    const ownerId = process.env.OWNER_ID;

    // Check if user is owner
    if (message.author.id !== ownerId) {
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('⛔ Access Denied')
        .setDescription('╔══════ ⛔ OWNER ONLY ⛔ ══════╗\n' +
                        '║ This command is reserved for the server owner.\n' +
                        '║ Only 🧠 Apollo can use this command.\n' +
                        '╚════════════════════════════════╝')
        .setFooter({ text: 'BY Apollo For WisdomTEAM' });
      return message.channel.send({ embeds: [embed] });
    }

    const target = message.mentions.users.first();
    if (!target) {
      return message.reply('❌ Please mention a user to remove from the team.');
    }

    try {
      const team = JSON.parse(fs.readFileSync('./config/team.json'));
      const trustedUsers = team.trustedUsers;

      if (!trustedUsers.includes(target.id)) {
        return message.reply('❌ This user is not in the trusted team.');
      }

      // Remove user from trustedUsers array
      team.trustedUsers = trustedUsers.filter(id => id !== target.id);

      // Save updated team.json
      fs.writeFileSync('./config/team.json', JSON.stringify(team, null, 2));

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Team Member Removed')
        .setDescription(`Successfully removed ${target.tag} from the trusted team.`)
        .setFooter({ text: 'BY Apollo For WisdomTEAM' });

      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error in removeteam command:', error);
      return message.reply('❌ An error occurred while removing the team member.');
    }
  }
};