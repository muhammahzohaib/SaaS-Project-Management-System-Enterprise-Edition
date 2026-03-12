const express = require('express');
const contactController = require('../controllers/contactController');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
router.post('/', apiLimiter, contactController.contactRules, contactController.validate, contactController.sendContact);

module.exports = router;
