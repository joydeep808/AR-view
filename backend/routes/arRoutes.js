
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import ARExperience from '../models/ARExperience.js';
import { uploadToCloudinary } from '../utils/cloudinaryUtils.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Create AR experience
router.post('/share', async (req, res) => {
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
router.get('/ar-experience/:id', async (req, res) => {
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

export default router;
