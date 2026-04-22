const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./core/auth/authRoutes');
const userRoutes = require('./core/auth/userRoutes');
const taskRoutes = require('./features/task/taskRoutes');
const { protect } = require('./core/middleware/authMiddleware');
const { errorHandler, notFound } = require('./core/middleware/errorMiddleware');

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'MERN API is running 🚀' });
});

// ─── Routes ────────────────────────────────────────────────────────────────────
// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/users', protect, userRoutes);
app.use('/api/tasks', protect, taskRoutes);

// ─── Error Handling ────────────────────────────────────────────────────────────
// Must be registered AFTER all routes
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
