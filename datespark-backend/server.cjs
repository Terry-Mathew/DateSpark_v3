const express = require('express');
const cors = require('cors');
const multer = require('multer');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const { validationResult, check } = require('express-validator');
const firebase = require('firebase-admin');
const firestore = require('./firestore.cjs');
const { storage } = require('./firebase.js'); // Import Firebase storage

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env';

console.log(`Loading environment from ${envFile} for ${process.env.NODE_ENV || 'development'} environment`);
dotenv.config({ path: path.resolve(__dirname, envFile) });

// Validate environment
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is undefined. Check your environment configuration.');
} else {
  console.log('OPENAI_API_KEY is defined. Length:', process.env.OPENAI_API_KEY.length);
  console.log('OPENAI_API_KEY starts with:', process.env.OPENAI_API_KEY.substring(0, 10) + '...');
}

console.log(`Server starting in ${process.env.NODE_ENV || 'development'} mode`);
console.log(`Using Firebase project: ${process.env.FIREBASE_PROJECT_ID}`);

// Import routes
const authRoutes = require('./routes/auth.cjs');
const profileRoutes = require('./routes/profile.cjs');
const aiRoutes = require('./routes/ai.cjs');

const app = express();
const PORT = process.env.PORT || 5002;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for development, enable for production
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(xss());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

// Set up routes and apply middleware
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', aiRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
