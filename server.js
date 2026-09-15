const { WebSocketServer, WebSocket } = require('ws');

// Bind to the environment's assigned port (Render, Railway, Heroku) or default to 8080 locally
const PORT = process.env.PORT || 8080;

// Initialize the WebSocket Server
const wss = new WebSocketServer({ port: PORT });

console.log(`Live Chat WebSocket Server is running on port ${PORT}`);

wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`[CONNECT] New client connected from ${clientIp}`);

  // Listen for incoming messages from connected clients
  ws.on('message', (message) => {
    try {
      // Validate that the incoming payload is valid JSON before broadcasting
      const parsedData = JSON.parse(message.toString());

      // Broadcast payload to ALL active client connections
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(parsedData));
        }
      });
    } catch (err) {
      console.error('[ERROR] Received malformed message:', message.toString());
    }
  });

  // Handle client disconnects
  ws.on('close', () => {
    console.log(`[DISCONNECT] Client disconnected (${clientIp})`);
  });

  // Handle socket-level error events
  ws.on('error', (error) => {
    console.error(`[SOCKET ERROR] ${error.message}`);
  });
});