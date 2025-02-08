import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import geoip from 'geoip-lite';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Add a basic health check endpoint
app.get('/', (req, res) => {
  res.send('WebSocket server is running');
});

// Store waiting users
const waitingUsers = new Map();

// Find matching user based on preferences
function findMatch(socket, preferences) {
  for (const [id, user] of waitingUsers) {
    if (id === socket.id) continue;

    // Check country match if specified
    if (preferences.country && user.preferences.country) {
      if (preferences.country !== user.preferences.country) continue;
    }

    // Check interests match (at least one common interest)
    if (preferences.interests.length > 0 && user.preferences.interests.length > 0) {
      const commonInterests = preferences.interests.filter(interest => 
        user.preferences.interests.includes(interest)
      );
      if (commonInterests.length === 0) continue;
    }

    return user;
  }
  return null;
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Get user's country from IP
  const ip = socket.handshake.address;
  const geo = geoip.lookup(ip);
  const country = geo ? geo.country : null;

  socket.on('start_search', (preferences) => {
    console.log('User started search:', socket.id, preferences);
    // Add user to waiting pool
    waitingUsers.set(socket.id, {
      socket,
      preferences: {
        ...preferences,
        country: preferences.country || country
      }
    });

    // Try to find a match
    const match = findMatch(socket, preferences);
    if (match) {
      console.log('Match found between', socket.id, 'and', match.socket.id);
      // Remove both users from waiting pool
      waitingUsers.delete(socket.id);
      waitingUsers.delete(match.socket.id);

      // Generate unique room ID
      const roomId = uuidv4();

      // Join both users to the room
      socket.join(roomId);
      match.socket.join(roomId);

      // Notify both users of the match
      socket.emit('match_found', { roomId, isInitiator: true });
      match.socket.emit('match_found', { roomId, isInitiator: false });
    }
  });

  socket.on('stop_search', () => {
    console.log('User stopped search:', socket.id);
    waitingUsers.delete(socket.id);
  });

  // Handle WebRTC signaling
  socket.on('signal', ({ roomId, signal }) => {
    console.log('Signal received:', signal.type, 'from', socket.id, 'for room', roomId);
    socket.to(roomId).emit('signal', signal);
  });

  socket.on('disconnect', () => {
    waitingUsers.delete(socket.id);
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});