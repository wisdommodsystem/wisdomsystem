const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const Warning = require('../models/Warning');

module.exports = {
  name: 'warn',
  description: 'Warn a user. 3 warnings = kick.',
  usage: '+warn @user <reason>',
  examples: ['+warn @user Spamming', '+warn @user Ghadi T3wad tseb ghadi tbana'],
  async execute(message, args) {
    // Load permissions
    const teamData = JSON.parse(fs.readFileSync('./config/team.json', 'utf8'));
    const trustedUsers = teamData.trusted || [];
    const ownerId = process.env.OWNER_ID;
    const staffData = JSON.parse(fs.readFileSync('./config/staff.json', 'utf8'));
    const staffIds = staffData.staffIds || [];

    if (![ownerId, ...trustedUsers, ...staffIds].includes(message.author.id)) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔒 Access Denied')
        .setDescription('This command is reserved for trusted staff only.')
        .setFooter({ text: 'Contact Apollo for access' });
      return message.reply({ embeds: [embed] });
    }

    // Check user mention
    const target = message.mentions.users.first();
    if (!target) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Missing User')
        .setDescription('Please mention a user to warn.')
        .addFields(
          { name: '📝 Usage', value: this.usage },
          { name: '💡 Examples', value: this.examples.join('\n') }
        );
      return message.reply({ embeds: [embed] });
    }

    // Reason
    const reason = args.slice(1).join(' ');
    if (!reason) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Missing Reason')
        .setDescription('Please provide a reason for the warning.')
        .addFields(
          { name: '📝 Usage', value: this.usage },
          { name: '💡 Examples', value: this.examples.join('\n') }
        );
      return message.reply({ embeds: [embed] });
    }

    try {
      let userWarning = await Warning.findOne({ userId: target.id });
      if (!userWarning) {
        userWarning = new Warning({
          userId: target.id,
          username: target.tag,
          warnings: []
        });
      }

      userWarning.warnings.push({
        reason,
        warnerId: message.author.id,
        warnerTag: message.author.tag,
        timestamp: new Date()
      });

      await userWarning.save();

      // DM the warned user
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor('#ffa500')
          .setTitle('⚠️ Warning Issued')
          .setDescription(`Hey Wisdom Member! You get ${userWarning.warnings.length}/3 warning. If you get 3 you gonna kicked from the server. Please read our rules [here](https://discord.com/channels/1201626435958354021/1201647312842277046).`)
          .setFooter({ text: 'Wisdom Moderation System' })
          .setTimestamp();
        await target.send({ embeds: [dmEmbed] });
      } catch (err) {
        // Ignore DM errors
      }

      // Success embed
      const embed = new EmbedBuilder()
        .setColor('#ffa500')
        .setTitle('⚠️ User Warned')
        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: '👤 Warned User', value: target.tag, inline: true },
          { name: '🆔 User ID', value: target.id, inline: true },
          { name: '📝 Reason', value: reason },
          { name: '👮 Warned By', value: message.author.tag, inline: true },
          { name: '⚠️ Total Warnings', value: `${userWarning.warnings.length}/3`, inline: true }
        )
        .setFooter({ text: 'If the user reaches 3 warnings, they will be kicked.' })
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in warn command:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error Warning User')
        .setDescription(`There was an error warning the user: ${error.message}`)
        .setFooter({ text: 'Please try again or contact support if the issue persists' });
      message.reply({ embeds: [errorEmbed] });
    }
  }
}; 