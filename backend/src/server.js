require('dotenv').config();
const { validateEnv } = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');
const http = require('http');
const { init } = require('./utils/socket');

validateEnv();
connectDB();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
init(server);

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
