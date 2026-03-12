const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { tenantFilter } = require('../middleware/tenant');

const router = express.Router();

router.use(protect);
router.use(tenantFilter);

router.get('/org-stats', analyticsController.getOrgStats);

module.exports = router;
