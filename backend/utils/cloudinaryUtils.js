
import { v2 as cloudinary } from 'cloudinary';
import config from '../config/config.js';

// Initialize Cloudinary with our config
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true
});

// Upload image to Cloudinary
export const uploadToCloudinary = async (base64Image) => {
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
