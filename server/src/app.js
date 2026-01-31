import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { Server as SocketIOServer } from 'socket.io';
import createError from 'http-errors';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDb } from './config/db.js';
import { seedInitialData } from './utils/seedData.js';
import { setupSocketHandlers } from './utils/socketHandlers.js';
import apiRouter from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Basic middlewares
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://192.168.10.25:3000',
  '*'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin (no origin) and known dev origins
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api', apiRouter);

// 404 handler
app.use((req, res, next) => next(createError(404, 'Not found')));

// Error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Server error',
    status
  });
});

// Socket.io setup
setupSocketHandlers(io);

const PORT = process.env.PORT || 4000;
connectDb()
  .then(async () => {
    // Auto-seed initial data in development
    if (process.env.NODE_ENV !== 'production') {
      await seedInitialData();
    }
    server.listen(PORT, () => {
      console.log(`API running on :${PORT}`);
    });
  })
  .catch((err) => {
    console.error('DB connection failed', err);
    process.exit(1);
  });
