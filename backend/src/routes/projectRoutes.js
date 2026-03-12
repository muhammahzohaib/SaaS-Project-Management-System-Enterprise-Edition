const express = require('express');
const projectController = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');
const { tenantFilter } = require('../middleware/tenant');
const { checkLimits } = require('../middleware/billing');
const { createProjectRules, updateProjectRules, idParam, validate } = require('../validators/projectValidator');

const router = express.Router();
router.use(protect);
router.use(tenantFilter);

router.get('/', projectController.getProjects);
router.get('/:id', idParam, validate, projectController.getProject);
router.post('/', checkLimits, createProjectRules, validate, projectController.createProject);
router.put('/:id', updateProjectRules, validate, projectController.updateProject);
router.delete('/:id', idParam, validate, projectController.deleteProject);

module.exports = router;
