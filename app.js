import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';

// Load environment variables from .env file
dotenv.config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

// Basic 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
});

const PORT = process.env.PORT || process.env.API_PORT;

const server = http.createServer(app);

mongoose.connect(process.env.MONGO_URI, {
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

export default app;
