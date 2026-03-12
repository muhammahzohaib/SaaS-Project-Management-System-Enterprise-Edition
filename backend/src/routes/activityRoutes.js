const express = require('express');
const { protect } = require('../middleware/auth');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

const router = express.Router();
router.use(protect);

// Get Organization Activity Timeline
router.get('/timeline', async (req, res) => {
  try {
    const activities = await Activity.find({ organization: req.user.organization._id })
      .populate('user', 'name')
      .sort('-createdAt')
      .limit(20);
    res.json({ success: true, data: activities });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get User Notifications
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      recipient: req.user._id,
      organization: req.user.organization._id
    })
    .populate('sender', 'name')
    .sort('-createdAt')
    .limit(10);
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
