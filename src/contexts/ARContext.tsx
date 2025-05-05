
import React, { createContext, useState, useContext, ReactNode } from 'react';

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
}

const ARContext = createContext<ARContextProps | undefined>(undefined);

export const ARProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0.5, z: 0.1 }); // Position overlay slightly above base image
  const [overlayRotation, setOverlayRotation] = useState({ 
    x: Math.PI / 2, // 90 degrees in radians for X-axis 
    y: 0, 
    z: 0 
  });
  const [overlayScale, setOverlayScale] = useState(0.8);
  const [shareEnabled, setShareEnabled] = useState(false);

  // Modified to handle overlay image changes automatically
  const handleOverlayImageChange = (url: string | null) => {
    setOverlayImage(url);
    
    // Automatically set position and rotation when overlay is added
    if (url) {
      // Position slightly above base image at 90 degrees
      setOverlayPosition({ x: 0, y: 0.5, z: 0.1 });
      setOverlayRotation({ 
        x: Math.PI / 2, // 90 degrees in radians
        y: 0, 
        z: 0 
      });
      setOverlayScale(0.8);
      setShareEnabled(true);
    }
  };

  const resetAR = () => {
    setBaseImage(null);
    setOverlayImage(null);
    setOverlayPosition({ x: 0, y: 0.5, z: 0.1 });
    setOverlayRotation({ 
      x: Math.PI / 2, 
      y: 0, 
      z: 0 
    });
    setOverlayScale(0.8);
    setShareEnabled(false);
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
        setOverlayPosition,
        setOverlayRotation,
        setOverlayScale,
        resetAR,
        shareEnabled,
        setShareEnabled,
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
