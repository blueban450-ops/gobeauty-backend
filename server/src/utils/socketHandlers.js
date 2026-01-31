import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import Notification from '../models/Notification.js';

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    // User joins their own room
    socket.on('join', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined room`);
    });

    // Join chat room
    socket.on('join-chat', (chatId) => {
      socket.join(`chat:${chatId}`);
      console.log(`Socket joined chat: ${chatId}`);
    });

    // Send message
    socket.on('send-message', async (data) => {
      try {
        const { chatId, senderId, senderType, text, attachment } = data;

        // Create message
        const message = await Message.create({
          chat: chatId,
          senderId,
          senderType,
          text,
          attachment,
          read: false
        });

        // Update chat last message
        const chat = await Chat.findByIdAndUpdate(
          chatId,
          {
            lastMessage: text,
            lastMessageAt: new Date(),
            ...(senderType === 'user' 
              ? { $inc: { unreadProvider: 1 } } 
              : { $inc: { unreadUser: 1 } }
            )
          },
          { new: true }
        ).populate('user provider');

        // Populate message sender
        const populatedMessage = await Message.findById(message._id);

        // Emit to chat room
        io.to(`chat:${chatId}`).emit('new-message', populatedMessage);

        // Emit to recipient's user room
        const recipientId = senderType === 'user' ? chat.provider : chat.user;
        io.to(`user:${recipientId}`).emit('chat-notification', {
          chatId,
          message: text,
          senderId
        });

        console.log(`Message sent in chat ${chatId}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', ({ chatId, userId, isTyping }) => {
      socket.to(`chat:${chatId}`).emit('user-typing', { userId, isTyping });
    });

    // Mark messages as read
    socket.on('mark-read', async ({ chatId, userId, userType }) => {
      try {
        await Message.updateMany(
          { chat: chatId, senderId: { $ne: userId }, read: false },
          { read: true }
        );

        await Chat.findByIdAndUpdate(chatId, {
          ...(userType === 'user' 
            ? { unreadUser: 0 } 
            : { unreadProvider: 0 }
          )
        });

        socket.to(`chat:${chatId}`).emit('messages-read', { chatId });
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    // Broadcast notification
    socket.on('send-notification', async (data) => {
      try {
        const { userId, providerId, type, title, message, data: notifData } = data;

        const notification = await Notification.create({
          userId: userId || undefined,
          providerId: providerId || undefined,
          type,
          title,
          body: message,
          dataJson: notifData,
          isRead: false
        });

        // Emit to specific user/provider
        if (userId) {
          io.to(`user:${userId}`).emit('notification', notification);
        }
        if (providerId) {
          io.to(`user:${providerId}`).emit('notification', notification);
        }

        console.log(`Notification sent: ${type}`);
      } catch (error) {
        console.error('Notification error:', error);
      }
    });

    // Booking status update notification
    socket.on('booking-update', async (data) => {
      try {
        const { bookingId, userId, providerId, status } = data;

        const notifData = {
          userId,
          providerId,
          type: 'booking-update',
          title: 'Booking Update',
          body: `Your booking has been ${status}`,
          dataJson: { bookingId, status },
          isRead: false
        };

        const notification = await Notification.create(notifData);

        io.to(`user:${userId}`).emit('notification', notification);
        io.to(`user:${providerId}`).emit('notification', notification);
      } catch (error) {
        console.error('Booking notification error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};
