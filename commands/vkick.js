const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'vkick',
  description: 'Kicks a member from a voice channel.',
  usage: '+vkick @user',
  examples: ['+vkick @user1'],
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
        .setDescription('Please mention a user to kick from the voice channel.')
        .addFields(
          { name: '📝 Usage', value: this.usage },
          { name: '💡 Examples', value: this.examples.join('\n') }
        );
      return message.reply({ embeds: [embed] });
    }

    if (!target.voice.channel) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ User Not in Voice Channel')
        .setDescription(`${target.user.tag} is not in a voice channel.`);
      return message.reply({ embeds: [embed] });
    }

    try {
      await target.voice.disconnect();
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ User Kicked from Voice Channel')
        .setDescription(`${target.user.tag} has been kicked from the voice channel.`);
      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in vkick command:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error Kicking User')
        .setDescription(`There was an error kicking the user: ${error.message}`)
        .setFooter({ text: 'Please try again or contact support if the issue persists' });
      message.reply({ embeds: [errorEmbed] });
    }
  }
}; 