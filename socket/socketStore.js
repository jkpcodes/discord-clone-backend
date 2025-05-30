const connectedClients = new Map();

export const addToClientMap = (socketId, userId) => {
  connectedClients.set(socketId, userId);
};

export const removeFromClientMap = (socketId) => {
  connectedClients.delete(socketId);
};

export const logConnectedClients = () => {
  console.log(connectedClients);
};

export const getOnlineUsers = () => {
  // Use Set to get unique user IDs
  const uniqueUserIds = new Set(connectedClients.values());
  return Array.from(uniqueUserIds);
};

/**
 * Get all active connections for a user
 * @param {string} userId - The user's ID
 * @returns {Array} - An array of socket IDs
 */
export const getActiveConnectionsByUserId = (userId) => {
  return Array.from(connectedClients.entries())
    .filter(([_, id]) => id === userId)
    .map(([socketId, _]) => socketId);
};

/**
 * Send a message to all active connections for a user
 * @param {string} userId - The user's ID
 * @param {...Function} callbacks - The callbacks to call
 */
export const sendMessageToActiveUserConnections = (userId, ...callbacks) => {
  if (!userId && !callbacks) return;

  const userActiveConnections = getActiveConnectionsByUserId(userId);
  if (userActiveConnections.length > 0) {
    callbacks.forEach((callback) => {
      callback(userId, userActiveConnections);
    });
  }
};