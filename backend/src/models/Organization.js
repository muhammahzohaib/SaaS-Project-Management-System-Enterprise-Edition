const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    settings: {
      theme: { type: String, default: 'light' },
      logo: { type: String, default: '' },
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'past_due', 'canceled', 'trialing'],
      default: 'active'
    },
    limits: {
      maxProjects: { type: Number, default: 3 },
      maxMembers: { type: Number, default: 5 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Organization', organizationSchema);
