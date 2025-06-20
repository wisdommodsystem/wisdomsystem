const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'unban',
  description: 'Unbans a user from the server using their ID',
  usage: '+unban <userID> [reason]',
  examples: [
    '+unban 123456789',
    '+unban 123456789 User has been forgiven'
  ],
  async execute(message, args) {
    // Load trusted users
    const teamData = JSON.parse(fs.readFileSync('./config/team.json', 'utf8'));
    const trustedUsers = teamData.trusted || [];
    const ownerId = process.env.OWNER_ID;

    // Check if user has permission
    if (![ownerId, ...trustedUsers].includes(message.author.id)) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔒 Access Denied')
        .setDescription('This command is reserved for trusted Wisdom members only.')
        .setFooter({ text: 'Contact Apollo for access' });
      return message.reply({ embeds: [embed] });
    }

    // Check if a user ID was provided
    if (!args[0]) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Missing User ID')
        .setDescription('Please provide a user ID to unban.')
        .addFields(
          { name: '📝 Usage', value: this.usage },
          { name: '💡 Examples', value: this.examples.join('\n') }
        );
      return message.reply({ embeds: [embed] });
    }

    // Get the reason
    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      // Fetch the banned user
      const bannedUsers = await message.guild.bans.fetch();
      const bannedUser = bannedUsers.find(ban => ban.user.id === args[0]);

      if (!bannedUser) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ User Not Found')
          .setDescription('This user is not banned or the ID is invalid.');
        return message.reply({ embeds: [embed] });
      }

      // Unban the user
      await message.guild.members.unban(args[0], `${message.author.tag}: ${reason}`);

      // Create success embed
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🔓 User Unbanned')
        .setThumbnail(bannedUser.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: '👤 User', value: bannedUser.user.tag, inline: true },
          { name: '🆔 User ID', value: bannedUser.user.id, inline: true },
          { name: '👮 Unbanned By', value: message.author.tag, inline: true },
          { name: '📝 Reason', value: reason }
        )
        .setFooter({ text: 'Wisdom Moderation System' })
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in unban command:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error')
        .setDescription(`Failed to unban user: ${error.message}`)
        .setFooter({ text: 'Please try again or contact support if the issue persists' });
      
      message.reply({ embeds: [errorEmbed] });
    }
  }
}; 