import { verifySocketToken } from '../util/authUtil.js';
import { newConnectionHandler, disconnectHandler } from './connectionHandler.js';
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

  const emitOnlineUsers = () => {
    const onlineUsers = getOnlineUsers();
    io.emit('online-users', onlineUsers);
  };

  io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
    newConnectionHandler(socket);
    // friendHandler(io, socket);

    socket.on('disconnect', () => {
      console.log('a socketID disconnected', socket.id);
      disconnectHandler(socket);
    });
  });
};
