const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'tmute',
  description: 'Mutes a user from sending messages in channels.',
  usage: '+tmute @user',
  examples: ['+tmute @user1'],
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

    const target = message.mentions.members.first();
    if (!target) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Missing User')
        .setDescription('Please mention a user to mute.')
        .addFields(
          { name: '📝 Usage', value: this.usage },
          { name: '💡 Examples', value: this.examples.join('\n') }
        );
      return message.reply({ embeds: [embed] });
    }

    try {
      await target.timeout(3600000); // 1 hour timeout
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ User Muted')
        .setDescription(`${target.user.tag} has been muted for 1 hour.`);
      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in tmute command:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error Muting User')
        .setDescription(`There was an error muting the user: ${error.message}`)
        .setFooter({ text: 'Please try again or contact support if the issue persists' });
      message.reply({ embeds: [errorEmbed] });
    }
  }
}; 