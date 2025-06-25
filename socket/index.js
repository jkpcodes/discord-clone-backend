import { verifySocketToken } from '../util/authUtil.js';
import { newConnectionHandler, disconnectHandler, directMessageHandler } from './connectionHandler.js';
import { getChatHistory } from './chat.js';
import { joinServerVoiceChannel, leaveServerVoiceChannel } from './channelServer.js';
// import { friendHandler } from './friends.js';

let io = null;

export const getIO = () => {
  return io;
};

export const setIO = (ioInstance) => {
  io = ioInstance;
};

export const registerSocketServer = (io) => {
  // Set the io instance
  setIO(io);

  // Insert Socket server middleware here
  io.use((socket, next) => {
    verifySocketToken(socket, next);
  });

  io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
    newConnectionHandler(socket);

    socket.on('direct:message', (messageData) => {
      directMessageHandler(socket, messageData);
    });

    socket.on('direct:getChatHistory', (friendId) => {
      getChatHistory(socket, friendId);
    });

    socket.on('disconnect', () => {
      console.log('a socketID disconnected', socket.id);
      disconnectHandler(socket);
    });

    socket.on('call:joinServerVoiceChannel', (serverId) => {
      joinServerVoiceChannel(socket, serverId);
    });

    socket.on('call:leaveServerVoiceChannel', (serverId) => {
      leaveServerVoiceChannel(socket, serverId);
    });
  });
};
