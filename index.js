const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Set bot status to DND when ready
client.once('ready', () => {
  client.user.setPresence({
    activities: [{ name: 'Wisdom', type: ActivityType.Playing }],
    status: 'dnd'
  });
  console.log(`✅ ${client.user.tag} is online and set to DND!`);
});

// Global MongoDB connection state
global.mongoConnected = false;

// Function to check MongoDB connection status
function checkMongoDBStatus() {
  const states = {
    0: '❌ Disconnected',
    1: '✅ Connected',
    2: '🔄 Connecting',
    3: '🔄 Disconnecting',
    99: '❓ Uninitialized'
  };
  
  const state = states[mongoose.connection.readyState] || '❓ Unknown';
  const dbName = mongoose.connection.name || 'Not connected';
  const host = mongoose.connection.host || 'Not connected';
  const port = mongoose.connection.port || 'Not connected';
  
  console.log('\n=== MongoDB Connection Status ===');
  console.log(`Status: ${state}`);
  console.log(`Database: ${dbName}`);
  console.log(`Host: ${host}`);
  console.log(`Port: ${port}`);
  console.log(`Ready State: ${mongoose.connection.readyState}`);
  console.log('===============================\n');
}

// Function to connect to MongoDB
async function connectToMongoDB() {
  try {
    console.log('\n=== MongoDB Connection Attempt ===');
    const mongoURI = 'mongodb+srv://razorclaw996:0654788685razor@discordbot.dkbsd.mongodb.net/?retryWrites=true&w=majority';
    console.log('MongoDB URI:', mongoURI ? '✅ Present' : '❌ Missing');
    
    console.log('🔄 Attempting to connect to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    global.mongoConnected = true;
    console.log('✅ MongoDB connected successfully!');
    checkMongoDBStatus();
  } catch (error) {
    global.mongoConnected = false;
    console.error('\n❌ MongoDB connection error:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.log('\n🔄 Retrying connection in 5 seconds...');
    setTimeout(connectToMongoDB, 5000);
  }
}

// Initialize MongoDB connection
console.log('\n=== Starting MongoDB Connection ===');
connectToMongoDB();

// Set up periodic status check
setInterval(checkMongoDBStatus, 30000);

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  global.mongoConnected = true;
  console.log('\n✅ MongoDB connected');
  checkMongoDBStatus();
});

mongoose.connection.on('error', (err) => {
  global.mongoConnected = false;
  console.error('\n❌ MongoDB connection error:', err);
  checkMongoDBStatus();
});

mongoose.connection.on('disconnected', () => {
  global.mongoConnected = false;
  console.log('\n❌ MongoDB disconnected');
  checkMongoDBStatus();
});

// Command handling setup
client.commands = new Collection();
client.aliases = new Collection();
client.cooldowns = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if ('name' in command && 'execute' in command) {
    client.commands.set(command.name, command);
    console.log(`✅ Loaded command: ${command.name}`);
    
    // Handle aliases
    if (command.aliases && Array.isArray(command.aliases)) {
      command.aliases.forEach(alias => {
        client.aliases.set(alias, command.name);
        console.log(`  └─ Alias: ${alias}`);
      });
    }
  } else {
    console.log(`⚠️ Command at ${filePath} is missing required properties`);
  }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
  console.log(`✅ Loaded event: ${event.name}`);
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🔄 Closing MongoDB connection...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

// Login to Discord
client.login(process.env.TOKEN);
