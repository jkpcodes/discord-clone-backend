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

export const newConnectionHandler = async (socket) => {
  addToClientMap(socket.id, socket.user._id);
  logConnectedClients();

  sendMessageToActiveUserConnections(
    socket.user._id,
    updatedFriendInvitations,
    updatedSentInvitations,
    updatedFriendsList,
    updatedOnlineFriends,
  );
};

export const disconnectHandler = async (socket) => {
  removeFromClientMap(socket.id);
  logConnectedClients();

  updatedOfflineStatus(socket.user._id);
};
