const { body, param, query, validationResult } = require('express-validator');

exports.createProjectRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('status').optional().isIn(['active', 'archived', 'completed']),
];

exports.updateProjectRules = [
  param('id').isMongoId(),
  body('name').optional().trim().notEmpty().isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('status').optional().isIn(['active', 'archived', 'completed']),
  body('members').optional().isArray(),
];

exports.idParam = [param('id').isMongoId()];

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};
