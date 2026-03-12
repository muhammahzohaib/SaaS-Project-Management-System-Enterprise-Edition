const express = require('express');
const boardController = require('../controllers/boardController');
const { protect } = require('../middleware/auth');
const { tenantFilter } = require('../middleware/tenant');

const router = express.Router();
router.use(protect);
router.use(tenantFilter);

router.get('/', boardController.getBoards);
router.post('/', boardController.createBoard);
router.put('/:id', boardController.updateBoard);
router.delete('/:id', boardController.deleteBoard);

module.exports = router;
