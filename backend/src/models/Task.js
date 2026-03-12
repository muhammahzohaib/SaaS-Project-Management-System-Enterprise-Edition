const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    tags: [{ type: String }],
    isMilestone: { type: Boolean, default: false },
    storyPoints: { type: Number, default: 0 },
    budget: { type: Number, default: 0 },
    complexity: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    startDate: { type: Date },
    dueDate: { type: Date },
    recurring: {
      isRecurring: { type: Boolean, default: false },
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'none'], default: 'none' }
    },
    board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timeEstimation: { type: Number, default: 0 }, // in minutes
    timeSpent: { type: Number, default: 0 }, // in minutes
    order: { type: Number, default: 0 },
    subtasks: [
      {
        title: { type: String, required: true },
        isCompleted: { type: Boolean, default: false },
      },
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        size: Number
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
