
// Cloudinary integration for uploading and managing images

interface CloudinaryUploadResponse {
  success: boolean;
  shareUrl?: string;
  uniqueId?: string;
  baseImageUrl?: string;
  overlayImageUrl?: string;
  message?: string;
}

interface ARMetadata {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
  baseImage: string;
  overlayImage: string;
}

// Upload image to Cloudinary through our secure backend
export const uploadToCloudinary = async (file: File | string): Promise<string> => {
  try {
    // Let's handle the file conversion here
    let base64Data: string;
    
    if (typeof file === 'string') {
      // If it's already a data URL, use it
      base64Data = file;
    } else {
      // Convert File to base64
      base64Data = await fileToBase64(file);
    }
    
    // Our backend will handle the Cloudinary upload
    const response = await fetch('/api/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file: base64Data }),
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Successfully uploaded to Cloudinary:', data);
    return data.imageUrl;
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    
    // Fallback to local storage in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Falling back to local storage strategy');
      return typeof file === 'string' ? file : URL.createObjectURL(file);
    }
    
    throw error;
  }
};

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
};

// Helper function to compress images before upload to reduce storage usage
export const compressImage = (file: File, quality: number = 0.7): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Canvas blob is null'));
            }
          },
          file.type,
          quality
        );
      };
    };
    reader.onerror = () => reject(new Error('FileReader error'));
  });
};

// Function to handle metadata storage alongside images
export const saveARMetadata = async (metadata: ARMetadata): Promise<string> => {
  try {
    const response = await fetch('/api/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    const data: CloudinaryUploadResponse = await response.json();
    
    if (data.success && data.uniqueId) {
      console.log('AR metadata saved with ID:', data.uniqueId);
      return data.uniqueId;
    } else {
      throw new Error(data.message || 'Unknown error occurred');
    }
  } catch (error) {
    console.error('Failed to save AR metadata:', error);
    throw error;
  }
};
