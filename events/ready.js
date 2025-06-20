const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    client.user.setPresence({
      activities: [{ name: 'Wisdom', type: ActivityType.Playing }],
      status: 'dnd'
    });
    console.log(`✅ ${client.user.tag} is online and set to DND!`);
  }
}; 