const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const OWNER_ID = process.env.OWNER_ID;

module.exports = {
  name: 'tester',
  description: 'Shows all available commands (Owner Only)',
  usage: '+tester',
  examples: ['+tester'],
  async execute(message, args) {
    try {
      // Check if user is owner
      if (message.author.id !== OWNER_ID) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Access Denied')
          .setDescription('This command is restricted to the bot owner only.')
          .setFooter({ text: 'Please contact Apollo if you need assistance' });
        return message.reply({ embeds: [errorEmbed] });
      }

      // Create embed
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('📋 Available Commands')
        .setDescription('Here are all the commands available in the bot:')
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .setFooter({ 
          text: `Requested by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      // Define command categories
      const categories = {
        'Moderation': [
          { name: 'ban', description: 'Ban a user from the server', usage: '+ban <user> [reason]' },
          { name: 'unban', description: 'Unban a user from the server', usage: '+unban <user_id>' },
          { name: 'kick', description: 'Kick a user from the server', usage: '+kick <user> [reason]' },
          { name: 'mute', description: 'Mute a user', usage: '+mute <user> <duration> [reason]' },
          { name: 'unmute', description: 'Unmute a user', usage: '+unmute <user>' },
          { name: 'tmute', description: 'Temporary mute a user', usage: '+tmute <user> <duration> [reason]' },
          { name: 'timeout', description: 'Timeout a user', usage: '+timeout <user> <duration> [reason]' },
          { name: 'rtimeout', description: 'Remove timeout from a user', usage: '+rtimeout <user>' },
          { name: 'warn', description: 'Warn a user', usage: '+warn <user> <reason>' },
          { name: 'removewarn', description: 'Remove a warning from a user', usage: '+removewarn <user> <warning_id>' },
          { name: 'showwarnings', description: 'Show warnings for a user', usage: '+showwarnings <user>' },
          { name: 'report', description: 'Report a user', usage: '+report <user> <reason>' },
          { name: 'reportlist', description: 'List all reports', usage: '+reportlist' },
          { name: 'reportremove', description: 'Remove a report', usage: '+reportremove <report_id>' },
          { name: 'vkick', description: 'Kick a user from voice channel', usage: '+vkick <user>' },
          { name: 'deafen', description: 'Deafen a user', usage: '+deafen <user>' },
          { name: 'undeafen', description: 'Undeafen a user', usage: '+undeafen <user>' },
          { name: 'lock', description: 'Lock a channel', usage: '+lock' },
          { name: 'unlock', description: 'Unlock a channel', usage: '+unlock' },
          { name: 'slowmode', description: 'Set slowmode for a channel', usage: '+slowmode <seconds>' }
        ],
        'Staff Management': [
          { name: 'addstaff', description: 'Add a staff member', usage: '+addstaff <user_id>' },
          { name: 'removestaff', description: 'Remove a staff member', usage: '+removestaff <user_id>' },
          { name: 'admins', description: 'Show all admins', usage: '+admins' },
          { name: 'topteam', description: 'Show staff activity rankings', usage: '+topteam' },
          { name: 'removeteam', description: 'Remove a team member', usage: '+removeteam <user_id>' },
          { name: 'newmod', description: 'Add a trusted user', usage: '+newmod <user_id>' }
        ],
        'Channel Management': [
          { name: 'nchannel', description: 'Create a new channel', usage: '+nchannel <name>' },
          { name: 'createrole', description: 'Create a new role', usage: '+createrole <name>' },
          { name: 'roleadd', description: 'Add a role to a user', usage: '+roleadd <user> <role>' },
          { name: 'roletake', description: 'Remove a role from a user', usage: '+roletake <user> <role>' }
        ],
        'Voice Commands': [
          { name: 'move', description: 'Move a user to another voice channel', usage: '+move <user> <channel>' },
          { name: 'moveall', description: 'Move all users to another voice channel', usage: '+moveall <channel>' },
          { name: 'verifyall', description: 'Verify all users in voice channel', usage: '+verifyall' }
        ],
        'Utility': [
          { name: 'say', description: 'Make the bot say something', usage: '+say <message>' },
          { name: 'ping', description: 'Check bot latency', usage: '+ping' },
          { name: 'help', description: 'Show help menu', usage: '+help [command]' },
          { name: 'wisdomhelp', description: 'Show Wisdom help menu', usage: '+wisdomhelp' },
          { name: 'wisdomgod', description: 'Show advanced command list', usage: '+wisdomgod' },
          { name: 'wisdom', description: 'Show Wisdom information', usage: '+wisdom' },
          { name: 'bot', description: 'Show bot information', usage: '+bot' },
          { name: 'userinfo', description: 'Show user information', usage: '+userinfo [user]' },
          { name: 'avatar', description: 'Show user avatar', usage: '+avatar [user]' },
          { name: 'banner', description: 'Show user banner', usage: '+banner [user]' },
          { name: 'dm', description: 'Send a DM to a user', usage: '+dm <user> <message>' }
        ],
        'Notes & Reports': [
          { name: 'addnote', description: 'Add a note to a user', usage: '+addnote <user> <note>' },
          { name: 'shownotes', description: 'Show notes for a user', usage: '+shownotes <user>' },
          { name: 'reporthelp', description: 'Show report system help', usage: '+reporthelp' },
          { name: 'warninghelp', description: 'Show warning system help', usage: '+warninghelp' }
        ],
        'Statistics': [
          { name: 'leaderboard', description: 'Show server leaderboard', usage: '+leaderboard' },
          { name: 'topmembers', description: 'Show top members', usage: '+topmembers' },
          { name: 'invites', description: 'Show user invites', usage: '+invites [user]' },
          { name: 'team', description: 'Show team information', usage: '+team' }
        ],
        'Other': [
          { name: 'tester', description: 'Show all commands (Owner Only)', usage: '+tester' },
          { name: 'mse7', description: 'MSE7 command', usage: '+mse7' },
          { name: 'gol', description: 'GOL command', usage: '+gol' },
          { name: 'smiya', description: 'SMIYA command', usage: '+smiya' }
        ]
      };

      // Function to split commands into chunks
      function splitCommandsIntoChunks(commands, chunkSize = 5) {
        const chunks = [];
        for (let i = 0; i < commands.length; i += chunkSize) {
          chunks.push(commands.slice(i, i + chunkSize));
        }
        return chunks;
      }

      // Add fields for each category
      for (const [category, commands] of Object.entries(categories)) {
        if (commands.length > 0) {
          // Split commands into smaller chunks
          const commandChunks = splitCommandsIntoChunks(commands);
          
          // Add each chunk as a separate field
          commandChunks.forEach((chunk, index) => {
            const commandList = chunk.map(cmd => 
              `\`${cmd.name}\` - ${cmd.description}\nUsage: ${cmd.usage}`
            ).join('\n\n');
            
            embed.addFields({
              name: index === 0 ? `📌 ${category}` : `${category} (continued)`,
              value: commandList,
              inline: false
            });
          });
        }
      }

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in tester command:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error')
        .setDescription(`An error occurred while fetching commands: ${error.message}`)
        .setFooter({ text: 'Please try again or contact support if the issue persists' });
      message.reply({ embeds: [errorEmbed] });
    }
  }
};
