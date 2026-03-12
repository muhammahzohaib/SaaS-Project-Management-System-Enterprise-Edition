const express = require('express');
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { tenantFilter } = require('../middleware/tenant');

const router = express.Router();
router.use(protect);
router.use(tenantFilter);

router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.post('/:id/comments', taskController.addComment);
router.post('/:id/subtasks', taskController.addSubtask);

module.exports = router;
