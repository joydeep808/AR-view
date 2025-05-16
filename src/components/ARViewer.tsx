
import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import { useAR } from '@/contexts/ARContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { isDataUrl } from '@/services/imageService';

interface PlaneProps {
  texture: THREE.Texture;
  isBase?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

const Plane: React.FC<PlaneProps> = ({ 
  texture, 
  isBase = false, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  scale = 1
}) => {
  return (
    <mesh
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
    >
      <planeGeometry args={[1, texture.image.height / texture.image.width]} />
      <meshBasicMaterial map={texture} transparent={!isBase} />
    </mesh>
  );
};

// Enhanced texture loader with better error handling and crossOrigin support
const TextureLoader = ({ 
  url, 
  children, 
  fallback 
}: {
  url: string | null;
  children: (texture: THREE.Texture) => React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // If no URL provided, show fallback
  if (!url) {
    console.log("No image URL provided");
    return fallback || null;
  }
  
  // Handle different URL types
  let processedUrl = url;
  console.log("Loading texture from URL:", url.substring(0, 100) + (url.length > 100 ? '...' : ''));
  
  try {
    // Create a texture loader that handles both data URLs and regular URLs
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous'; // Enable CORS for all texture loading
    
    if (isDataUrl(url)) {
      // For data URLs, we create a manual texture
      const image = new Image();
      image.crossOrigin = 'anonymous';
      const texture = new THREE.Texture(image);
      
      image.onload = () => {
        texture.needsUpdate = true;
        texture.flipY = true; // Ensure proper orientation
        setLoading(false);
      };
      
      image.onerror = (err) => {
        console.error("Error loading data URL image:", err);
        setError(new Error('Failed to load data URL image'));
        setLoading(false);
      };
      
      // Set the source to the data URL
      image.src = url;
      
      // Return a placeholder while loading
      if (loading) {
        return <Html center><div className="text-white p-2 bg-black/50 rounded">Loading image...</div></Html>;
      }
      
      // Handle errors
      if (error) {
        console.error("Error during data URL texture creation:", error);
        return fallback || <Html center><div className="text-white p-2 bg-black/50 rounded">Failed to load image</div></Html>;
      }
      
      // Return the texture when successful
      return <>{children(texture)}</>;
    } else {
      // For remote URLs (like Cloudinary), we need to handle loading differently
      const [texture, setTexture] = useState<THREE.Texture | null>(null);
      
      useEffect(() => {
        // Add cache busting to URL if not a data URL
        const timestamp = Date.now();
        const urlWithCache = url.includes('?') ? 
          `${url}&t=${timestamp}` : 
          `${url}?t=${timestamp}`;
        
        // Set up the loader with proper CORS settings
        loader.crossOrigin = 'anonymous';
        loader.setCrossOrigin('anonymous');
        
        // Load the texture
        loader.load(
          urlWithCache,
          (loadedTexture) => {
            console.log("Texture loaded successfully");
            loadedTexture.needsUpdate = true;
            loadedTexture.flipY = true;
            setTexture(loadedTexture);
            setLoading(false);
          },
          undefined,
          (err) => {
            console.error("Error loading texture:", err);
            setError(err);
            setLoading(false);
          }
        );
      }, [url]);
      
      // Handle different states
      if (loading) {
        return <Html center><div className="text-white p-2 bg-black/50 rounded">Loading image...</div></Html>;
      }
      
      if (error || !texture) {
        console.error("Error loading texture:", error);
        return fallback || <Html center><div className="text-white p-2 bg-black/50 rounded">Failed to load image</div></Html>;
      }
      
      // If texture loaded successfully, render it
      return <>{children(texture)}</>;
    }
  } catch (err) {
    console.error("Error in texture loading process:", err);
    return fallback || <Html center><div className="text-white p-2 bg-black/50 rounded">Failed to load image</div></Html>;
  }
};

const Scene: React.FC = () => {
  const { baseImage, overlayImage, overlayPosition, overlayRotation, overlayScale } = useAR();
  
  console.log("Rendering AR Scene with:", { 
    baseImage: baseImage ? baseImage.substring(0, 50) + '...' : null, 
    overlayImage: overlayImage ? overlayImage.substring(0, 50) + '...' : null,
    overlayPosition, 
    overlayRotation, 
    overlayScale 
  });
  
  // Convert object position and rotation to arrays for Three.js
  const positionArray: [number, number, number] = [
    overlayPosition.x,
    overlayPosition.y,
    overlayPosition.z
  ];
  
  const rotationArray: [number, number, number] = [
    overlayRotation.x,
    overlayRotation.y,
    overlayRotation.z
  ];

  return (
    <>
      {/* Base image */}
      {baseImage && (
        <TextureLoader 
          url={baseImage}
          fallback={<Html center><div className="text-white p-2 bg-black/50 rounded">Failed to load base image</div></Html>}
        >
          {(texture) => (
            <Plane texture={texture} isBase position={[0, 0, 0]} />
          )}
        </TextureLoader>
      )}
      
      {/* Overlay image if available */}
      {overlayImage && (
        <TextureLoader
          url={overlayImage}
          fallback={<Html center><div className="text-white p-2 bg-black/50 rounded">Failed to load overlay image</div></Html>}
        >
          {(texture) => (
            <Plane 
              texture={texture} 
              position={positionArray}
              rotation={rotationArray}
              scale={overlayScale}
            />
          )}
        </TextureLoader>
      )}
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </>
  );
};

// Custom OrbitControls wrapper to handle device-specific settings
const CustomOrbitControls: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <OrbitControls 
      enableZoom={true}
      enablePan={true}
      enableRotate={true}
      zoomSpeed={0.5}
      // Make controls more responsive on non-mobile devices
      rotateSpeed={isMobile ? 1.0 : 1.5}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      }}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN
      }}
    />
  );
};

const LoadingFallback: React.FC = () => {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center">
        <Skeleton className="h-40 w-60 rounded-lg" />
        <p className="mt-4 text-white">Loading AR scene...</p>
      </div>
    </Html>
  );
};

const ARViewer: React.FC = () => {
  const { baseImage, overlayImage, resetAR, setOverlayImage } = useAR();
  
  console.log("ARViewer received:", { 
    baseImage: baseImage ? `${baseImage.substring(0, 30)}...` : null, 
    overlayImage: overlayImage ? `${overlayImage.substring(0, 30)}...` : null 
  });
  
  if (!baseImage) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg">
        <p className="text-white text-center">Upload a base image to start</p>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden shadow-xl relative">
      {overlayImage && (
        <button 
          onClick={() => setOverlayImage(null)} 
          className="absolute top-2 right-2 z-10 bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-md hover:bg-white transition-colors"
          aria-label="Remove overlay image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
      )}
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 2]} />
        <CustomOrbitControls />
        <Suspense fallback={<LoadingFallback />}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ARViewer;
