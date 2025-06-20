const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'unreject',
  description: 'Remove rejection restrictions from a user for a specific voice channel',
  aliases: ['unre', 'UNRE', 'Unre'],
  usage: '+unreject <@user> <#channel> [reason]',
  examples: ['+unreject @user #general', '+unreject @user #voice-chat User apologized'],
  async execute(message, args) {
    // Load trusted users and owner
    const teamData = JSON.parse(fs.readFileSync('./config/team.json', 'utf8'));
    const trustedUsers = teamData.trusted || [];
    const ownerId = process.env.OWNER_ID;

    // Check if user has permission (only owner and trusted users)
    if (![ownerId, ...trustedUsers].includes(message.author.id)) {
      const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('🚫 Access Denied')
        .setDescription('**This command is reserved for the bot owner and trusted staff only.**')
        .setFooter({ text: ' by Apollo • Wisdom Circle', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    // Check if user is mentioned
    const target = message.mentions.members.first();
    if (!target) {
      const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('❌ Invalid Usage')
        .setDescription('Please mention a user to unreject.')
        .addFields(
          { name: '📝 Usage', value: '`+unreject @user #channel [reason]`', inline: true },
          { name: '💡 Example', value: '`+unreject @user #general User apologized`', inline: true }
        )
        .setFooter({ text: ' by Apollo • Wisdom Circle', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    // Check if channel is mentioned
    const channel = message.mentions.channels.first();
    if (!channel) {
      const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('❌ Invalid Usage')
        .setDescription('Please mention a voice channel.')
        .addFields(
          { name: '📝 Usage', value: '`+unreject @user #channel [reason]`', inline: true },
          { name: '💡 Example', value: '`+unreject @user #general User apologized`', inline: true }
        )
        .setFooter({ text: ' by Apollo • Wisdom Circle', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    // Check if channel is a voice channel
    if (channel.type !== 2) { // 2 is the type for voice channels
      const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('❌ Invalid Channel Type')
        .setDescription('Please mention a voice channel, not a text channel.')
        .setFooter({ text: ' by Apollo • Wisdom Circle', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    // Check if target is the bot owner
    if (target.id === ownerId) {
      const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('❌ Cannot Unreject Owner')
        .setDescription('The bot owner cannot be rejected or unrejected.')
        .setFooter({ text: ' by Apollo • Wisdom Circle', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    // Check if target is the command user
    if (target.id === message.author.id) {
      const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('❌ Cannot Unreject Yourself')
        .setDescription('You cannot unreject yourself.')
        .setFooter({ text: ' by Apollo • Wisdom Circle', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    // Get reason
    const reason = args.slice(2).join(' ') || 'No reason provided';

    try {
      // Check if bot has necessary permissions
      if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
        const embed = new EmbedBuilder()
          .setColor('#ff6b6b')
          .setTitle('❌ Missing Permissions')
          .setDescription('I need **Manage Channels** permission to unreject members.')
          .setFooter({ text: ' by Apollo • Wisdom Circle', iconURL: message.client.user.displayAvatarURL() })
          .setTimestamp();
        return message.reply({ embeds: [embed] });
      }

      // Check if user has any restrictions on this channel
      const permissions = channel.permissionOverwrites.cache.get(target.id);
      
      if (!permissions) {
        const embed = new EmbedBuilder()
          .setColor('#ff6b6b')
          .setTitle('❌ No Restrictions Found')
          .setDescription(`${target.user.tag} has no restrictions on ${channel.name}.`)
          .setFooter({ text: ' by Apollo • Wisdom Circle', iconURL: message.client.user.displayAvatarURL() })
          .setTimestamp();
        return message.reply({ embeds: [embed] });
      }

      // Check if the restrictions are actually rejection-related
      const hasRejectionRestrictions = permissions.deny.has(PermissionFlagsBits.Connect) || 
                                      permissions.deny.has(PermissionFlagsBits.Speak);

      if (!hasRejectionRestrictions) {
        const embed = new EmbedBuilder()
          .setColor('#ff6b6b')
          .setTitle('❌ No Rejection Restrictions')
          .setDescription(`${target.user.tag} has no rejection restrictions on ${channel.name}.`)
          .setFooter({ text: ' by Apollo • Wisdom Circle', iconURL: message.client.user.displayAvatarURL() })
          .setTimestamp();
        return message.reply({ embeds: [embed] });
      }

      // Remove the rejection restrictions
      await channel.permissionOverwrites.delete(target, `Unrejected by ${message.author.tag}: ${reason}`);

      // Create success embed
      const successEmbed = new EmbedBuilder()
        .setColor('#48dbfb')
        .setTitle('✅ Member Unrejected from Voice Channel')
        .setDescription(`**${target.user.tag}** has been unrejected from **${channel.name}**.`)
        .addFields(
          { name: '👤 Target', value: `${target.user.tag} (${target.id})`, inline: true },
          { name: '👮 Unrejected By', value: `${message.author.tag}`, inline: true },
          { name: '⏰ Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: true },
          { name: '📺 Voice Channel', value: `${channel.name}`, inline: true },
          { name: '📝 Reason', value: reason, inline: false },
          { name: '🔓 Permissions Restored', value: `\`\`\`diff\n+ Can join ${channel.name}\n+ Can speak in ${channel.name}\n+ Full access restored\n\`\`\``, inline: false }
        )
        .setThumbnail(target.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .setImage('https://i.imgur.com/8Km9tLL.gif')
        .setFooter({ text: ` by Apollo • Wisdom Circle • Unrejected`, iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();

      await message.reply({ embeds: [successEmbed] });

      // Log the action
      console.log(`Member ${target.user.tag} unrejected from ${channel.name} by ${message.author.tag} for: ${reason}`);

    } catch (error) {
      console.error('Error unrejecting member:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('❌ Error')
        .setDescription('An error occurred while unrejecting the member.')
        .addFields(
          { name: '🔧 Error', value: error.message, inline: false }
        )
        .setFooter({ text: ' by Apollo • Wisdom Circle', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      
      await message.reply({ embeds: [errorEmbed] });
    }
  }
}; 