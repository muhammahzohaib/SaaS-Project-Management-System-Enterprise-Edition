const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const { emitToOrg } = require('./socket');

/**
 * Log a system activity and optionally notify recipients
 */
const logActivity = async ({ organization, user, project, task, action, details, notifyRecipient = null }) => {
  try {
    // 1. Log Activity
    const activity = await Activity.create({
      organization,
      user,
      project,
      task,
      action,
      details
    });

    // 2. Broadcast Activity via Socket
    emitToOrg(organization.toString(), 'new_activity', activity);

    // 3. Create Notification if needed
    if (notifyRecipient && notifyRecipient.toString() !== user.toString()) {
      const notification = await Notification.create({
        recipient: notifyRecipient,
        sender: user,
        organization,
        type: action,
        title: action.replace('_', ' ').toUpperCase(),
        message: details,
        link: project ? `/projects/${project}` : '/dashboard'
      });

      // Emit to specific user if he's online
      // For now, we emit to org and let frontend filter, or we could have user-specific rooms
      emitToOrg(organization.toString(), 'new_notification', notification);
    }

    return activity;
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
};

module.exports = { logActivity };
