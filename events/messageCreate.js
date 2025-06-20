const { Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const StaffActivity = require('../models/StaffActivity');

// Create a cooldowns collection
const cooldowns = new Collection();

module.exports = {
  name: 'messageCreate',
  execute: async (message) => {
    if (message.author.bot) return;

    const prefix = '+';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Get the command
    let command = message.client.commands.get(commandName);

    // If command not found, check aliases
    if (!command) {
      const aliasCommand = message.client.aliases.get(commandName);
      if (aliasCommand) {
        command = message.client.commands.get(aliasCommand);
      }
    }

    if (!command) return;

    // Cooldown handling
    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before using the \`${command.name}\` command.`);
      }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
      // Read team.json for staff and trusted users
      const teamPath = path.join(__dirname, '..', 'config', 'team.json');
      let teamData;
      try {
        teamData = JSON.parse(fs.readFileSync(teamPath, 'utf8'));
      } catch (error) {
        teamData = { trustedUsers: [], staffIds: [] };
      }

      // Fallback defaults for missing properties
      const trustedUsers = Array.isArray(teamData.trustedUsers) ? teamData.trustedUsers : [];
      const staffIds = Array.isArray(teamData.staffIds) ? teamData.staffIds : [];

      // Check if user is staff or trusted
      const isStaff = staffIds.includes(message.author.id);
      const isTrusted = trustedUsers.includes(message.author.id);
      const isOwner = message.author.id === process.env.OWNER_ID;

      // Check if message author is staff
      if (isStaff || isTrusted || isOwner) {
        try {
          // Update or create staff activity record
          let staffActivity = await StaffActivity.findOne({ userId: message.author.id });
          if (!staffActivity) {
            staffActivity = new StaffActivity({
              userId: message.author.id,
              username: message.author.tag
            });
          }
          staffActivity.messages += 1;
          await staffActivity.save();
        } catch (error) {
          console.error('Error updating staff activity:', error);
        }
      }

      await command.execute(message, args);
    } catch (error) {
      console.error(error);
      message.reply('There was an error executing that command.').catch(console.error);
    }
  },
}; 