
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { saveARMetadata } from '@/utils/cloudinaryUtils';
import { saveImages, saveARExperience } from '@/services/imageService';
import { useToast } from '@/components/ui/use-toast';

interface ARContextProps {
  baseImage: string | null;
  overlayImage: string | null;
  overlayPosition: { x: number; y: number; z: number };
  overlayRotation: { x: number; y: number; z: number };
  overlayScale: number;
  setBaseImage: (url: string | null) => void;
  setOverlayImage: (url: string | null) => void;
  setOverlayPosition: (position: { x: number; y: number; z: number }) => void;
  setOverlayRotation: (rotation: { x: number; y: number; z: number }) => void;
  setOverlayScale: (scale: number) => void;
  resetAR: () => void;
  shareEnabled: boolean;
  setShareEnabled: (enabled: boolean) => void;
  isSubmitting: boolean;
  submitToCloudinary: () => Promise<void>;
  cloudinaryUrls: {
    baseImage: string | null;
    overlayImage: string | null;
    metadataId: string | null;
  };
}

const ARContext = createContext<ARContextProps | undefined>(undefined);

export const ARProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0.5, z: 0.1 });
  const [overlayRotation, setOverlayRotation] = useState({ 
    x: Math.PI / 2, // 90 degrees in radians
    y: 0, 
    z: 0 
  });
  const [overlayScale, setOverlayScale] = useState(0.8);
  const [shareEnabled, setShareEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cloudinaryUrls, setCloudinaryUrls] = useState({
    baseImage: null as string | null,
    overlayImage: null as string | null,
    metadataId: null as string | null
  });

  // Handle position updates with a useCallback to ensure stable reference
  const handlePositionChange = useCallback((position: { x: number; y: number; z: number }) => {
    setOverlayPosition(prevPosition => {
      if (JSON.stringify(prevPosition) === JSON.stringify(position)) {
        return prevPosition; // No change needed
      }
      return {...position};
    });
  }, []);

  // Handle rotation updates with useCallback for better performance
  const handleRotationChange = useCallback((rotation: { x: number; y: number; z: number }) => {
    setOverlayRotation(prevRotation => {
      if (JSON.stringify(prevRotation) === JSON.stringify(rotation)) {
        return prevRotation; // No change needed
      }
      return {...rotation};
    });
  }, []);

  // Handle scale changes with debounce to improve performance
  const handleScaleChange = useCallback((scale: number) => {
    setOverlayScale(scale);
  }, []);

  // Modified to handle overlay image changes without resetting position and rotation
  const handleOverlayImageChange = (url: string | null) => {
    setOverlayImage(url);
    
    // Only set default position and rotation when initially adding an overlay
    if (url && !overlayImage) {
      // Position slightly above base image at 90 degrees
      handlePositionChange({ x: 0, y: 0.5, z: 0.1 });
      handleRotationChange({ 
        x: Math.PI / 2, // 90 degrees in radians
        y: 0, 
        z: 0 
      });
      setOverlayScale(0.8);
      setShareEnabled(true);
    } else if (url === null) {
      // When overlay is removed (cross button clicked)
      setShareEnabled(false);
    }
  };

  const resetAR = () => {
    setBaseImage(null);
    setOverlayImage(null);
    handlePositionChange({ x: 0, y: 0.5, z: 0.1 });
    handleRotationChange({ 
      x: Math.PI / 2, 
      y: 0, 
      z: 0 
    });
    setOverlayScale(0.8);
    setShareEnabled(false);
    setCloudinaryUrls({
      baseImage: null,
      overlayImage: null,
      metadataId: null
    });
  };

  // Function to submit images and metadata to our backend
  const submitToCloudinary = async () => {
    if (!baseImage || !overlayImage) {
      toast({
        title: "Missing images",
        description: "Please upload both base and overlay images.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Save experience to backend - this now handles uploads to Cloudinary
      const result = await saveARExperience(
        baseImage,
        overlayImage,
        overlayPosition,
        overlayRotation,
        overlayScale
      );
      
      // Update state with new URLs and metadata ID
      setCloudinaryUrls({
        baseImage: result.shareUrl,
        overlayImage: result.shareUrl,
        metadataId: result.uniqueId
      });
      
      toast({
        title: "Success!",
        description: "Your AR experience has been saved and is ready to share.",
      });
      
      setShareEnabled(true);
    } catch (error) {
      console.error('Failed to save AR experience:', error);
      toast({
        title: "Upload failed",
        description: "Could not save your AR experience. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ARContext.Provider
      value={{
        baseImage,
        overlayImage,
        overlayPosition,
        overlayRotation,
        overlayScale,
        setBaseImage,
        setOverlayImage: handleOverlayImageChange,
        setOverlayPosition: handlePositionChange,
        setOverlayRotation: handleRotationChange,
        setOverlayScale: handleScaleChange,
        resetAR,
        shareEnabled,
        setShareEnabled,
        isSubmitting,
        submitToCloudinary,
        cloudinaryUrls
      }}
    >
      {children}
    </ARContext.Provider>
  );
};

export const useAR = (): ARContextProps => {
  const context = useContext(ARContext);
  if (context === undefined) {
    throw new Error('useAR must be used within an ARProvider');
  }
  return context;
};
