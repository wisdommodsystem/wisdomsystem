const { EmbedBuilder, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'wisdomgod',
  description: 'Shows all available commands with advanced details',
  usage: '+wisdomgod [command]',
  examples: [
    '+wisdomgod',
    '+wisdomgod addnote'
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

    // Get all command files
    const commandsPath = path.join(__dirname);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    // Create commands collection
    const commands = new Collection();

    // Load all commands
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if (command.name) {
        commands.set(command.name, command);
      }
    }

    // If a specific command is requested
    if (args[0]) {
      const command = commands.get(args[0].toLowerCase());
      if (!command) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Command Not Found')
          .setDescription(`Command "${args[0]}" not found.`)
          .setFooter({ text: 'Use +wisdomgod to see all commands' });
        return message.reply({ embeds: [embed] });
      }

      const embed = new EmbedBuilder()
        .setColor('#00bfff')
        .setTitle(`📚 Command: ${command.name}`)
        .setDescription(command.description)
        .addFields(
          { name: '📝 Usage', value: command.usage || 'No usage specified' },
          { name: '💡 Examples', value: command.examples ? command.examples.join('\n') : 'No examples provided' }
        )
        .setFooter({ text: 'Wisdom Moderation System' })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    // Group commands by category with detailed descriptions
    const categories = {
      '📝 Notes Management': {
        description: 'Commands for managing user notes and records',
        commands: ['addnote', 'shownotes'],
        color: '#00bfff'
      },
      '👮 Moderation Tools': {
        description: 'Commands for server moderation and user management',
        commands: ['ban', 'unban', 'kick', 'mute', 'unmute', 'warn', 'unwarn'],
        color: '#ff0000'
      },
      '⚙️ Server Settings': {
        description: 'Commands for configuring server settings and channels',
        commands: ['setprefix', 'setlogchannel', 'nchannel'],
        color: '#ffa500'
      },
      '📊 Statistics & Info': {
        description: 'Commands for viewing server statistics and information',
        commands: ['vstatus', 'modstats'],
        color: '#00ff00'
      },
      '🛠️ Utility Commands': {
        description: 'General utility and help commands',
        commands: ['wisdomhelp', 'wisdomgod', 'ping', 'uptime'],
        color: '#808080'
      }
    };

    // Create main help embed
    const mainEmbed = new EmbedBuilder()
      .setColor('#00bfff')
      .setTitle('🌟 Wisdom Moderation System')
      .setDescription('Welcome to the advanced command overview. Here are all available commands:')
      .setFooter({ text: 'Use +wisdomgod <command> for detailed information' })
      .setTimestamp();

    // Add each category to the embed
    for (const [category, info] of Object.entries(categories)) {
      const categoryCommands = info.commands
        .map(cmd => commands.get(cmd))
        .filter(cmd => cmd) // Filter out undefined commands
        .map(cmd => {
          const status = cmd.name === 'wisdomgod' ? '🌟' : '✅';
          return `${status} \`${cmd.name}\`: ${cmd.description}`;
        })
        .join('\n');

      if (categoryCommands) {
        mainEmbed.addFields({
          name: `${category}`,
          value: `${info.description}\n\n${categoryCommands}`
        });
      }
    }

    // Add additional information
    mainEmbed.addFields({
      name: '📌 Command Usage Guide',
      value: '• All commands are prefixed with `+`\n' +
             '• Use `+wisdomgod <command>` for detailed information\n' +
             '• Commands are case-insensitive\n' +
             '• Required arguments are shown in `<>`\n' +
             '• Optional arguments are shown in `[]`\n' +
             '• Some commands may require specific permissions'
    });

    // Add permission information
    mainEmbed.addFields({
      name: '🔒 Permission Levels',
      value: '• 🌟 Owner: Full access to all commands\n' +
             '• 👑 Trusted Users: Access to moderation and management commands\n' +
             '• 👮 Staff: Access to basic moderation commands'
    });

    message.reply({ embeds: [mainEmbed] });
  }
};
