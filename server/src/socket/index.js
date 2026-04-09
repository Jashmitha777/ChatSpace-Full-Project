import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Conversation } from '../models/Conversation.js';
import { Room } from '../models/Room.js';

const socketUserMap = new Map();

export const initSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        return next(new Error('Authentication error'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    socketUserMap.set(socket.id, socket.user._id.toString());
    socket.join(`user:${socket.user._id}`);

    const [rooms, conversations] = await Promise.all([
      Room.find({ members: socket.user._id }).select('_id'),
      Conversation.find({ participants: socket.user._id }).select('_id')
    ]);

    rooms.forEach((room) => socket.join(`room:${room._id}`));
    conversations.forEach((conversation) => socket.join(`conversation:${conversation._id}`));

    socket.on('join-room', (roomId) => {
      socket.join(`room:${roomId}`);
    });

    socket.on('join-conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('typing', ({ chatType, chatId }) => {
      socket.to(`${chatType}:${chatId}`).emit('typing', {
        chatType,
        chatId,
        user: {
          _id: socket.user._id,
          name: socket.user.name
        }
      });
    });

    socket.on('stop-typing', ({ chatType, chatId }) => {
      socket.to(`${chatType}:${chatId}`).emit('stop-typing', {
        chatType,
        chatId,
        userId: socket.user._id
      });
    });

    socket.on('disconnect', () => {
      socketUserMap.delete(socket.id);
    });
  });
};

export const emitNewMessage = (io, message) => {
  const roomName = `${message.chatType}:${message.chatType === 'room' ? message.room._id : message.conversation._id}`;
  io.to(roomName).emit('new-message', message);

  if (message.chatType === 'private') {
    message.conversation.participants.forEach((participant) => {
      io.to(`user:${participant._id}`).emit('conversation-updated', message.conversation);
    });
  }
};
