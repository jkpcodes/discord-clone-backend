import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import { Server as SocketIOServer } from 'socket.io';
import { registerSocketServer } from './socket/index.js';

// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV === 'dev') {
  dotenv.config({ path: '.env.dev' });
} else if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config();
}

// Define allowed origins
const allowedOrigins = [ 
  process.env.FRONTEND_URL,
].filter(Boolean); // Remove any undefined values

console.log('process.env.MONGO_URI', process.env.MONGO_URI);
console.log('process.env.JWT_SECRET', process.env.JWT_SECRET);
console.log('Allowed Origins:', allowedOrigins);

const app = express();

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/friend', friendRoutes);
app.use('/api/message', messageRoutes);
// Basic 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

const PORT = process.env.PORT || process.env.API_PORT;

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
  }
});


registerSocketServer(io);

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    // Only start the server if the connection to the database is successful
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log('Database connection failed');
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

export { server };

export default app;
