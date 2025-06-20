const { EmbedBuilder } = require('discord.js');
const Report = require('../models/Report');

module.exports = {
  name: 'report',
  description: 'Report a user to the moderation team',
  usage: '+report @user <reason>',
  examples: [
    '+report @user had khona mrid fkro',
    '+report @user spamming in chat'
  ],
  async execute(message, args) {
    // Check MongoDB connection
    if (!global.mongoConnected) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Database Error')
        .setDescription('The database is currently not connected. Please try again in a few moments.')
        .setFooter({ text: 'Contact support if the issue persists' });
      return message.reply({ embeds: [embed] });
    }

    // Check if a user was mentioned
    const target = message.mentions.users.first();
    if (!target) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Missing User')
        .setDescription('Please mention a user to report.')
        .addFields(
          { name: '📝 Usage', value: this.usage },
          { name: '💡 Examples', value: this.examples.join('\n') }
        );
      return message.reply({ embeds: [embed] });
    }

    // Get the reason
    const reason = args.slice(1).join(' ');
    if (!reason) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Missing Reason')
        .setDescription('Please provide a reason for the report.')
        .addFields(
          { name: '📝 Usage', value: this.usage },
          { name: '💡 Examples', value: this.examples.join('\n') }
        );
      return message.reply({ embeds: [embed] });
    }

    try {
      // Find or create report document
      let userReport = await Report.findOne({ userId: target.id });
      if (!userReport) {
        userReport = new Report({
          userId: target.id,
          username: target.tag,
          reports: []
        });
      }

      // Add new report
      userReport.reports.push({
        reporterId: message.author.id,
        reporterTag: message.author.tag,
        reason,
        timestamp: new Date()
      });

      // Save to database
      await userReport.save();

      // Create success embed
      const embed = new EmbedBuilder()
        .setColor('#ffa500')
        .setTitle('🚨 Report Submitted')
        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: '👤 Reported User', value: target.tag, inline: true },
          { name: '🆔 User ID', value: target.id, inline: true },
          { name: '📝 Reason', value: reason },
          { name: '👮 Reported By', value: message.author.tag, inline: true },
          { name: '🕒 Timestamp', value: new Date().toLocaleString(), inline: true }
        )
        .setFooter({ text: 'Thank you for your report. The moderation team will review it.' })
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in report command:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error Submitting Report')
        .setDescription(`There was an error submitting the report: ${error.message}`)
        .setFooter({ text: 'Please try again or contact support if the issue persists' });
      
      message.reply({ embeds: [errorEmbed] });
    }
  }
}; 