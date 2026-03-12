/**
 * File Upload Routes - Handles task attachment uploads
 * Uses multer for local disk storage (swap for S3 in production)
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const Task = require('../models/Task');

const router = express.Router();
router.use(protect);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|xlsx|txt|zip/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext || mime) return cb(null, true);
    cb(new Error('File type not supported'));
  }
});

/**
 * POST /api/v1/upload/task/:taskId
 * Upload a file and attach it to a task
 */
router.post('/task/:taskId', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const task = await Task.findOne({ 
      _id: req.params.taskId,
      organization: req.user.organization 
    });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const attachment = {
      name: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      type: path.extname(req.file.originalname).replace('.', '').toUpperCase(),
      size: req.file.size
    };

    task.attachments.push(attachment);
    await task.save();

    res.json({ success: true, data: attachment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
