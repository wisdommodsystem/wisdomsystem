const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'kick',
  description: 'Kicks a user from the server',
  usage: '+kick @user [reason]',
  examples: [
    '+kick @user',
    '+kick @user Breaking rules'
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
        .setDescription('This command is reserved for trusted Wisdom Team only.')
        .setFooter({ text: 'Contact Apollo for access' });
      return message.reply({ embeds: [embed] });
    }

    // Check if a user was mentioned
    const target = message.mentions.users.first();
    if (!target) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Missing User')
        .setDescription('Please mention a user to kick.')
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

      // Check if the bot can kick the user
      if (!member.kickable) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Cannot Kick User')
          .setDescription('I cannot kick this user. They may have higher permissions than me.');
        return message.reply({ embeds: [embed] });
      }

      // Kick the user
      await member.kick(`${message.author.tag}: ${reason}`);

      // Create success embed
      const embed = new EmbedBuilder()
        .setColor('#ffa500')
        .setTitle('👢 User Kicked')
        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: '👤 User', value: target.tag, inline: true },
          { name: '🆔 User ID', value: target.id, inline: true },
          { name: '👮 Kicked By', value: message.author.tag, inline: true },
          { name: '📝 Reason', value: reason }
        )
        .setFooter({ text: 'Wisdom Moderation System' })
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in kick command:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error')
        .setDescription(`Failed to kick user: ${error.message}`)
        .setFooter({ text: 'Please try again or contact support if the issue persists' });
      
      message.reply({ embeds: [errorEmbed] });
    }
  }
}; 