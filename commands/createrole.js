const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'createrole',
  description: 'Creates a role without any permissions.',
  usage: '+createrole <role name>',
  examples: ['+createrole New Role'],
  async execute(message, args) {
    // Load permissions
    const teamData = JSON.parse(fs.readFileSync('./config/team.json', 'utf8'));
    const trustedUsers = teamData.trusted || [];
    const ownerId = process.env.OWNER_ID;

    if (![ownerId, ...trustedUsers].includes(message.author.id)) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔒 Access Denied')
        .setDescription('This command is reserved for trusted staff only.')
        .setFooter({ text: 'Contact Apollo for access' });
      return message.reply({ embeds: [embed] });
    }

    const roleName = args.join(' ');
    if (!roleName) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Missing Role Name')
        .setDescription('Please provide a name for the role.')
        .addFields(
          { name: '📝 Usage', value: this.usage },
          { name: '💡 Examples', value: this.examples.join('\n') }
        );
      return message.reply({ embeds: [embed] });
    }

    try {
      const newRole = await message.guild.roles.create({
        name: roleName,
        permissions: []
      });
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Role Created')
        .setDescription(`Role **${newRole.name}** has been created.`);
      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in createrole command:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error Creating Role')
        .setDescription(`There was an error creating the role: ${error.message}`)
        .setFooter({ text: 'Please try again or contact support if the issue persists' });
      message.reply({ embeds: [errorEmbed] });
    }
  }
}; 