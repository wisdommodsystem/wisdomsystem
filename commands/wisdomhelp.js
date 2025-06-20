const { EmbedBuilder, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'wisdomhelp',
  description: 'Shows all available commands and their usage',
  usage: '+wisdomhelp [command]',
  examples: [
    '+wisdomhelp',
    '+wisdomhelp addnote'
  ],
  async execute(message, args) {
    // Load staff data
    const staffData = JSON.parse(fs.readFileSync('./config/staff.json', 'utf8'));
    const staffIds = staffData.staffIds || [];
    const ownerId = process.env.OWNER_ID;

    // Check if user has permission
    if (![ownerId, ...staffIds].includes(message.author.id)) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔒 Access Denied')
        .setDescription('This command is reserved for Wisdom Staff only.')
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
          .setFooter({ text: 'Use +wisdomhelp to see all commands' });
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

    // Group commands by category
    const categories = {
      '📝 Notes': ['addnote', 'shownotes'],
      '👮 Moderation': ['ban', 'unban', 'kick', 'mute', 'unmute', 'warn', 'unwarn'],
      '⚙️ Settings': ['setprefix', 'setlogchannel'],
      '📊 Statistics': ['vstatus', 'modstats'],
      '🛠️ Utility': ['wisdomhelp', 'ping', 'uptime']
    };

    // Create main help embed
    const mainEmbed = new EmbedBuilder()
      .setColor('#00bfff')
      .setTitle('📚 Wisdom Moderation System')
      .setDescription('Here are all available commands:')
      .setFooter({ text: 'Use +wisdomhelp <command> for detailed information' })
      .setTimestamp();

    // Add each category to the embed
    for (const [category, commandNames] of Object.entries(categories)) {
      const categoryCommands = commandNames
        .map(cmd => commands.get(cmd))
        .filter(cmd => cmd) // Filter out undefined commands
        .map(cmd => `\`${cmd.name}\`: ${cmd.description}`)
        .join('\n');

      if (categoryCommands) {
        mainEmbed.addFields({
          name: category,
          value: categoryCommands
        });
      }
    }

    // Add additional information
    mainEmbed.addFields({
      name: '📌 Additional Information',
      value: '• All commands are prefixed with `+`\n' +
             '• Use `+wisdomhelp <command>` for detailed information\n' +
             '• Commands are case-insensitive\n' +
             '• Required arguments are shown in `<>`\n' +
             '• Optional arguments are shown in `[]`'
    });

    message.reply({ embeds: [mainEmbed] });
  }
};
