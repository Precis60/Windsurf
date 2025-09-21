import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import routes
import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customers.js';
import appointmentRoutes from './routes/appointments.js';
import projectRoutes from './routes/projects.js';
import supportRoutes from './routes/support.js';
import calendarRoutes from './routes/calendar.js';
import appointmentRequestRoutes from './routes/appointmentRequests.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration (supports multiple comma-separated origins)
const defaultOrigins = [
  'https://precis60.github.io',
  'https://precision-cabling-automation.windsurf.build',
  'http://localhost:5173'
];
const envOrigins = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
const allowedOrigins = envOrigins.length > 0 ? envOrigins : defaultOrigins;

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser clients or same-origin requests
    if (!origin) return callback(null, true);
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn('CORS blocked origin:', origin, 'Allowed:', allowedOrigins);
    return callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Precision Cabling & Automation API is running',
    version: '2.1.1-cors-fix',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database initialization endpoint
app.post('/api/init-db', async (req, res) => {
  try {
    const setupDatabase = (await import('./scripts/setup-database.js')).default;
    await setupDatabase();
    res.status(200).json({
      status: 'OK',
      message: 'Database initialized successfully'
    });
  } catch (error) {
    console.error('Database initialization failed:', error);
    res.status(500).json({
      error: {
        message: 'Database initialization failed',
        details: error.message
      }
    });
  }
});

// Debug endpoint to check users
app.get('/api/debug/users', async (req, res) => {
  try {
    const { query } = await import('./config/database.js');
    const result = await query('SELECT id, email, first_name, last_name, role, is_active FROM users');
    res.json({
      users: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Debug users error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch users',
        details: error.message
      }
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/appointment-requests', appointmentRequestRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(isDevelopment && { stack: err.stack })
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      path: req.originalUrl
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
