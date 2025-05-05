
import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import { useAR } from '@/contexts/ARContext';
import { Skeleton } from '@/components/ui/skeleton';

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

const Scene: React.FC = () => {
  const { baseImage, overlayImage, overlayPosition, overlayRotation, overlayScale } = useAR();
  
  // Load textures
  const baseTexture = useLoader(TextureLoader, baseImage || '/placeholder.svg');
  const overlayTexture = overlayImage ? useLoader(TextureLoader, overlayImage) : null;

  return (
    <>
      {/* Base image */}
      <Plane texture={baseTexture} isBase position={[0, 0, 0]} />
      
      {/* Overlay image if available */}
      {overlayTexture && (
        <Plane 
          texture={overlayTexture} 
          position={[overlayPosition.x, overlayPosition.y, overlayPosition.z]} 
          rotation={[overlayRotation.x, overlayRotation.y, overlayRotation.z]}
          scale={overlayScale}
        />
      )}
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </>
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
  const { baseImage } = useAR();
  
  if (!baseImage) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg">
        <p className="text-white text-center">Upload a base image to start</p>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden shadow-xl">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 2]} />
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          zoomSpeed={0.5}
        />
        <Suspense fallback={<LoadingFallback />}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ARViewer;
