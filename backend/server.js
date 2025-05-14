
import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import { connectToDatabase } from './utils/db.js';
import arRoutes from './routes/arRoutes.js';

// Initialize Express app
const app = express();
const port = config.port;

// Connect to MongoDB
connectToDatabase();

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.use('/api', arRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API server is running' });
});

// Error handling for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found' 
  });
});

// Start server
app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
