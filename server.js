const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const corpsRoutes = require('./routes/corps');
const draftRoutes = require('./routes/draft');
const leagueRoutes = require('./routes/league');
const userRoutes = require('./routes/user');
const scoresRoutes = require('./routes/scores');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fantasy-dci', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/corps', corpsRoutes);
app.use('/api/draft', draftRoutes);
app.use('/api/league', leagueRoutes);
app.use('/api/user', userRoutes);
app.use('/api/scores', scoresRoutes);

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  });
}

// Socket.io for real-time draft updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-draft', (draftId) => {
    socket.join(`draft-${draftId}`);
    console.log(`User ${socket.id} joined draft ${draftId}`);
  });

  socket.on('leave-draft', (draftId) => {
    socket.leave(`draft-${draftId}`);
    console.log(`User ${socket.id} left draft ${draftId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler - only for API routes in production
if (process.env.NODE_ENV !== 'production') {
  app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io }; 