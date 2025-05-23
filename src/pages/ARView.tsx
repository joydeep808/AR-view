
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ARProvider } from '@/contexts/ARContext';
import ARViewer from '@/components/ARViewer';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { fetchARExperience, processImageUrl } from '@/services/imageService';
import { Button } from '@/components/ui/button';

const ARViewPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [arData, setArData] = useState({
    baseImage: null as string | null,
    overlayImage: null as string | null,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 1
  });

  useEffect(() => {
    // Function to load AR data
    const loadARData = async () => {
      setIsLoading(true);
      try {
        // First check if we have an ID in the route params (for metadata-based sharing)
        if (id) {
          console.log("Loading AR data from ID:", id);
          
          // Fetch AR experience data from our backend API
          const arExperience = await fetchARExperience(id);
          
          console.log("Received AR data:", arExperience);
          
          if (!arExperience || !arExperience.baseImage) {
            throw new Error('Invalid AR data received');
          }
          
          // Process image URLs for better compatibility
          const baseWithCache = processImageUrl(arExperience.baseImage);
          const overlayWithCache = processImageUrl(arExperience.overlayImage);
          
          console.log("Processed image URLs:", {
            base: baseWithCache,
            overlay: overlayWithCache
          });
          
          setArData({
            baseImage: baseWithCache,
            overlayImage: overlayWithCache,
            position: arExperience.position || { x: 0, y: 0, z: 0 },
            rotation: arExperience.rotation || { x: 0, y: 0, z: 0 },
            scale: arExperience.scale || 1
          });
          
          setIsLoading(false);
          toast({
            title: "AR Experience Loaded",
            description: "AR experience has been loaded successfully.",
          });
        }
        // Otherwise try to use search params (legacy support)
        else {
          // Get and decode parameters
          const baseImageParam = searchParams.get('baseImage');
          const overlayImageParam = searchParams.get('overlayImage');
          
          // Handle URL-encoded parameters
          const baseImage = baseImageParam ? decodeURIComponent(baseImageParam) : null;
          const overlayImage = overlayImageParam ? decodeURIComponent(overlayImageParam) : null;
          
          // Parse position, rotation and scale parameters
          const posX = parseFloat(searchParams.get('posX') || '0');
          const posY = parseFloat(searchParams.get('posY') || '0');
          const posZ = parseFloat(searchParams.get('posZ') || '0');
          const rotX = parseFloat(searchParams.get('rotX') || '0');
          const rotY = parseFloat(searchParams.get('rotY') || '0');
          const rotZ = parseFloat(searchParams.get('rotZ') || '0');
          const scale = parseFloat(searchParams.get('scale') || '1');

          if (!baseImage) {
            throw new Error('No base image provided');
          }

          console.log("Loading AR data from query params:", {
            baseImage, overlayImage, position: { x: posX, y: posY, z: posZ }
          });

          // Add cache busters to the image URLs
          const baseWithCache = addCacheBuster(baseImage);
          const overlayWithCache = overlayImage ? addCacheBuster(overlayImage) : null;

          setArData({
            baseImage: baseWithCache,
            overlayImage: overlayWithCache,
            position: { x: posX, y: posY, z: posZ },
            rotation: { x: rotX, y: rotY, z: rotZ },
            scale
          });
          
          setIsLoading(false);
          toast({
            title: "AR Experience Loaded",
            description: "Your AR experience has been loaded using legacy mode.",
          });
        }
      } catch (err) {
        console.error('Error loading AR data:', err);
        setError('Failed to load AR experience. Please check the URL and try again.');
        setIsLoading(false);
        
        toast({
          title: "Error Loading AR Experience",
          description: "Could not load the AR experience. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadARData();
  }, [id, searchParams]);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // Force reload the current page
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center p-8">
              <h2 className="text-2xl font-bold mb-4">Loading AR Experience...</h2>
              <Skeleton className="h-[400px] w-full rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center p-8">
              <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
              <p>{error}</p>
              <div className="flex justify-center gap-4 mt-4">
                <Button onClick={handleRetry}>
                  Retry Loading
                </Button>
                <Link to="/">
                  <Button variant="outline">
                    Return to Home
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ARProvider
      initialData={{
        baseImage: arData.baseImage,
        overlayImage: arData.overlayImage,
        overlayPosition: arData.position,
        overlayRotation: arData.rotation,
        overlayScale: arData.scale
      }}
    >
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Shared AR Experience
          </h1>
          <p className="text-muted-foreground mt-2">
            View this AR creation in 3D
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6">
          <ARViewer />
          <div className="text-center text-sm text-gray-500">
            <p>Debug info: Base image: {arData.baseImage?.substring(0, 30)}...</p>
            <p>Overlay image: {arData.overlayImage?.substring(0, 30)}...</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-blue-500 hover:text-blue-700 underline">
            Create Your Own AR Experience
          </Link>
        </div>
      </div>
    </ARProvider>
  );
};

export default ARViewPage;
