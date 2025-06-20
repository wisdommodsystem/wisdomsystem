const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const OWNER_ID = process.env.OWNER_ID;

module.exports = {
  name: 'newmod',
  description: 'Add a user to trusted users list (Owner only)',
  usage: '+newmod <user_id>',
  examples: ['+newmod 123456789'],
  async execute(message, args) {
    try {
      // Check if the user is the owner
      if (message.author.id !== OWNER_ID) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Access Denied')
          .setDescription('This command can only be used by the bot owner.')
          .setFooter({ text: 'If you believe this is an error, please contact Apollo.' });
        return message.reply({ embeds: [errorEmbed] });
      }

      // Check if user ID is provided
      if (!args[0]) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Missing User ID')
          .setDescription('Please provide a user ID to add to trusted users.')
          .addFields(
            { name: 'Usage', value: '```+newmod <user_id>```' },
            { name: 'Example', value: '```+newmod 123456789```' }
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

      // Read the current team.json file
      const teamPath = path.join(__dirname, '..', 'config', 'team.json');
      let teamData;
      
      try {
        teamData = JSON.parse(fs.readFileSync(teamPath, 'utf8'));
      } catch (error) {
        // If file doesn't exist or is invalid, create new structure
        teamData = {
          trustedUsers: [],
          staffIds: []
        };
      }

      // Check if user is already in trustedUsers
      if (teamData.trustedUsers.includes(userId)) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ User Already Trusted')
          .setDescription(`User ID \`${userId}\` is already in the trusted users list.`);
        return message.reply({ embeds: [errorEmbed] });
      }

      // Add user to trustedUsers
      teamData.trustedUsers.push(userId);

      // Save updated data
      fs.writeFileSync(teamPath, JSON.stringify(teamData, null, 2));

      // Create success embed
      const successEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ User Added to Trusted Users')
        .setDescription(`Successfully added user ID \`${userId}\` to trusted users.`)
        .addFields(
          { name: 'Total Trusted Users', value: `\`${teamData.trustedUsers.length}\``, inline: true },
          { name: 'Added By', value: `${message.author.tag}`, inline: true }
        )
        .setFooter({ text: 'The user now has access to trusted commands.' })
        .setTimestamp();

      message.reply({ embeds: [successEmbed] });

    } catch (error) {
      console.error('Error in newmod command:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error')
        .setDescription(`An error occurred while adding the user: ${error.message}`)
        .setFooter({ text: 'Please try again or contact support if the issue persists' });
      message.reply({ embeds: [errorEmbed] });
    }
  }
};
