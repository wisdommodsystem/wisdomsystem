const { EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'nchannel',
  description: 'Creates a new channel in the server',
  usage: '+nchannel <channelName> <channelType>',
  examples: [
    '+nchannel general text',
    '+nchannel voice-chat voice'
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

    // Check if channel name and type were provided
    if (args.length < 2) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Missing Arguments')
        .setDescription('Please provide both channel name and type.')
        .addFields(
          { name: '📝 Usage', value: this.usage },
          { name: '💡 Examples', value: this.examples.join('\n') },
          { name: '📌 Channel Types', value: '• `text` - Text channel\n• `voice` - Voice channel' }
        );
      return message.reply({ embeds: [embed] });
    }

    const channelName = args[0].toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const channelType = args[1].toLowerCase();

    // Validate channel type
    if (!['text', 'voice'].includes(channelType)) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Invalid Channel Type')
        .setDescription('Channel type must be either `text` or `voice`.')
        .addFields(
          { name: '📝 Usage', value: this.usage },
          { name: '💡 Examples', value: this.examples.join('\n') }
        );
      return message.reply({ embeds: [embed] });
    }

    try {
      // Create the channel
      const newChannel = await message.guild.channels.create({
        name: channelName,
        type: channelType === 'text' ? ChannelType.GuildText : ChannelType.GuildVoice,
        permissionOverwrites: [
          {
            id: message.guild.id,
            allow: [PermissionFlagsBits.ViewChannel],
          },
        ],
      });

      // Create success embed
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Channel Created')
        .addFields(
          { name: '📝 Channel Name', value: newChannel.name, inline: true },
          { name: '📌 Channel Type', value: channelType, inline: true },
          { name: '🆔 Channel ID', value: newChannel.id, inline: true },
          { name: '👮 Created By', value: message.author.tag }
        )
        .setFooter({ text: 'Wisdom Moderation System' })
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in nchannel command:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error')
        .setDescription(`Failed to create channel: ${error.message}`)
        .setFooter({ text: 'Please try again or contact support if the issue persists' });
      
      message.reply({ embeds: [errorEmbed] });
    }
  }
}; 