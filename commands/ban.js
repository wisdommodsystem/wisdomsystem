const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'ban',
  description: 'Bans a user from the server',
  usage: '+ban @user [reason]',
  examples: [
    '+ban @user',
    '+ban @user Spamming'
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

    // Check if a user was mentioned
    const target = message.mentions.users.first();
    if (!target) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Missing User')
        .setDescription('Please mention a user to ban.')
        .addFields(
          { name: '📝 Usage', value: this.usage },
          { name: '💡 Examples', value: this.examples.join('\n') }
        );
      return message.reply({ embeds: [embed] });
    }

    // Get the reason
    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      // Get the member object
      const member = await message.guild.members.fetch(target.id);

      // Check if the bot can ban the user
      if (!member.bannable) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Cannot Ban User')
          .setDescription('I cannot ban this user. They may have higher permissions than me.');
        return message.reply({ embeds: [embed] });
      }

      // Ban the user
      await member.ban({ reason: `${message.author.tag}: ${reason}` });

      // Create success embed
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔨 User Banned')
        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: '👤 User', value: target.tag, inline: true },
          { name: '🆔 User ID', value: target.id, inline: true },
          { name: '👮 Banned By', value: message.author.tag, inline: true },
          { name: '📝 Reason', value: reason }
        )
        .setFooter({ text: 'Wisdom Moderation System' })
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in ban command:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error')
        .setDescription(`Failed to ban user: ${error.message}`)
        .setFooter({ text: 'Please try again or contact support if the issue persists' });
      
      message.reply({ embeds: [errorEmbed] });
    }
  }
}; 