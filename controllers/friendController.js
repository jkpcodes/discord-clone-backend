import { FriendInvitation } from '../models/friendInvitation.js';
import { User } from '../models/user.js';
import { FRIEND_ROUTES_MESSAGES } from '../constants/friend.js';
import {
  updatedFriendInvitations,
  updatedSentInvitations,
  updatedFriendsList,
  updatedOnlineFriends,
} from '../socket/friends.js';
import mongoose from 'mongoose';
import { sendMessageToActiveUserConnections } from '../socket/socketStore.js';

export const inviteFriend = async (req, res) => {
  const { email } = req.body;
  const { user } = req;

  const targetEmail = email.trim().toLowerCase();

  // Check if receiver is the same as the sender
  if (targetEmail === user.email.trim().toLowerCase()) {
    return res
      .status(409)
      .json({ message: FRIEND_ROUTES_MESSAGES.FRIEND_INVITATION_SAME_USER });
  }

  try {
    const receiver = await User.findOne({ email: targetEmail });

    // Check if receipient exists
    if (!receiver) {
      return res.status(404).json({
        message: FRIEND_ROUTES_MESSAGES.FRIEND_INVITATION_USER_NOT_FOUND,
      });
    }

    // Check if the receiver is already a friend
    const isAlreadyFriends = receiver.friends.some(
      (friendId) => friendId.toString() === user._id
    );

    if (isAlreadyFriends) {
      return res.status(409).json({
        message: FRIEND_ROUTES_MESSAGES.FRIEND_INVITATION_ALREADY_FRIENDS,
      });
    }

    // Check if friend invitation already exists
    const existingInvitation = await FriendInvitation.findOne({
      senderId: user._id,
      receiverId: receiver._id,
    });

    if (existingInvitation) {
      return res.status(409).json({
        message: FRIEND_ROUTES_MESSAGES.FRIEND_INVITATION_ALREADY_SENT,
      });
    }

    // Check if receiver already sent an invitation to the sender
    const existingReceiverInvitation = await FriendInvitation.findOne({
      senderId: receiver._id,
      receiverId: user._id,
    });

    if (existingReceiverInvitation) {
      return res.status(409).json({
        message: FRIEND_ROUTES_MESSAGES.FRIEND_INVITATION_ALREADY_RECEIVED,
      });
    }

    // Create a new friend invitation
    const newInvitation = await FriendInvitation.create({
      senderId: user._id,
      receiverId: receiver._id,
    });

    // Check if the invitation was created successfully
    if (!newInvitation) {
      return res
        .status(400)
        .json({ message: FRIEND_ROUTES_MESSAGES.SEND_FRIEND_INVITATION_ERROR });
    }

    // Update the pending invitations for the receiver
    sendMessageToActiveUserConnections(
      receiver._id.toString(),
      updatedFriendInvitations
    );

    // Update the sent invitations for the sender
    sendMessageToActiveUserConnections(
      user._id.toString(),
      updatedSentInvitations
    );

    res.status(201).json({
      message: FRIEND_ROUTES_MESSAGES.FRIEND_INVITATION_SUCCESS,
    });
  } catch (error) {
    console.error('Invite friend error: ', error);
    res
      .status(500)
      .json({ message: FRIEND_ROUTES_MESSAGES.SEND_FRIEND_INVITATION_ERROR });
  }
};

export const acceptFriend = async (req, res) => {
  const { id } = req.body;
  const { user } = req;

  const receiverId = user._id.toString();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const invitation = await FriendInvitation.findById(id)
      .populate('senderId', '_id username email')
      .populate('receiverId', '_id username email');

    if (!invitation) {
      return res
        .status(404)
        .json({ message: FRIEND_ROUTES_MESSAGES.FRIEND_INVITATION_NOT_FOUND });
    }

    const senderId = invitation.senderId._id.toString();

    // Add sender to the current user's friends list
    await User.updateOne(
      { _id: receiverId },
      { $push: { friends: invitation.senderId._id } },
      { new: true },
      { session }
    );

    // Add current user to the sender user's friends list
    await User.updateOne(
      { _id: senderId },
      { $push: { friends: invitation.receiverId._id } },
      { new: true },
      { session }
    );

    // Delete the invitation from the database
    await FriendInvitation.findByIdAndDelete(id, { session });

    // Update the sent invitations and friends list for the receiver
    sendMessageToActiveUserConnections(
      receiverId,
      updatedFriendInvitations,
      updatedFriendsList,
      updatedOnlineFriends
    );

    // Update the sent invitations and friends list for the sender
    sendMessageToActiveUserConnections(
      senderId,
      updatedSentInvitations,
      updatedFriendsList,
      updatedOnlineFriends
    );

    await session.commitTransaction();
    return res.status(200).json({
      message: FRIEND_ROUTES_MESSAGES.FRIEND_INVITATION_ACCEPTED,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      message: FRIEND_ROUTES_MESSAGES.FRIEND_INVITATION_SERVER_ERROR,
    });
  } finally {
    session.endSession();
  }
};

export const rejectFriend = async (req, res, mode = 'reject') => {
  const { id } = req.body;
  const { user } = req;

  try {
    const invitation = await FriendInvitation.findById(id)
      .populate('senderId', '_id username email')
      .populate('receiverId', '_id username email');

    if (!invitation) {
      return res
        .status(404)
        .json({ message: FRIEND_ROUTES_MESSAGES.FRIEND_INVITATION_NOT_FOUND });
    }

    // Delete the invitation from the database
    await FriendInvitation.findByIdAndDelete(id);

    // Update the pending invitations for the receiver
    sendMessageToActiveUserConnections(
      invitation.receiverId._id.toString(),
      updatedFriendInvitations
    );

    // Update the sent invitations for the sender
    sendMessageToActiveUserConnections(
      invitation.senderId._id.toString(),
      updatedSentInvitations
    );

    res.status(200).json({
      message:
        mode === 'reject'
          ? FRIEND_ROUTES_MESSAGES.FRIEND_INVITATION_REJECTED
          : FRIEND_ROUTES_MESSAGES.FRIEND_INVITATION_CANCELED,
    });
  } catch (error) {
    console.error('Reject friend error: ', error);
    res.status(500).json({
      message: FRIEND_ROUTES_MESSAGES.FRIEND_INVITATION_SERVER_ERROR,
    });
  }
};
