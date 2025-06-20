const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const OWNER_ID = process.env.OWNER_ID;

module.exports = {
  name: 'admins',
  description: 'Shows all trusted users, staff, and the owner',
  usage: '+admins',
  examples: ['+admins'],
  async execute(message, args) {
    try {
      // Read team.json for trusted users
      const teamPath = path.join(__dirname, '..', 'config', 'team.json');
      let teamData = { trustedUsers: [] };
      try {
        teamData = JSON.parse(fs.readFileSync(teamPath, 'utf8'));
      } catch (error) {
        console.error('Error reading team.json:', error);
      }

      // Read staff.json for staff
      const staffPath = path.join(__dirname, '..', 'config', 'staff.json');
      let staffData = { staffIds: [] };
      try {
        staffData = JSON.parse(fs.readFileSync(staffPath, 'utf8'));
      } catch (error) {
        console.error('Error reading staff.json:', error);
      }

      const embed = new EmbedBuilder()
        .setColor('#ffd700')
        .setTitle('🌟 Wisdom Admin List')
        .setDescription('```\n📊 List of all trusted users, staff, and the owner\n```')
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .setFooter({ 
          text: `Requested by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      // Add owner section
      embed.addFields({
        name: '👑 Owner',
        value: `\`${OWNER_ID}\``,
        inline: false
      });

      // Add trusted users section
      const trustedUsers = Array.isArray(teamData.trustedUsers) ? teamData.trustedUsers : [];
      const trustedUsersList = trustedUsers.length > 0 
        ? trustedUsers.map(id => `\`${id}\``).join('\n')
        : 'No trusted users found.';
      
      embed.addFields({
        name: '🔒 Trusted Users',
        value: trustedUsersList,
        inline: false
      });

      // Add staff section
      const staffIds = Array.isArray(staffData.staffIds) ? staffData.staffIds : [];
      const staffList = staffIds.length > 0
        ? staffIds.map(id => `\`${id}\``).join('\n')
        : 'No staff found.';
      
      embed.addFields({
        name: '👥 Staff',
        value: staffList,
        inline: false
      });

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in admins command:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error')
        .setDescription(`An error occurred while fetching admin list: ${error.message}`)
        .setFooter({ text: 'Please try again or contact support if the issue persists' });
      message.reply({ embeds: [errorEmbed] });
    }
  }
};
