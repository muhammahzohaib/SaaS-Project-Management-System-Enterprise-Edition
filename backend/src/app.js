/**
 * Express app - Security: helmet, CORS, sanitization, rate limit applied first
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const boardRoutes = require('./routes/boardRoutes');
const taskRoutes = require('./routes/taskRoutes');
const contactRoutes = require('./routes/contactRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const activityRoutes = require('./routes/activityRoutes');
const aiRoutes = require('./routes/aiRoutes');
const docRoutes = require('./routes/docRoutes');
const searchRoutes = require('./routes/searchRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const path = require('path');

const app = express();

// Security: Helmet sets secure HTTP headers (XSS, clickjacking, etc.)
app.use(helmet());

// Security: CORS - restrict origins in production
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Security: NoSQL injection - strip $ and . from user input
app.use(mongoSanitize());

// Security: XSS - sanitize user input
app.use(xss());

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Security: Rate limiting
app.use('/api', apiLimiter);

const apiVersion = process.env.API_VERSION || 'v1';
const base = `/api/${apiVersion}`;

app.use(`${base}/auth`, authRoutes);
app.use(`${base}/projects`, projectRoutes);
app.use(`${base}/boards`, boardRoutes);
app.use(`${base}/tasks`, taskRoutes);
app.use(`${base}/contact`, contactRoutes);
app.use(`${base}/analytics`, analyticsRoutes);
app.use(`${base}/activities`, activityRoutes);
app.use(`${base}/ai`, aiRoutes);
app.use(`${base}/search`, searchRoutes);
app.use(`${base}/docs`, docRoutes);
app.use(`${base}/upload`, uploadRoutes);

// Serve uploaded files as static assets
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use(errorHandler);

module.exports = app;
