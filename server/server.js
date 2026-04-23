const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./core/auth/authRoutes');
const userRoutes = require('./core/auth/userRoutes');
const itemRoutes = require('./features/item/itemRoutes');
const { protect } = require('./core/middleware/authMiddleware');
const { errorHandler, notFound } = require('./core/middleware/errorMiddleware');

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Lost & Found API is running 🚀' });
});

// ─── Routes ────────────────────────────────────────────────────────────────────
// Primary auth routes  →  POST /api/auth/register  |  POST /api/auth/login
app.use('/api/auth', authRoutes);

// Case-study spec aliases (controller imported directly — avoids mounting
// the same router instance twice which breaks Express request dispatch)
const { register, login } = require('./core/auth/authController');
app.post('/api/register', register);
app.post('/api/login', login);

// Protected routes
app.use('/api/users', protect, userRoutes);
app.use('/api/items', protect, itemRoutes);

// ─── Error Handling ────────────────────────────────────────────────────────────
// Must be registered AFTER all routes
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
