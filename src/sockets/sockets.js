// server.js or sockets.js
const socketIO = require('socket.io');
const winston = require('winston');
const { v4: uuidv4 } = require('uuid'); // For generating unique group IDs

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

const setupSockets = (io) => {
  io.on('connection', (socket) => {
    logger.info(`New user connected: ${socket.id}`);

    // Register user
    socket.on('register', (username) => {
      if (!username) return socket.emit('error', { msg: 'Username is required' });

      socket.username = username;
      logger.info(`${username} registered with socket ID: ${socket.id}`);
      socket.emit('registered', { username, socketId: socket.id });
    });

    // Create group and return groupId
    socket.on('create_group', () => {
      const groupId = uuidv4();
      socket.join(groupId);
      logger.info(`Group created with ID: ${groupId} by user ${socket.id}`);
      socket.emit('group_created', { groupId });
    });

    // Join group
    socket.on('join_group', (groupId) => {
      if (!groupId) return socket.emit('error', { msg: 'Invalid groupId' });
      socket.join(groupId);
      logger.info(`User ${socket.id} joined group ${groupId}`);
    });

    // Leave group
    socket.on('leave_group', (groupId) => {
      socket.leave(groupId);
      logger.info(`User ${socket.id} left group ${groupId}`);
    });

    // Send direct message
    socket.on('send_message_to_user', ({ receiverId, message }) => {
      if (!receiverId || !message) return socket.emit('error', { msg: 'Invalid data for message' });
      io.to(receiverId).emit('receive_message_from_user', { senderId: socket.id, message });
      logger.info(`Message sent from ${socket.id} to ${receiverId}: ${message}`);
    });

    // Send message to group
    socket.on('send_message_to_group', ({ groupId, message }) => {
      if (!groupId || !message) return socket.emit('error', { msg: 'Invalid data for group message' });
      io.to(groupId).emit('receive_message_from_group', { senderId: socket.id, message });
      logger.info(`Message sent to group ${groupId} from ${socket.id}: ${message}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = { setupSockets };
