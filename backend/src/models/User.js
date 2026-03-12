/**
 * User model - Security: Mongoose schema validation prevents invalid data
 * Password hashed in controller before save (never store plain text)
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['admin', 'manager', 'member', 'guest'], default: 'member' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }, // primary org (for tenant isolation)
    organizations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }], // all orgs (for multi-workspace)
    status: { type: String, enum: ['online', 'offline', 'away'], default: 'offline' },
    lastSeen: { type: Date, default: Date.now },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

// Security: Don't expose password in JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
