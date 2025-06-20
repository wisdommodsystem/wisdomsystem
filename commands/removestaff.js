const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'removestaff',
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
      return message.reply('❌ Please mention a user to remove from staff.');
    }

    try {
      // Read current staff list
      const staffData = JSON.parse(fs.readFileSync('./config/staff.json'));
      
      // Check if user is staff
      if (!staffData.staffIds.includes(target.id)) {
        return message.reply(`❌ ${target.tag} is not a staff member.`);
      }

      // Remove staff member
      staffData.staffIds = staffData.staffIds.filter(id => id !== target.id);
      
      // Save updated staff list
      fs.writeFileSync('./config/staff.json', JSON.stringify(staffData, null, 2));

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Staff Member Removed')
        .setDescription(`Successfully removed ${target.tag} from the staff team.`)
        .setFooter({ text: `Removed by ${message.author.tag}` });

      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Removestaff error:', error);
      return message.reply(`❌ Failed to remove staff member. Error: ${error.message}`);
    }
  }
}; 