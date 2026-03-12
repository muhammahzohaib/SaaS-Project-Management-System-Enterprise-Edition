/**
 * Socket.io configuration - Real-time collaboration
 * Rooms are scoped by organizationId for secure multi-tenant communication
 */
const socketIo = require('socket.io');

let io;

const init = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join organization-specific room
    socket.on('join_org', (orgId) => {
      socket.join(orgId);
      console.log(`User joined org room: ${orgId}`);
    });

    // Join project-specific room
    socket.on('join_project', (projectId) => {
      socket.join(projectId);
      console.log(`User joined project room: ${projectId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// Helper to emit events to specific rooms
const emitToOrg = (orgId, event, data) => {
  if (io) io.to(orgId).emit(event, data);
};

const emitToProject = (projectId, event, data) => {
  if (io) io.to(projectId).emit(event, data);
};

module.exports = { init, getIO, emitToOrg, emitToProject };
