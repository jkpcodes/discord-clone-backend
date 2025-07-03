import { Conversation } from '../models/conversation.js';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { sendMessageToUser } from '../socket/chat.js';
import { Message } from '../models/message.js';
import { sendMessageToActiveUserConnections } from '../socket/socketStore.js';

export const getDirectMessages = async (req, res) => {
  const { id } = req.params;
  const { skip = 0, take = 50 } = req.query;
  const { user } = req;

  const currentUserObjectId = ObjectId.createFromHexString(user._id);
  const friendObjectId = ObjectId.createFromHexString(id);

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
      options: {
        sort: { date: -1 },
        skip: parseInt(skip),
        limit: parseInt(take),
      },
    })
    .populate({
      path: 'participants',
      model: 'User',
      select: '_id username email',
    });

  // If no conversation is found, return an empty array
  if (!conversation) {
    return res.status(200).json({ 
      messages: [],
      pagination: {
        skip: parseInt(skip),
        take: parseInt(take),
        hasMore: false,
      }
    });
  }

  // Sort messages by date in ascending order by date
  const hasMore = conversation.messages.length === parseInt(take);

  res.status(200).json({
    _id: conversation._id,
    messages: conversation.messages,
    participants: conversation.participants,
    pagination: {
      skip: parseInt(skip) + conversation.messages.length,
      take: parseInt(take),
      hasMore,
    },
  });
};

export const sendDirectMessage = async (req, res) => {
  console.log(req.body)
  const session = await mongoose.startSession();
  session.startTransaction();
  const { id: receiverId } = req.params;
  const { content, type } = req.body;
  const { user } = req;
  const userId = user._id;

  try {
    const senderObjectId = ObjectId.createFromHexString(user._id);
    const receiverObjectId = ObjectId.createFromHexString(receiverId);

    // create a new message
    const newMessage = await Message.create(
      [
        {
          senderId: senderObjectId,
          content,
          type,
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

    const messageData = {
      conversationId: conversation._id.toString(),
      participantIds: [userId, receiverId],
      message: newMessage[0],
    };

    // Send updated conversation to sender and receiver through socket
    sendMessageToActiveUserConnections(userId, (userId, userActiveConnections) => {
      sendMessageToUser(userActiveConnections, messageData);
    });
    sendMessageToActiveUserConnections(receiverId, (userId, userActiveConnections) => {
      sendMessageToUser(userActiveConnections, messageData);
    });
    // Only commit transaction if no errors occured
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: 'Internal server error' });
  }
};