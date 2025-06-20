const fs = require('fs');
const { EmbedBuilder } = require('discord.js');
const StaffActivity = require('../models/StaffActivity');

// Store voice time tracking for all users
const voiceTimeTracking = new Map();
// Global tracking toggle
let trackingEnabled = true;

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    console.log(`🔍 Debug: Voice state update triggered for ${newState.member.user.tag}`);
    console.log(`🔍 Debug: Old channel: ${oldState.channelId}, New channel: ${newState.channelId}`);
    
    // Check if tracking is enabled
    if (!trackingEnabled) {
      console.log('🔍 Debug: Tracking is disabled, skipping...');
      return;
    }

    // Load staff lists for existing functionality
    const teamData = JSON.parse(fs.readFileSync('./config/team.json', 'utf8'));
    const trustedUsers = teamData.trusted || [];
    const ownerId = process.env.OWNER_ID;
    const staffData = JSON.parse(fs.readFileSync('./config/staff.json', 'utf8'));
    const staffIds = staffData.staffIds || [];

    const userId = newState.member.id;
    const user = newState.member.user;

    // Handle different voice state changes
    try {
      // User joined a voice channel
      if (!oldState.channelId && newState.channelId) {
        console.log(`🔍 Debug: User ${user.tag} joined voice channel ${newState.channel.name}`);
        voiceTimeTracking.set(userId, Date.now());
        console.log(`Started tracking voice time for ${user.tag}`);
      }
      // User left a voice channel
      else if (oldState.channelId && !newState.channelId) {
        console.log(`🔍 Debug: User ${user.tag} left voice channel ${oldState.channel.name}`);
        const joinTime = voiceTimeTracking.get(userId);
        if (joinTime) {
          console.log(`🔍 Debug: Found join time for ${user.tag}, calculating duration...`);
          const leaveTime = Date.now();
          const timeSpent = leaveTime - joinTime;
          voiceTimeTracking.delete(userId);

          // Format times
          const joinDate = new Date(joinTime);
          const leaveDate = new Date(leaveTime);
          const joinTimeStr = joinDate.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          const leaveTimeStr = leaveDate.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          });

          // Format duration
          const hours = Math.floor(timeSpent / (1000 * 60 * 60));
          const minutes = Math.floor((timeSpent % (1000 * 60 * 60)) / (1000 * 60));
          let durationStr = '';
          if (hours > 0) {
            durationStr += `${hours} hour${hours !== 1 ? 's' : ''}`;
            if (minutes > 0) {
              durationStr += ` and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
            }
          } else {
            durationStr = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
          }

          console.log(`🔍 Debug: Time spent: ${durationStr} (${joinTimeStr} to ${leaveTimeStr})`);

          // Send embed to log channel
          await sendVoiceLogEmbed(user, joinTimeStr, leaveTimeStr, durationStr, oldState.channel);

          // Update staff activity for staff members (existing functionality)
          if ([ownerId, ...trustedUsers, ...staffIds].includes(userId)) {
            const timeSpentMinutes = Math.floor(timeSpent / 60000);
            let staffActivity = await StaffActivity.findOne({ userId });
            if (!staffActivity) {
              staffActivity = new StaffActivity({
                userId,
                username: user.tag
              });
            }
            staffActivity.voiceTime += timeSpentMinutes;
            await staffActivity.save();
            console.log(`Updated voice time for ${user.tag}: +${timeSpentMinutes} minutes`);
          }
        } else {
          console.log(`🔍 Debug: No join time found for ${user.tag}, skipping...`);
        }
      }
      // User switched channels
      else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        console.log(`🔍 Debug: User ${user.tag} switched from ${oldState.channel.name} to ${newState.channel.name}`);
        const joinTime = voiceTimeTracking.get(userId);
        if (joinTime) {
          const switchTime = Date.now();
          const timeSpent = switchTime - joinTime;
          voiceTimeTracking.set(userId, switchTime);

          // Format times
          const joinDate = new Date(joinTime);
          const switchDate = new Date(switchTime);
          const joinTimeStr = joinDate.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          const switchTimeStr = switchDate.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          });

          // Format duration
          const hours = Math.floor(timeSpent / (1000 * 60 * 60));
          const minutes = Math.floor((timeSpent % (1000 * 60 * 60)) / (1000 * 60));
          let durationStr = '';
          if (hours > 0) {
            durationStr += `${hours} hour${hours !== 1 ? 's' : ''}`;
            if (minutes > 0) {
              durationStr += ` and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
            }
          } else {
            durationStr = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
          }

          // Send embed to log channel
          await sendVoiceLogEmbed(user, joinTimeStr, switchTimeStr, durationStr, oldState.channel, true);

          // Update staff activity for staff members (existing functionality)
          if ([ownerId, ...trustedUsers, ...staffIds].includes(userId)) {
            const timeSpentMinutes = Math.floor(timeSpent / 60000);
            let staffActivity = await StaffActivity.findOne({ userId });
            if (!staffActivity) {
              staffActivity = new StaffActivity({
                userId,
                username: user.tag
              });
            }
            staffActivity.voiceTime += timeSpentMinutes;
            await staffActivity.save();
            console.log(`Updated voice time for ${user.tag}: +${timeSpentMinutes} minutes (channel switch)`);
          }
        }
      }
      // User was disconnected
      else if (oldState.channelId && !newState.channelId && newState.reason === 'disconnected') {
        console.log(`🔍 Debug: User ${user.tag} was disconnected from ${oldState.channel.name}`);
        const joinTime = voiceTimeTracking.get(userId);
        if (joinTime) {
          const disconnectTime = Date.now();
          const timeSpent = disconnectTime - joinTime;
          voiceTimeTracking.delete(userId);

          // Format times
          const joinDate = new Date(joinTime);
          const disconnectDate = new Date(disconnectTime);
          const joinTimeStr = joinDate.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          const disconnectTimeStr = disconnectDate.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          });

          // Format duration
          const hours = Math.floor(timeSpent / (1000 * 60 * 60));
          const minutes = Math.floor((timeSpent % (1000 * 60 * 60)) / (1000 * 60));
          let durationStr = '';
          if (hours > 0) {
            durationStr += `${hours} hour${hours !== 1 ? 's' : ''}`;
            if (minutes > 0) {
              durationStr += ` and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
            }
          } else {
            durationStr = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
          }

          // Send embed to log channel
          await sendVoiceLogEmbed(user, joinTimeStr, disconnectTimeStr, durationStr, oldState.channel, false, true);

          // Update staff activity for staff members (existing functionality)
          if ([ownerId, ...trustedUsers, ...staffIds].includes(userId)) {
            const timeSpentMinutes = Math.floor(timeSpent / 60000);
            let staffActivity = await StaffActivity.findOne({ userId });
            if (!staffActivity) {
              staffActivity = new StaffActivity({
                userId,
                username: user.tag
              });
            }
            staffActivity.voiceTime += timeSpentMinutes;
            await staffActivity.save();
            console.log(`Updated voice time for ${user.tag}: +${timeSpentMinutes} minutes (disconnected)`);
          }
        }
      }
    } catch (error) {
      console.error('Error updating voice time:', error);
    }
  }
};

// Function to send voice log embed
async function sendVoiceLogEmbed(user, joinTime, leaveTime, duration, channel, isSwitch = false, isDisconnect = false) {
  try {
    console.log('🔍 Debug: Attempting to send voice log embed...');
    
    const logChannelId = process.env.VC_LOG_CHANNEL_ID;
    console.log(`🔍 Debug: Log channel ID from env: ${logChannelId}`);
    
    if (!logChannelId) {
      console.log('❌ VC_LOG_CHANNEL_ID not set in environment variables');
      return;
    }

    const logChannel = user.client.channels.cache.get(logChannelId);
    console.log(`🔍 Debug: Found log channel: ${logChannel ? 'Yes' : 'No'}`);
    
    if (!logChannel) {
      console.log(`❌ Log channel with ID ${logChannelId} not found`);
      console.log(`🔍 Debug: Available channels: ${user.client.channels.cache.map(c => `${c.name} (${c.id})`).join(', ')}`);
      return;
    }

    console.log(`🔍 Debug: Log channel name: ${logChannel.name}`);
    console.log(`🔍 Debug: Log channel type: ${logChannel.type}`);

    let title = '🎤 Voice Channel Activity';
    let description = `**${user.username}** has been active in voice channels!`;
    let color = '#6a82fb';
    let statusEmoji = '🎤';
    let gradientImage = 'https://i.imgur.com/8Km9tLL.gif';
    
    if (isSwitch) {
      title = '🔄 Voice Channel Switch';
      description = `**${user.username}** switched voice channels`;
      color = '#feca57';
      statusEmoji = '🔄';
      gradientImage = 'https://i.imgur.com/8Km9tLL.gif';
    } else if (isDisconnect) {
      title = '❌ Voice Channel Disconnect';
      description = `**${user.username}** was disconnected from voice`;
      color = '#ff6b6b';
      statusEmoji = '❌';
      gradientImage = 'https://i.imgur.com/3ZUrjUP.gif';
    }

    // Enhanced friendly messages with more variety
    const friendlyMessages = [
      "You're shining with activity in the Wisdom Circle ✨ Keep it up, champ!",
      "Your voice presence is making waves! 🌊 Stay awesome!",
      "Another great session in the voice channels! 🎯 You're doing amazing!",
      "Your dedication to the community is inspiring! 💫 Keep connecting!",
      "Voice channel master in action! 🎤 You're building something special!",
      "Your energy is contagious! ⚡ Keep spreading positivity!",
      "You're a true voice channel legend! 👑 Keep dominating!",
      "Your commitment to the community is unmatched! 🔥 Stay legendary!",
      "You're creating amazing connections! 🤝 Keep it flowing!",
      "Your voice journey is incredible! 🌟 Keep soaring higher!"
    ];
    
    const randomMessage = friendlyMessages[Math.floor(Math.random() * friendlyMessages.length)];
    const divider = '━━━━━━━━━━━━━━━━━━━━';

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`${statusEmoji} ${title}`)
      .setDescription(`**${divider}**\n${description}\n**${divider}**`)
      .addFields(
        { 
          name: '👤 User Information', 
          value: `**Username:** ${user.tag}\n**ID:** \`${user.id}\``, 
          inline: true 
        },
        { 
          name: '⏰ Time Details', 
          value: `**Joined:** \`${joinTime}\`\n**Left:** \`${leaveTime}\``, 
          inline: true 
        },
        { 
          name: '📊 Session Stats', 
          value: `**Duration:** \`${duration}\`\n**Channel:** \`${channel ? channel.name : 'Unknown'}\``, 
          inline: true 
        }
      )
      .addFields(
        { 
          name: '💬 Motivational Message', 
          value: `> ${randomMessage}`, 
          inline: false 
        }
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setImage(gradientImage)
      .setFooter({ 
        text: `System Tracker by Apollo • Wisdom Circle • ${statusEmoji}`, 
        iconURL: user.client.user.displayAvatarURL() 
      })
      .setTimestamp();

    console.log('🔍 Debug: About to send embed to log channel...');
    await logChannel.send({ embeds: [embed] });
    console.log('✅ Successfully sent voice log embed!');
    
  } catch (error) {
    console.error('❌ Error sending voice log embed:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
  }
}

// Export functions for the tracktimer command
module.exports.setTrackingEnabled = (enabled) => {
  trackingEnabled = enabled;
};

module.exports.isTrackingEnabled = () => {
  return trackingEnabled;
};
