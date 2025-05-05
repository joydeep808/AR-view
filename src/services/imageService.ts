
// Local storage service for image URLs
// This can be replaced with Cloudinary in the future

const LOCAL_STORAGE_KEY = 'ar_viewer_images';

interface StoredImages {
  baseImage: string | null;
  overlayImage: string | null;
}

export const saveImages = (baseImage: string | null, overlayImage: string | null): void => {
  const images: StoredImages = { baseImage, overlayImage };
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(images));
  } catch (error) {
    console.error('Error saving images to local storage:', error);
  }
};

export const loadImages = (): StoredImages => {
  try {
    const savedImages = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedImages) {
      return JSON.parse(savedImages) as StoredImages;
    }
  } catch (error) {
    console.error('Error loading images from local storage:', error);
  }
  
  return { baseImage: null, overlayImage: null };
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
