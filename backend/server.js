const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');

// Import middleware
const { apiLimiter, authLimiter, examLimiter, examCreationLimiter } = require('./middleware/rateLimit');
const { cache, CACHE_DURATION } = require('./middleware/cache');
const { errorHandler, handleSpecificErrors } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const examRoutes = require('./routes/examRoutes');
const resultRoutes = require('./routes/resultRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const classRoutes = require('./routes/classRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const examAnalyticsRoutes = require('./routes/examAnalyticsRoutes');
const questionRoutes = require('./routes/questionRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // 24 hours
  sameSite: 'none',
  secure: process.env.NODE_ENV === 'production'
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/exams', examLimiter);
app.use('/api/exams/create', examCreationLimiter);

// Middleware
app.use(express.json());
app.use(cookieParser());

// MongoDB Connection with retry logic
const connectWithRetry = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/exam-system', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

// Routes with caching for GET requests
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/exam-analytics', examAnalyticsRoutes);
app.use('/api/questions', questionRoutes);

// Apply caching to specific routes
app.get('/api/exams', cache(CACHE_DURATION.SHORT), examRoutes);
app.get('/api/results', cache(CACHE_DURATION.SHORT), resultRoutes);
app.get('/api/dashboard', cache(CACHE_DURATION.SHORT), dashboardRoutes);
app.get('/api/classes', cache(CACHE_DURATION.MEDIUM), classRoutes);
app.get('/api/subjects', cache(CACHE_DURATION.MEDIUM), subjectRoutes);
app.get('/api/questions', cache(CACHE_DURATION.SHORT), questionRoutes);

// Error handling middleware
app.use(handleSpecificErrors);
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  mongoose.connection.close();
  process.exit(0);
});
