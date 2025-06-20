const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'roleadd',
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
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.reply('❌ I need the "Manage Roles" permission to add roles. Please ask an administrator to grant this permission.');
    }

    const target = message.mentions.members.first();
    if (!target) {
      return message.reply('❌ Please mention a user to add the role to.');
    }

    const role = message.mentions.roles.first();
    if (!role) {
      return message.reply('❌ Please mention a role to add.');
    }

    // Check if the bot's highest role is higher than the role being added
    if (message.guild.members.me.roles.highest.position <= role.position) {
      return message.reply('❌ I cannot add this role because it is higher than or equal to my highest role.');
    }

    try {
      // Check if user already has the role
      if (target.roles.cache.has(role.id)) {
        return message.reply(`❌ ${target.user.tag} already has the ${role.name} role.`);
      }

      await target.roles.add(role, `Role added by ${message.author.tag}`);
      
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Role Added')
        .setDescription(`Successfully added ${role.name} to ${target.user.tag}.`)
        .setFooter({ text: `Added by ${message.author.tag}` });

      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Roleadd error:', error);
      return message.reply(`❌ Failed to add role. Error: ${error.message}`);
    }
  }
}; 