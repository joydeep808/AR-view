
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true
});

// MongoDB Schema
const arExperienceSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true },
  baseImage: { type: String, required: true },
  overlayImage: { type: String, required: true },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 }
  },
  rotation: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 }
  },
  scale: { type: Number, default: 1 },
  timestamp: { type: Date, default: Date.now }
});

const ARExperience = mongoose.model('ARExperience', arExperienceSchema);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ar_viewer')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Upload image to Cloudinary
const uploadToCloudinary = async (base64Image) => {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      resource_type: 'image',
      folder: 'ar_viewer',
      unique_filename: true
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Create AR experience
app.post('/api/share', async (req, res) => {
  try {
    const { baseImage, overlayImage, position, rotation, scale } = req.body;
    
    if (!baseImage || !overlayImage) {
      return res.status(400).json({ success: false, message: 'Missing required images' });
    }

    // Upload images to Cloudinary
    const [baseImageUrl, overlayImageUrl] = await Promise.all([
      uploadToCloudinary(baseImage),
      uploadToCloudinary(overlayImage)
    ]);

    // Generate a unique ID
    const uniqueId = uuidv4();

    // Create new AR experience in database
    const arExperience = new ARExperience({
      uniqueId,
      baseImage: baseImageUrl,
      overlayImage: overlayImageUrl,
      position,
      rotation,
      scale,
    });

    await arExperience.save();

    // Create share URL
    const shareUrl = `${req.protocol}://${req.get('host')}/ar-view/${uniqueId}`;

    res.json({
      success: true,
      shareUrl,
      uniqueId,
      baseImageUrl,
      overlayImageUrl
    });
  } catch (error) {
    console.error('Error sharing AR experience:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create AR experience',
      error: error.message 
    });
  }
});

// Get AR experience by ID
app.get('/api/ar-experience/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const arExperience = await ARExperience.findOne({ uniqueId: id });
    
    if (!arExperience) {
      return res.status(404).json({ success: false, message: 'AR experience not found' });
    }

    // Add cache busting parameters to URLs
    const cacheBuster = Date.now();
    const baseImageUrl = arExperience.baseImage.includes('?') 
      ? `${arExperience.baseImage}&cb=${cacheBuster}` 
      : `${arExperience.baseImage}?cb=${cacheBuster}`;
      
    const overlayImageUrl = arExperience.overlayImage.includes('?') 
      ? `${arExperience.overlayImage}&cb=${cacheBuster}` 
      : `${arExperience.overlayImage}?cb=${cacheBuster}`;

    res.json({
      success: true,
      arData: {
        baseImage: baseImageUrl,
        overlayImage: overlayImageUrl,
        position: arExperience.position,
        rotation: arExperience.rotation,
        scale: arExperience.scale
      }
    });
  } catch (error) {
    console.error('Error fetching AR experience:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch AR experience',
      error: error.message 
    });
  }
});

// Fallback route - Serve the main HTML file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
