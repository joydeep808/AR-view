

// Local storage service for image URLs
// This can be replaced with Cloudinary in the future

const LOCAL_STORAGE_KEY = 'ar_viewer_images';

interface StoredImages {
  baseImage: string | null;
  overlayImage: string | null;
  timestamp: number; // Added timestamp to track freshness
}

export const saveImages = (baseImage: string | null, overlayImage: string | null): void => {
  const images: StoredImages = { 
    baseImage, 
    overlayImage, 
    timestamp: Date.now() 
  };
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(images));
  } catch (error) {
    console.error('Error saving images to local storage:', error);
  }
};

// Helper function to add cache busting parameters to URLs
const addCacheBusting = (url: string | null): string | null => {
  if (!url) return url;
  
  // Don't modify data URLs
  if (url.startsWith('data:')) return url;
  
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('cb', Date.now().toString());
    return urlObj.toString();
  } catch (e) {
    // If URL parsing fails, just append a query param
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}cb=${Date.now()}`;
  }
};

export const loadImages = (): StoredImages => {
  try {
    const savedImages = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedImages) {
      const parsedImages = JSON.parse(savedImages) as StoredImages;
      
      // Add cache-busting to image URLs
      return {
        baseImage: parsedImages.baseImage ? addCacheBusting(parsedImages.baseImage) : null,
        overlayImage: parsedImages.overlayImage ? addCacheBusting(parsedImages.overlayImage) : null,
        timestamp: parsedImages.timestamp || Date.now()
      };
    }
  } catch (error) {
    console.error('Error loading images from local storage:', error);
  }
  
  return { baseImage: null, overlayImage: null, timestamp: Date.now() };
};

export const clearImages = (): void => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing images from local storage:', error);
  }
};

// Function to be used when switching to Cloudinary
export const convertToCloudinaryStrategy = async (): Promise<void> => {
  // Placeholder for future implementation
  console.log('Converting to Cloudinary strategy (not implemented yet)');
  // This would involve:
  // 1. Loading images from local storage
  // 2. Uploading them to Cloudinary
  // 3. Saving the Cloudinary URLs instead
};

