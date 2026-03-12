const express = require('express');
const { protect } = require('../middleware/auth');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

const router = express.Router();
router.use(protect);

/**
 * @route   GET /api/v1/search
 * @desc    Global search across projects, tasks, and members
 */
router.get('/', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ success: false, message: 'Query is required' });

  const query = { $regex: q, $options: 'i' };
  const organization = req.user.organization._id;

  try {
    const [projects, tasks, users] = await Promise.all([
      Project.find({ organization, name: query }).limit(5),
      Task.find({ 
        organization, 
        $or: [
          { title: query },
          { description: query },
          { 'comments.text': query },
          { tags: query }
        ]
      }).populate('board', 'project').limit(10),
      User.find({ organization, name: query }).limit(5)
    ]);

    res.json({
      success: true,
      data: {
        projects: projects.map(p => ({ id: p._id, name: p.name, type: 'project' })),
        tasks: tasks.map(t => ({ id: t._id, name: t.title, type: 'task', projectId: t.project })),
        users: users.map(u => ({ id: u._id, name: u.name, type: 'user' }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Search failed' });
  }
});

module.exports = router;
