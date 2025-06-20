const fs = require('fs');
const StaffActivity = require('../models/StaffActivity');

module.exports = {
  name: 'inviteCreate',
  async execute(invite) {
    // Load staff lists
    const teamData = JSON.parse(fs.readFileSync('./config/team.json', 'utf8'));
    const trustedUsers = teamData.trusted || [];
    const ownerId = process.env.OWNER_ID;
    const staffData = JSON.parse(fs.readFileSync('./config/staff.json', 'utf8'));
    const staffIds = staffData.staffIds || [];

    const userId = invite.inviterId;
    if (![ownerId, ...trustedUsers, ...staffIds].includes(userId)) return;

    try {
      let staffActivity = await StaffActivity.findOne({ userId });
      if (!staffActivity) {
        staffActivity = new StaffActivity({
          userId,
          username: invite.inviter.tag
        });
      }
      staffActivity.invites += 1;
      await staffActivity.save();
    } catch (error) {
      console.error('Error updating invite count:', error);
    }
  }
}; 