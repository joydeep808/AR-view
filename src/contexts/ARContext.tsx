
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
  const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0, z: 0 });
  const [overlayRotation, setOverlayRotation] = useState({ x: 0, y: 0, z: 0 });
  const [overlayScale, setOverlayScale] = useState(1);
  const [shareEnabled, setShareEnabled] = useState(false);

  const resetAR = () => {
    setBaseImage(null);
    setOverlayImage(null);
    setOverlayPosition({ x: 0, y: 0, z: 0 });
    setOverlayRotation({ x: 0, y: 0, z: 0 });
    setOverlayScale(1);
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
        setOverlayImage,
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
