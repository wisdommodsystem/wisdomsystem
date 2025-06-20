# Voice Channel Tracking System Setup

## Overview
This system tracks how long each user spends in voice channels and sends detailed embed messages to a log channel.

## Features
- ✅ Tracks all users' voice channel time
- ✅ Sends beautiful embed messages with user details
- ✅ Shows join/leave times in HH:MM format
- ✅ Displays total time spent (e.g., "1 hour and 30 minutes")
- ✅ Includes friendly motivational messages
- ✅ User avatar as thumbnail
- ✅ Toggle system for bot owner
- ✅ Handles channel switches and disconnections

## Environment Variables Required

Add these to your `.env` file:

```env
# Discord Bot Token
TOKEN=your_discord_bot_token_here

# Bot Owner ID (for tracktimer command)
OWNER_ID=your_discord_user_id_here

# Voice Channel Log Channel ID (where embeds will be sent)
VC_LOG_CHANNEL_ID=your_log_channel_id_here

# MongoDB Connection String (if using MongoDB)
MONGODB_URI=your_mongodb_connection_string_here
```

## How to Get Channel ID
1. Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode)
2. Right-click on the channel where you want logs sent
3. Click "Copy ID"
4. Paste the ID as the value for `VC_LOG_CHANNEL_ID`

## Commands

### `tracktimer` (Owner Only)
- **Usage**: `!tracktimer`
- **Aliases**: `!track`, `!toggletrack`
- **Description**: Toggles the voice tracking system on/off
- **Permission**: Bot owner only

## Embed Features

The system sends embeds containing:
- 👤 Username
- ⏰ Time joined and left (HH:MM format)
- ⏱️ Total time spent (human-readable format)
- 📺 Channel name
- 💬 Random friendly motivational message
- 🖼️ User's avatar as thumbnail
- 📝 Footer: "System Tracker by Apollo"

## Example Embed
```
🎤 Voice Channel Activity
**Username#1234** has been active in voice channels!

👤 Username: Username#1234
⏰ Time Joined: 14:30
⏰ Time Left: 16:45
⏱️ Total Time: 2 hours and 15 minutes
📺 Channel: General

💬 Message: You're shining with activity in the Wisdom Circle ✨ Keep it up, champ!

Footer: System Tracker by Apollo
```

## Installation
1. Ensure all files are in place:
   - `events/voiceStateUpdate.js` (updated)
   - `commands/tracktimer.js` (new)
2. Set up environment variables in `.env`
3. Restart your bot
4. Use `!tracktimer` to enable/disable tracking

## Notes
- The system tracks ALL users, not just staff
- Existing staff tracking functionality is preserved
- Tracking can be toggled on/off by the bot owner
- Embeds are sent to the specified log channel
- System handles joins, leaves, channel switches, and disconnections 