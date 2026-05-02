require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

// Models for Socket
const Message = require('./models/Message');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const swipeRoutes = require('./routes/swipeRoutes');
const matchRoutes = require('./routes/matchRoutes');
const messageRoutes = require('./routes/messageRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Dating App API is running',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/swipe', swipeRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // User joins a specific match chat room
  socket.on('join_match', (matchId) => {
    socket.join(matchId);
    console.log(`User joined match room: ${matchId}`);
  });

  // Handle incoming messages
  socket.on('send_message', async (data) => {
    try {
      const { matchId, senderId, text } = data;

      // Save to database
      const newMessage = await Message.create({
        matchId,
        sender: senderId,
        text,
      });

      // Populate sender info before broadcasting
      const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name photos');

      // Broadcast to everyone in the room, including sender (so they know it was sent)
      io.to(matchId).emit('receive_message', populatedMessage);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
