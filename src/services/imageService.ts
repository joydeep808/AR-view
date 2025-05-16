
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

// Add cache busting to URLs 
const addCacheBuster = (url: string): string => {
  if (!url) return url;
  const cacheBuster = Date.now();
  return url.includes('?') ? 
    `${url}&cb=${cacheBuster}` : 
    `${url}?cb=${cacheBuster}`;
};

// Save AR experience to backend
export const saveARExperience = async (
  baseImage: string,
  overlayImage: string,
  position: { x: number; y: number; z: number },
  rotation: { x: number; y: number; z: number },
  scale: number
) => {
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
};

// Fetch AR experience by id
export const fetchARExperience = async (id: string) => {
  console.log("Fetching AR experience with ID:", id);
  
  // Add cache busting to prevent stale data
  const url = `${API_BASE_URL}/ar-experience/${id}`;
  const response = await fetch(addCacheBuster(url));
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch AR experience');
  }

  const data = await response.json();
  console.log("Fetched AR data:", data);
  
  return data.arData;
};
