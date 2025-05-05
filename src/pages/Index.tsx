
import { useEffect, useState } from 'react';
import { ARProvider, useAR } from '@/contexts/ARContext';
import ImageUploader from '@/components/ImageUploader';
import ARViewer from '@/components/ARViewer';
import ControlPanel from '@/components/ControlPanel';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { saveImages, loadImages } from '@/services/imageService';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ARApp = () => {
  const { 
    baseImage, 
    setBaseImage, 
    overlayImage, 
    setOverlayImage, 
    overlayPosition, 
    overlayRotation, 
    overlayScale, 
    shareEnabled 
  } = useAR();

  // Load saved images when component mounts
  useEffect(() => {
    const savedImages = loadImages();
    if (savedImages.baseImage) setBaseImage(savedImages.baseImage);
    if (savedImages.overlayImage) setOverlayImage(savedImages.overlayImage);
  }, [setBaseImage, setOverlayImage]);

  // Save images when they change
  useEffect(() => {
    saveImages(baseImage, overlayImage);
  }, [baseImage, overlayImage]);

  const handleBaseImageUpload = (imageUrl: string) => {
    setBaseImage(imageUrl);
  };

  const handleOverlayImageUpload = (imageUrl: string) => {
    setOverlayImage(imageUrl);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          3D AR Viewer
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload images, position them in 3D space, and share with a QR code
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ARViewer />
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-4">
                <ImageUploader
                  onImageSelected={handleBaseImageUpload}
                  label="Upload Base Image"
                  className="mb-2"
                />
                {baseImage && (
                  <ImageUploader
                    onImageSelected={handleOverlayImageUpload}
                    label="Upload Overlay Image"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {baseImage && overlayImage && <ControlPanel />}
        </div>
      </div>

      {shareEnabled && (
        <>
          <div className="my-8">
            <Separator />
          </div>

          <div className="mx-auto max-w-md">
            <QRCodeGenerator 
              arData={{
                baseImage,
                overlayImage,
                position: overlayPosition,
                rotation: overlayRotation,
                scale: overlayScale
              }} 
            />
          </div>
        </>
      )}

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>3D AR Viewer - Interact with augmented reality business cards and images</p>
      </footer>
    </div>
  );
};

const Index = () => {
  return (
    <ARProvider>
      <ARApp />
    </ARProvider>
  );
};

export default Index;
