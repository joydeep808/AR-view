
// Image service for handling AR images with backend API integration

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
    localStorage.setItem('ar_viewer_images', JSON.stringify(images));
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
    const savedImages = localStorage.getItem('ar_viewer_images');
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
    localStorage.removeItem('ar_viewer_images');
  } catch (error) {
    console.error('Error clearing images from local storage:', error);
  }
};

// Save AR experience to backend and get a unique ID
export const saveARExperience = async (
  baseImage: string, 
  overlayImage: string,
  position: { x: number; y: number; z: number },
  rotation: { x: number; y: number; z: number },
  scale: number
): Promise<{ uniqueId: string; shareUrl: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        baseImage,
        overlayImage,
        position,
        rotation,
        scale
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save AR experience: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Unknown error saving AR experience');
    }
    
    return {
      uniqueId: data.uniqueId,
      shareUrl: data.shareUrl
    };
  } catch (error) {
    console.error('Error saving AR experience:', error);
    throw error;
  }
};

// Fetch AR experience from backend by ID
export const fetchARExperience = async (uniqueId: string): Promise<{
  baseImage: string;
  overlayImage: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ar-experience/${uniqueId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch AR experience: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Unknown error fetching AR experience');
    }
    
    return data.arData;
  } catch (error) {
    console.error('Error fetching AR experience:', error);
    throw error;
  }
};

// Function to be used when converting local storage to backend
export const migrateLocalStorageToBackend = async (): Promise<void> => {
  try {
    const localData = loadImages();
    
    if (localData.baseImage && localData.overlayImage) {
      // This would be implemented to migrate existing local storage data to backend
      console.log('Migrating local data to backend');
      // Implementation would depend on specific requirements
    }
  } catch (error) {
    console.error('Error migrating data to backend:', error);
  }
};
