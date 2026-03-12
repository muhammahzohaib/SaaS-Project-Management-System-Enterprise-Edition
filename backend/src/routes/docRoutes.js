const express = require('express');
const router = express.Router();
const Doc = require('../models/Doc');
const { protect } = require('../middleware/auth');

// Get all docs for a project
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const docs = await Doc.find({ 
      project: req.params.projectId,
      organization: req.user.organization
    }).populate('createdBy', 'name').sort('-updatedAt');
    res.json({ success: true, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create a doc
router.post('/', protect, async (req, res) => {
  try {
    const doc = await Doc.create({
      ...req.body,
      organization: req.user.organization,
      createdBy: req.user._id
    });
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Update a doc
router.put('/:id', protect, async (req, res) => {
  try {
    const doc = await Doc.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization },
      { ...req.body, lastModifiedBy: req.user._id },
      { new: true }
    );
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
