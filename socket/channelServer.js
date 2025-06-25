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
  console.log('joinServerVoiceChannel: ', serverId);
  const { _id, username, email } = socket.user;
  const userId = _id.toString();

  const serverVoiceChannel = serverVoiceChannels.get(serverId);
  if (!serverVoiceChannel) {
    serverVoiceChannels.set(serverId, {
      voiceChannel: [{ _id: userId, username, email, socketId: socket.id }],
    });
  } else {
    // Check if user is already in the voice channel, and if the voice channel is not full (4 participants)
    if (
      !serverVoiceChannel.voiceChannel.some(
        (participant) => participant._id === userId
      ) && serverVoiceChannel.voiceChannel.length < MAX_VOICE_CHANNEL_PARTICIPANTS
    ) {
      serverVoiceChannel.voiceChannel.push({ _id: userId, username, email, socketId: socket.id });
    }
  }
  sendUpdatedVoiceChannelParticipants(serverId);
  // Retrieve server details and emit to online server members
  const server = await Server.findById(serverId).populate('members', '_id');

  server.members.forEach((member) => {});
  console.log(serverVoiceChannels);
};

export const leaveServerVoiceChannel = (socket, serverId) => {
  console.log('leaveServerVoiceChannel: ', serverId);
  const socketId = socket.id;
  const { _id, username, email } = socket.user;
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

  console.log(serverVoiceChannels);
};

export const getVoiceChannelParticipants = (serverId) => {
  const serverVoiceChannel = serverVoiceChannels.get(serverId);
  return serverVoiceChannel?.voiceChannel || [];
};

export const disconnectUserFromAllVoiceChannels = (userId) => {
  serverVoiceChannels.forEach((serverVoiceChannel, serverId) => {
    serverVoiceChannel.voiceChannel = serverVoiceChannel.voiceChannel.filter(
      (participant) => participant._id !== userId
    );
    // Remove the voice channel from memory if there are no participants remaining
    if (serverVoiceChannel.voiceChannel.length === 0) {
      serverVoiceChannels.delete(serverId);
    }

    sendUpdatedVoiceChannelParticipants(serverId);
  });
  console.log(serverVoiceChannels);
};

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
    getIO().to(userActiveConnections).emit('call:updateVoiceChannelParticipants', {
      serverId,
      voiceChannel: serverVoiceChannels.get(serverId)?.voiceChannel || [],
    });
  });
};