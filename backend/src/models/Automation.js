const mongoose = require('mongoose');

const automationSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    name: { type: String, required: true },
    trigger: {
      type: String,
      enum: ['status_changed', 'task_created', 'priority_high'],
      required: true,
    },
    condition: {
      field: String,
      value: String,
    },
    action: {
      type: String,
      enum: ['move_to_board', 'assign_user', 'send_notification'],
      required: true,
    },
    actionConfig: {
      targetId: mongoose.Schema.Types.ObjectId, // Board ID or User ID
      message: String
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Automation', automationSchema);
