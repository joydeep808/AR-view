
// Image service for handling AR images with backend API integration

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Save images to localStorage
export const saveImages = (baseImage: string | null, overlayImage: string | null) => {
  try {
    localStorage.setItem('ar-baseImage', baseImage || '');
    localStorage.setItem('ar-overlayImage', overlayImage || '');
  } catch (err) {
    console.error('Error saving images to localStorage:', err);
  }
};

// Load images from localStorage
export const loadImages = () => {
  try {
    return {
      baseImage: localStorage.getItem('ar-baseImage') || null,
      overlayImage: localStorage.getItem('ar-overlayImage') || null
    };
  } catch (err) {
    console.error('Error loading images from localStorage:', err);
    return { baseImage: null, overlayImage: null };
  }
};

// Process URLs for better compatibility
export const processImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  // For data URLs, return as is
  if (url.startsWith('data:')) return url;
  
  // For Cloudinary URLs, add crossorigin parameters
  if (url.includes('res.cloudinary.com')) {
    // Modify Cloudinary URL to enforce HTTPS and add CORS-friendly parameters
    if (url.startsWith('http:')) {
      url = 'https:' + url.substring(5);
    }
    
    // Add necessary Cloudinary parameters
    const timestamp = Date.now();
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${timestamp}&fl_attachment&fl_awebp`;
  }
  
  // Default cache busting for other URLs
  const timestamp = Date.now();
  return url.includes('?') ? 
    `${url}&t=${timestamp}` : 
    `${url}?t=${timestamp}`;
};

// Add cache busting to URLs (for backward compatibility)
export const addCacheBuster = processImageUrl;

// Check if URL is valid
export const isValidUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  
  // Data URLs are valid
  if (url.startsWith('data:')) return true;
  
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Determine if a string is a data URL
export const isDataUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  return url.startsWith('data:');
};

// Save AR experience to backend with improved error handling
export const saveARExperience = async (
  baseImage: string,
  overlayImage: string,
  position: { x: number; y: number; z: number },
  rotation: { x: number; y: number; z: number },
  scale: number
) => {
  console.log("Saving AR experience with:", { 
    baseImageType: typeof baseImage,
    baseImageLength: baseImage.length,
    overlayImageType: typeof overlayImage,
    overlayImageLength: overlayImage.length
  });
  
  try {
    const response = await fetch(`${API_BASE_URL}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        baseImage,
        overlayImage,
        position,
        rotation,
        scale
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save AR experience');
    }

    return response.json();
  } catch (error) {
    console.error('Error in saveARExperience:', error);
    throw error;
  }
};

// Fetch AR experience by id with better error handling and CORS support
export const fetchARExperience = async (id: string, retries = 3) => {
  console.log("Fetching AR experience with ID:", id);
  
  // Add cache busting to prevent stale data
  const url = `${API_BASE_URL}/ar-experience/${id}`;
  
  let lastError;
  
  // Try multiple times with increasing timeout
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      console.log(`Fetch attempt ${attempt + 1} for AR experience`);
      
      const response = await fetch(processImageUrl(url) || url, {
        signal: controller.signal,
        cache: 'no-store', // Bypass cache completely
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
        throw new Error(errorData.message || 'Failed to fetch AR experience');
      }

      const data = await response.json();
      console.log("Fetched AR data:", data);
      
      if (!data.arData || !data.arData.baseImage) {
        throw new Error('Invalid AR data structure received');
      }
      
      // Process image URLs in the response
      if (data.arData.baseImage) {
        data.arData.baseImage = processImageUrl(data.arData.baseImage);
      }
      
      if (data.arData.overlayImage) {
        data.arData.overlayImage = processImageUrl(data.arData.overlayImage);
      }
      
      return data.arData;
    } catch (err) {
      lastError = err;
      console.error(`Fetch attempt ${attempt + 1} failed:`, err);
      // Exponential backoff before retry
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Failed to fetch AR experience after multiple attempts');
};
