import { Server } from 'socket.io';
import { verifySocketToken } from './util/authUtil.js';
import { newConnectionHandler, disconnectHandler } from './socket/connectionHandler.js';
import { logConnectedClients } from './socket/socketStore.js';

const registerSocketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
    }
  });

  // Insert Socket server middleware here
  io.use((socket, next) => {
    verifySocketToken(socket, next);
  });

  io.on('connection', (socket) => {
    newConnectionHandler(socket, io);
    logConnectedClients();

    socket.on('disconnect', () => {
      console.log('a user disconnected', socket.id);
      disconnectHandler(socket);
    });
  });
};

export default registerSocketServer;
