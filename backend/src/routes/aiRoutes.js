const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// AI Knowledge Base for Demo (Simulated AI)
const SUGGESTIONS = {
  default: {
    subtasks: ['Research requirements', 'Create initial draft', 'Final review'],
    description: 'This task involves standard development procedures and quality assurance checks.'
  },
  login: {
    subtasks: ['Design auth flow', 'Implement API endpoints', 'Create UI components', 'Add validation', 'Write unit tests'],
    description: 'Build a secure authentication system using industry best practices like JWT and bcrypt.'
  },
  database: {
    subtasks: ['Define schema', 'Set up indexing', 'Configure migrations', 'Test data integrity'],
    description: 'Optimize the data layer for performance and scalability.'
  },
  api: {
    subtasks: ['Define endpoints', 'Implement controllers', 'Add request validation', 'Document with Swagger'],
    description: 'Develop a RESTful API following modular architecture and clean code principles.'
  },
  ui: {
    subtasks: ['Create mockups', 'Build responsive components', 'Integrate state management', 'Conduct cross-browser testing'],
    description: 'Create a pixel-perfect, responsive user interface with focus on accessibility.'
  }
};

/**
 * @route   POST /api/v1/ai/suggest
 * @desc    Get AI suggestions for a task title
 */
router.post('/suggest', async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

  // REAL WORLD: This is where you would call OpenAI / Anthropic / Google Gemini
  /*
  const response = await aiClient.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: `Suggest 5 subtasks for: ${title}` }]
  });
  */

  // MOCK AI LOGIC (Simulated Intelligence)
  const query = title.toLowerCase();
  let match = SUGGESTIONS.default;
  
  for (const key in SUGGESTIONS) {
    if (query.includes(key)) {
      match = SUGGESTIONS[key];
      break;
    }
  }

  // Add some randomness to make it feel "alive"
  const data = {
    subtasks: match.subtasks,
    description: match.description,
    isAIGenerated: true
  };

  res.json({ success: true, data });
});

module.exports = router;
