import { Conversation } from '../models/conversation.js';
import { getIO } from './index.js';
import { ObjectId } from 'mongodb';

export const updatedConversation = async (
  conversationId,
  userActiveConnections
) => {
  try {
    const conversation = await Conversation.findById(conversationId)
      .populate({
        path: 'messages',
        populate: {
          path: 'senderId',
          model: 'User',
          select: '_id username email',
        },
      })
      .populate({
        path: 'participants',
        model: 'User',
        select: '_id username email',
      });

    console.log('populate conversation: ', conversation);
    console.log('userActiveConnections: ', userActiveConnections);

    if (conversation) {
      getIO()
        .to(userActiveConnections)
        .emit('chat:updatedConversation', conversation);
    }
  } catch (error) {
    console.log(error);
  }
};

export const addedMessage = async (
  conversationId,
  message,
  userActiveConnections
) => {
  try {
    if (message && message.length) {
      getIO().to(userActiveConnections).emit('chat:addedMessage', {
        conversationId,
        message: message[0],
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const getChatHistory = async (socket, friendId) => {
  try {
    const currentUserId = socket.user._id;
    const currentUserObjectId = ObjectId.createFromHexString(currentUserId);

    const friendObjectId = ObjectId.createFromHexString(friendId);

    const conversation = await Conversation.findOne({
      participants: { $all: [currentUserObjectId, friendObjectId] },
    })
      .populate({
        path: 'messages',
        populate: {
          path: 'senderId',
          model: 'User',
          select: '_id username email',
        },
      })
      .populate({
        path: 'participants',
        model: 'User',
        select: '_id username email',
      });

    if (conversation) {
      getIO().to(socket.id).emit('chat:updatedConversation', conversation);
    }
  } catch (error) {
    console.log(error);
  }
};

/**
 * Sends newly created message to a user
 * @param {*} userId
 * @param {*} messageData { conversationId, message }
 */
export const sendMessageToUser = async (userActiveConnections, messageData) => {
  try {
    getIO().to(userActiveConnections).emit('chat:addedMessage', messageData);
  } catch (error) {
    console.log(error);
  }
};
