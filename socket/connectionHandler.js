import {
  addToClientMap,
  removeFromClientMap,
  logConnectedClients,
} from './socketStore.js';
import {
  updatedFriendInvitations,
  updatedSentInvitations,
  updatedFriendsList,
  updatedOnlineFriends,
  updatedOfflineStatus,
} from './friends.js';
import { sendMessageToActiveUserConnections } from './socketStore.js';
import { Message } from '../models/message.js';
import { Conversation } from '../models/conversation.js';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { updatedConversation, addedMessage } from './chat.js';
import { disconnectUserFromAllVoiceChannels } from './channelServer.js';

export const newConnectionHandler = async (socket) => {
  console.log('newConnectionHandler: ', socket.user._id);
  addToClientMap(socket.id, socket.user._id, socket.instanceId);
  logConnectedClients();

  sendMessageToActiveUserConnections(
    socket.user._id,
    updatedFriendInvitations,
    updatedSentInvitations,
    updatedFriendsList,
    updatedOnlineFriends
  );
}; 

export const disconnectHandler = async (socket) => {
  removeFromClientMap(socket.id);
  logConnectedClients();

  updatedOfflineStatus(socket.user._id);
  // Disconnect user from connected voice channels
  disconnectUserFromAllVoiceChannels(socket.user._id);
};

export const directMessageHandler = async (socket, messageData) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    console.log('directMessageHandler: ', messageData);
    const senderId = socket.user._id;
    const senderObjectId = ObjectId.createFromHexString(senderId);

    const { receiverId, content } = messageData;
    const receiverObjectId = ObjectId.createFromHexString(receiverId);
    // create a new message
    const newMessage = await Message.create(
      [
        {
          senderId: senderObjectId,
          content,
          type: 'direct',
        },
      ],
      { session }
    );

    // find if conversation exists between sender and receiver
    let conversation = await Conversation.findOne({
      participants: { $all: [senderObjectId, receiverObjectId] },
    });

    if (conversation) {
      // add the new message to the conversation
      conversation.messages.push(newMessage[0]._id);
      await conversation.save({ session });
    } else {
      // create a new conversation
      const result = await Conversation.create(
        [
          {
            participants: [senderObjectId, receiverObjectId],
            messages: [newMessage[0]._id],
          },
        ],
        { session }
      );

      conversation = result ? result[0] : null;
    }

    console.log('conversation: ', conversation);

    const conversationId = conversation._id.toString();

    // Only commit transaction if no errors occured
    await session.commitTransaction();

    // Send updated conversation to sender and receiver
    sendMessageToActiveUserConnections(
      senderId,
      (userId, userActiveConnections) =>
        updatedConversation(conversationId, userActiveConnections)
    );
    sendMessageToActiveUserConnections(
      receiverId,
      (userId, userActiveConnections) =>
        updatedConversation(conversationId, userActiveConnections)
    );
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
  } finally {
    await session.endSession();
  }
};
