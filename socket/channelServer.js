import { Server } from '../models/server.js';
import { getActiveConnectionsByUserId } from './socketStore.js';
import { getIO } from './index.js';

const MAX_VOICE_CHANNEL_PARTICIPANTS = 4;

/**
 * {
 *   <serverId>: {
 *     voiceChannel: [] // User data
 *   }
 * }
 */
const serverVoiceChannels = new Map();

/**
 * Join a server voice channel
 *
 * @param {*} socket
 * @param {*} serverId
 */
export const joinServerVoiceChannel = async (socket, serverId) => {
  const { _id, username, email } = socket.user;
  const userId = _id.toString();
  const newParticipant = { _id: userId, username, email, socketId: socket.id };

  const serverVoiceChannel = serverVoiceChannels.get(serverId);
  if (!serverVoiceChannel) {
    serverVoiceChannels.set(serverId, {
      voiceChannel: [newParticipant],
    });
  } else {
    // Check if user is already in the voice channel, and if the voice channel is not full (4 participants)
    if (
      !serverVoiceChannel.voiceChannel.some(
        (participant) => participant._id === userId
      ) &&
      serverVoiceChannel.voiceChannel.length < MAX_VOICE_CHANNEL_PARTICIPANTS
    ) {
      // Send information to connected users in voice channel to prepare for incoming webRTC connection
      const userActiveSocketIds = serverVoiceChannel.voiceChannel.map(
        (participant) => participant.socketId
      );

      getIO().to(userActiveSocketIds).emit('call:prepareWebRTCConnection', {
        userSocketId: newParticipant.socketId,
      });

      serverVoiceChannel.voiceChannel.push(newParticipant);
    }
  }
  sendUpdatedVoiceChannelParticipants(serverId);
  // Retrieve server details and emit to online server members
  const server = await Server.findById(serverId).populate('members', '_id');

  server.members.forEach((member) => {});
};

export const leaveServerVoiceChannel = (socket, serverId) => {
  const socketId = socket.id;
  const { _id } = socket.user;
  const userId = _id.toString();

  const serverVoiceChannel = serverVoiceChannels.get(serverId);
  if (!serverVoiceChannel) {
    return;
  } else {
    serverVoiceChannel.voiceChannel = serverVoiceChannel.voiceChannel.filter(
      (participant) => participant._id !== userId
    );
    // Remove the voice channel from memory if there are no participants remaining
    if (serverVoiceChannel.voiceChannel.length === 0) {
      serverVoiceChannels.delete(serverId);
    }
  }
  sendUpdatedVoiceChannelParticipants(serverId);
  sendUserLeftVoiceChannel(serverVoiceChannel, socketId);
};

export const getVoiceChannelParticipants = (serverId) => {
  const serverVoiceChannel = serverVoiceChannels.get(serverId);
  return serverVoiceChannel?.voiceChannel || [];
};

export const disconnectUserFromAllVoiceChannels = (userId, socketId) => {
  serverVoiceChannels.forEach((serverVoiceChannel, serverId) => {
    serverVoiceChannel.voiceChannel = serverVoiceChannel.voiceChannel.filter(
      (participant) => participant._id !== userId
    );
    // Remove the voice channel from memory if there are no participants remaining
    if (serverVoiceChannel.voiceChannel.length === 0) {
      serverVoiceChannels.delete(serverId);
    }

    sendUpdatedVoiceChannelParticipants(serverId);
    sendUserLeftVoiceChannel(serverVoiceChannel, socketId);
  });
};

const sendUserLeftVoiceChannel = (serverVoiceChannel, socketId) => {
  // If there are still participants in the voice channel, send a message to the remaining participants regarding the user leaving the voice channel
  if (serverVoiceChannel.voiceChannel.length > 0) {
    const activeParticipantSocketIds = serverVoiceChannel.voiceChannel.map(
      (participant) => participant.socketId
    );
    getIO().to(activeParticipantSocketIds).emit('call:userLeftVoiceChannel', {
      userSocketId: socketId,
    });
  }
}

/**
 * Send updated voice channel participants to all server members
 *
 * @param {*} serverId
 * @returns
 */
const sendUpdatedVoiceChannelParticipants = async (serverId) => {
  const server = await Server.findById(serverId);
  if (!server) {
    return;
  }
  server.members.forEach((participantId) => {
    const userActiveConnections = getActiveConnectionsByUserId(participantId);
    getIO()
      .to(userActiveConnections)
      .emit('call:updateVoiceChannelParticipants', {
        serverId,
        voiceChannel: serverVoiceChannels.get(serverId)?.voiceChannel || [],
      });
  });
};

export const initializeWebRTCConnection = (socket, userSocketId) => {
  const initData = { userSocketId: socket.id };
  socket.to(userSocketId).emit('call:initializeWebRTCConnection', initData);
};

export const signalDataHandler = (socket, data) => {
  const { userSocketId, signal } = data;

  const userActiveConnections = getActiveConnectionsByUserId(userSocketId);
  getIO()
    .to(userActiveConnections)
    .emit('call:signalPeerData', { signal, userSocketId: socket.id });
};
