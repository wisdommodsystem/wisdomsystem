const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'reject',
  description: 'Reject a member from the voice channel they are currently in',
  aliases: ['re', 'RE', 'Re'],
  usage: '+reject <@user> [reason]',
  examples: ['+reject @user', '+reject @user Being disruptive'],
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
        .setDescription('Please mention a user to reject.')
        .addFields(
          { name: '📝 Usage', value: '`+reject @user [reason]`', inline: true },
          { name: '💡 Example', value: '`+reject @user Being disruptive`', inline: true }
        )
        .setFooter({ text: ' by Apollo • Wisdom Circle', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    // Check if target is in a voice channel
    if (!target.voice.channel) {
      const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('❌ User Not in Voice Channel')
        .setDescription(`${target.user.tag} is not currently in a voice channel.`)
        .setFooter({ text: ' by Apollo • Wisdom Circle', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    // Check if target is the bot owner
    if (target.id === ownerId) {
      const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('❌ Cannot Reject Owner')
        .setDescription('You cannot reject the bot owner.')
        .setFooter({ text: ' by Apollo • Wisdom Circle', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    // Check if target is a trusted user
    if (trustedUsers.includes(target.id)) {
      const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('❌ Cannot Reject Trusted User')
        .setDescription('You cannot reject a trusted user.')
        .setFooter({ text: ' by Apollo • Wisdom Circle', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    // Check if target is the command user
    if (target.id === message.author.id) {
      const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('❌ Cannot Reject Yourself')
        .setDescription('You cannot reject yourself.')
        .setFooter({ text: 'by Apollo • Wisdom Circle', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    // Get reason
    const reason = args.slice(1).join(' ') || 'No reason provided';
    const voiceChannel = target.voice.channel;

    try {
      // Check if bot has necessary permissions
      if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
        const embed = new EmbedBuilder()
          .setColor('#ff6b6b')
          .setTitle('❌ Missing Permissions')
          .setDescription('I need **Manage Channels** permission to reject members from voice channels.')
          .setFooter({ text: ' by Apollo • Wisdom Circle', iconURL: message.client.user.displayAvatarURL() })
          .setTimestamp();
        return message.reply({ embeds: [embed] });
      }

      // Disconnect user from voice channel
      await target.voice.disconnect(`Rejected by ${message.author.tag}: ${reason}`);

      // Set channel permissions to prevent re-entry
      await voiceChannel.permissionOverwrites.edit(target, {
        Connect: false,
        Speak: false,
        ViewChannel: true
      });

      // Create success embed
      const successEmbed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('🚫 Member Rejected from Voice Channel')
        .setDescription(`**${target.user.tag}** has been rejected from **${voiceChannel.name}**.`)
        .addFields(
          { name: '👤 Target', value: `${target.user.tag} (${target.id})`, inline: true },
          { name: '👮 Rejected By', value: `${message.author.tag}`, inline: true },
          { name: '⏰ Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: true },
          { name: '📺 Voice Channel', value: `${voiceChannel.name}`, inline: true },
          { name: '📝 Reason', value: reason, inline: false },
          { name: '🔒 Restrictions', value: `\`\`\`diff\n- Cannot join ${voiceChannel.name}\n- Cannot speak in ${voiceChannel.name}\n+ Can still view other channels\n+ Can join other voice channels\n\`\`\``, inline: false }
        )
        .setThumbnail(target.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .setImage('https://i.imgur.com/3ZUrjUP.gif')
        .setFooter({ text: ` by Apollo • Wisdom Circle • Rejected`, iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();

      await message.reply({ embeds: [successEmbed] });

      // Log the action
      console.log(`Member ${target.user.tag} rejected from ${voiceChannel.name} by ${message.author.tag} for: ${reason}`);

    } catch (error) {
      console.error('Error rejecting member:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('❌ Error')
        .setDescription('An error occurred while rejecting the member.')
        .addFields(
          { name: '🔧 Error', value: error.message, inline: false }
        )
        .setFooter({ text: ' by Apollo • Wisdom Circle', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      
      await message.reply({ embeds: [errorEmbed] });
    }
  }
}; 