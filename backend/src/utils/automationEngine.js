const Automation = require('../models/Automation');
const Task = require('../models/Task');
const { logActivity } = require('./activityLogger');

const processAutomations = async (task, triggerType, currentUser) => {
  try {
    const automations = await Automation.find({ 
      organization: task.organization, 
      trigger: triggerType,
      isActive: true 
    });

    for (const auto of automations) {
      // 1. Check Condition
      if (auto.condition.field && task[auto.condition.field] !== auto.condition.value) continue;

      // 2. Execute Action
      switch (auto.action) {
        case 'move_to_board':
          task.board = auto.actionConfig.targetId;
          await task.save();
          await logActivity({
            organization: task.organization,
            user: currentUser._id,
            task: task._id,
            action: 'task_updated',
            details: `Automation executed: moved task to board`
          });
          break;
        
        case 'assign_user':
          task.assignee = auto.actionConfig.targetId;
          await task.save();
          break;

        case 'send_notification':
          await logActivity({
            organization: task.organization,
            user: currentUser._id,
            task: task._id,
            action: 'mention',
            details: auto.actionConfig.message,
            notifyRecipient: auto.actionConfig.targetId
          });
          break;
      }
    }
  } catch (err) {
    console.error('Automation Engine Error:', err);
  }
};

module.exports = { processAutomations };
