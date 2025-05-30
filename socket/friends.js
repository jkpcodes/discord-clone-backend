import { User } from '../models/user.js';
import { FriendInvitation } from '../models/friendInvitation.js';
import { getIO } from './index.js';
import { getOnlineUsers, getActiveConnectionsByUserId } from './socketStore.js';

/**
 * Send updated friend invitations to the user
 * @param {string} userId - The user's ID
 * @param {Array} userActiveConnections - The user's active connections
 */
export const updatedFriendInvitations = async (
  userId,
  userActiveConnections
) => {
  try {
    // Find all pending invitations for the user and populate the senderId field with the sender's _id, username, and email
    const pendingInvitations = await FriendInvitation.find({
      receiverId: userId,
    }).populate('senderId', '_id username email');

    getIO()
      .to(userActiveConnections)
      .emit('friend:invitations', pendingInvitations ? pendingInvitations : []);
  } catch (error) {
    console.log(error);
  }
};

/**
 * Send updated sent invitations to the user
 * @param {string} userId - The user's ID
 * @param {Array} userActiveConnections - The user's active connections
 */
export const updatedSentInvitations = async (userId, userActiveConnections) => {
  try {
    // Send updated sent invitations to the user
    const sentInvitations = await FriendInvitation.find({
      senderId: userId,
    }).populate('receiverId', '_id username email');

    getIO()
      .to(userActiveConnections)
      .emit('friend:sentInvitations', sentInvitations ? sentInvitations : []);
  } catch (error) {
    console.log(error);
  }
};

/**
 * Send updated friends list to the user
 * @param {string} userId - The user's ID
 * @param {Array} userActiveConnections - The user's active connections
 * @returns {Array} - The user's friends list
 */
export const updatedFriendsList = async (userId, userActiveConnections) => {
  try {
    const user = await User.findById(userId, { _id: 1, friends: 1 }).populate(
      'friends',
      '_id username email'
    );

    if (user) {
      getIO()
        .to(userActiveConnections)
        .emit('friend:friendsList', user.friends ? user.friends : []);
    }
  } catch (error) {
    console.log(error);
  }
};

/**
 * Send updated online friends to the user
 * NOTE: This function is only called when the user goes online
 * @param {string} userId - The user's ID
 * @param {Array} userActiveConnections - The user's active connections
 */
export const updatedOnlineFriends = async (userId, userActiveConnections) => {
  try {
    const user = await User.findById(userId, { _id: 1, friends: 1 }).populate(
      'friends',
      '_id username email'
    );

    // Send online friends to the user
    const onlineFriends = getOnlineUsers().filter((userID) =>
      user.friends.some((friend) => friend._id.toString() === userID)
    );

    // Send online friends list to the user
    getIO()
      .to(userActiveConnections)
      .emit('friend:onlineFriends', onlineFriends ? onlineFriends : []);

    // Send online user id to the online friends
    onlineFriends.forEach((friendId) => {
      const friendActiveConnections = getActiveConnectionsByUserId(friendId);

      getIO()
        .to(friendActiveConnections)
        .emit('friend:onlineFriendID', userId);
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * Send updated offline status to the user's online friends
 * @param {string} userId - The user's ID
 */
export const updatedOfflineStatus = async (userId) => {
  try {
    // Check if the user still has another active connection
    const userActiveConnections = getActiveConnectionsByUserId(userId);

    if (userActiveConnections.length === 0) {
      const user = await User.findById(userId, { _id: 1, friends: 1 }).populate(
        'friends',
        '_id username email'
      );

      // Send offline user id to the online friends
      const onlineFriends = getOnlineUsers().filter((userID) =>
        user.friends.some((friend) => friend._id.toString() === userID)
      );

      onlineFriends.forEach((friendId) => {
        const friendActiveConnections = getActiveConnectionsByUserId(friendId);

        getIO()
          .to(friendActiveConnections)
          .emit('friend:offlineFriendID', userId);
      });
    }
  } catch (error) {
    console.log(error);
  }
};
