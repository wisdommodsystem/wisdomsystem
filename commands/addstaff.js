const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const OWNER_ID = process.env.OWNER_ID;

module.exports = {
  name: 'addstaff',
  description: 'Add a user to staff list (Owner only)',
  usage: '+addstaff <user_id>',
  examples: ['+addstaff 123456789'],
  async execute(message, args) {
    try {
      // Check if the user is the owner
      if (message.author.id !== OWNER_ID) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Access Denied')
          .setDescription('This command can only be used by the bot owner.')
          .setFooter({ text: 'If you believe this is a mistake, please contact Apollo.' });
        return message.reply({ embeds: [errorEmbed] });
      }

      // Check if user ID is provided
      if (!args[0]) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Missing User ID')
          .setDescription('Please provide a user ID to add to staff.')
          .addFields(
            { name: 'Usage', value: '```+addstaff <user_id>```' },
            { name: 'Example', value: '```+addstaff 123456789```' }
          );
        return message.reply({ embeds: [errorEmbed] });
      }

      const userId = args[0];

      // Validate user ID format
      if (!/^\d{17,19}$/.test(userId)) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Invalid User ID')
          .setDescription('Please provide a valid Discord user ID (17-19 digits).');
        return message.reply({ embeds: [errorEmbed] });
      }

      // Read the current staff.json file
      const staffPath = path.join(__dirname, '..', 'config', 'staff.json');
      let staffData;
      try {
        staffData = JSON.parse(fs.readFileSync(staffPath, 'utf8'));
      } catch (error) {
        staffData = { staffIds: [] };
      }

      // Fallback defaults for missing properties
      const staffIds = Array.isArray(staffData.staffIds) ? staffData.staffIds : [];

      // Check if user is already in staffIds
      if (staffIds.includes(userId)) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ User Already Staff')
          .setDescription(`User ID \`${userId}\` is already in the staff list.`);
        return message.reply({ embeds: [errorEmbed] });
      }

      // Add user to staffIds
      staffIds.push(userId);
      staffData.staffIds = staffIds;

      // Save updated data
      fs.writeFileSync(staffPath, JSON.stringify(staffData, null, 2));

      // Create success embed
      const successEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ User Added to Staff')
        .setDescription(`Successfully added user ID \`${userId}\` to staff.`)
        .addFields(
          { name: 'Total Staff', value: `\`${staffIds.length}\``, inline: true },
          { name: 'Added By', value: `${message.author.tag}`, inline: true }
        )
        .setFooter({ text: 'The user now has access to staff commands.' })
        .setTimestamp();

      message.reply({ embeds: [successEmbed] });

    } catch (error) {
      console.error('Error in addstaff command:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error')
        .setDescription(`An error occurred while adding the user: ${error.message}`)
        .setFooter({ text: 'Please try again or contact support if the issue persists' });
      message.reply({ embeds: [errorEmbed] });
    }
  }
}; 