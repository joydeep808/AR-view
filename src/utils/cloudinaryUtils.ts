
// Cloudinary integration for uploading and managing images

// Cloudinary configuration - replace with your own in production
const CLOUDINARY_CLOUD_NAME = 'demo';
const CLOUDINARY_UPLOAD_PRESET = 'ml_default';

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  version: number;
  asset_id: string;
  format: string;
  width: number;
  height: number;
}

// Upload image to Cloudinary
export const uploadToCloudinary = async (file: File | string): Promise<string> => {
  // If input is a data URL, convert to a Blob first
  let uploadFile: File | Blob = file as File;
  
  if (typeof file === 'string' && file.startsWith('data:')) {
    const response = await fetch(file);
    uploadFile = await response.blob();
  }
  
  // Create form data for upload
  const formData = new FormData();
  formData.append('file', uploadFile);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
    
    const data: CloudinaryUploadResponse = await response.json();
    console.log('Successfully uploaded to Cloudinary:', data.secure_url);
    return data.secure_url;
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

// Get Cloudinary URL from public ID
export const getCloudinaryUrl = (publicId: string): string => {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
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
export const saveARMetadata = async (metadata: any): Promise<string> => {
  try {
    // In a real application, you would save this metadata to a database
    // For now, we'll simulate by returning a JSON string
    const metadataString = JSON.stringify(metadata);
    console.log('AR metadata saved:', metadataString);
    
    // Here you would typically POST to your backend or Cloudinary
    // For now, we're just returning an ID
    const metadataId = 'ar-' + Date.now().toString(36);
    return metadataId;
  } catch (error) {
    console.error('Failed to save AR metadata:', error);
    throw error;
  }
};

