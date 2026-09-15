const { WebSocketServer, WebSocket } = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

// In-memory data store
const messageHistory = []; // Stores recent encrypted message history
const activeBans = new Map(); // Stores banned usernames and expiration timestamps
const reportList = []; // Stores active user reports

console.log(`Live Chat WebSocket Server is running on port ${PORT}`);

// Helper function to broadcast JSON to all open client connections
function broadcast(data) {
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`[CONNECT] New client connected from ${clientIp}`);

  // 1. Instantly send chat history and existing reports to newly connected client
  ws.send(JSON.stringify({
    type: 'INIT_SYNC',
    history: messageHistory,
    reports: reportList
  }));

  ws.on('message', (message) => {
    try {
      const parsedData = JSON.parse(message.toString());

      switch (parsedData.type) {
        case 'NEW_MESSAGE':
          // Check if sender is currently banned
          const banExpiry = activeBans.get(parsedData.msg.username);
          if (banExpiry) {
            if (banExpiry === -1 || Date.now() < banExpiry) {
              ws.send(JSON.stringify({
                type: 'ERROR',
                message: 'You are currently banned or timed out from sending messages.'
              }));
              return;
            } else {
              // Ban expired
              activeBans.delete(parsedData.msg.username);
            }
          }

          // Save to history buffer (keep last 200 messages)
          messageHistory.push(parsedData.msg);
          if (messageHistory.length > 200) messageHistory.shift();

          // Broadcast message to all users
          broadcast({ type: 'NEW_MESSAGE', msg: parsedData.msg });
          break;

        case 'DELETE_MESSAGE':
          if (parsedData.index >= 0 && parsedData.index < messageHistory.length) {
            messageHistory.splice(parsedData.index, 1);
            broadcast({ type: 'DELETE_MESSAGE', index: parsedData.index });
          }
          break;

        case 'SUBMIT_REPORT':
          reportList.push(parsedData.report);
          broadcast({ type: 'NEW_REPORT', report: parsedData.report });
          break;

        case 'DISMISS_REPORT':
          if (parsedData.index >= 0 && parsedData.index < reportList.length) {
            reportList.splice(parsedData.index, 1);
            broadcast({ type: 'SYNC_REPORTS', reports: reportList });
          }
          break;

        case 'ENFORCE_PUNISHMENT':
          const { targetUser, actionType, durationMs, reason } = parsedData;
          const expiryTime = durationMs === -1 ? -1 : Date.now() + durationMs;
          activeBans.set(targetUser, expiryTime);

          // Broadcast notification so all clients know action was taken
          broadcast({
            type: 'USER_PUNISHED',
            targetUser,
            actionType,
            reason
          });
          break;
      }
    } catch (err) {
      console.error('[ERROR] Malformed frame received:', err);
    }
  });

  ws.on('close', () => console.log(`[DISCONNECT] Client disconnected (${clientIp})`));
  ws.on('error', (error) => console.error(`[SOCKET ERROR] ${error.message}`));
});
