
import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAR } from '@/contexts/ARContext';
import { Link } from 'react-router-dom';

interface QRCodeGeneratorProps {
  arData: {
    baseImage: string | null;
    overlayImage: string | null;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: number;
  };
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ arData }) => {
  const [shareUrl, setShareUrl] = useState<string>('');
  const { toast } = useToast();
  const { cloudinaryUrls } = useAR();

  useEffect(() => {
    if (arData.baseImage && arData.overlayImage) {
      // Use Cloudinary URLs if available
      const baseImageUrl = cloudinaryUrls.baseImage || arData.baseImage;
      const overlayImageUrl = cloudinaryUrls.overlayImage || arData.overlayImage;
      
      // Determine the base URL based on the environment
      const baseUrl = window.location.origin;
      
      // Ensure all URLs are properly encoded
      const encodedBaseImage = encodeURIComponent(baseImageUrl);
      const encodedOverlayImage = overlayImageUrl ? encodeURIComponent(overlayImageUrl) : '';
      
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      
      // In a real implementation, we would generate a unique URL with the AR data
      if (cloudinaryUrls.metadataId) {
        // If we have a metadata ID, use it for a cleaner URL
        setShareUrl(`${baseUrl}/ar-view/${cloudinaryUrls.metadataId}?t=${timestamp}`);
      } else {
        // Otherwise use query parameters with proper encoding
        const queryParams = new URLSearchParams();
        queryParams.append('baseImage', encodedBaseImage);
        if (encodedOverlayImage) queryParams.append('overlayImage', encodedOverlayImage);
        queryParams.append('posX', arData.position.x.toString());
        queryParams.append('posY', arData.position.y.toString());
        queryParams.append('posZ', arData.position.z.toString());
        queryParams.append('rotX', arData.rotation.x.toString());
        queryParams.append('rotY', arData.rotation.y.toString());
        queryParams.append('rotZ', arData.rotation.z.toString());
        queryParams.append('scale', arData.scale.toString());
        queryParams.append('t', timestamp.toString());
        
        setShareUrl(`${baseUrl}/ar-view?${queryParams.toString()}`);
      }
    }
  }, [arData, cloudinaryUrls]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(
      () => {
        toast({
          title: "Link copied!",
          description: "The AR view link has been copied to your clipboard.",
        });
      },
      (err) => {
        toast({
          title: "Failed to copy",
          description: "Could not copy the link to clipboard.",
          variant: "destructive",
        });
        console.error('Could not copy text: ', err);
      },
    );
  };

  const testLink = () => {
    // Generate a fresh URL with a new timestamp before opening
    const freshUrl = new URL(shareUrl);
    freshUrl.searchParams.set('t', Date.now().toString());
    
    // Open the link in a new tab
    window.open(freshUrl.toString(), '_blank');
  };

  if (!shareUrl) return null;

  // Extract just the path portion for internal navigation and add a fresh timestamp
  const url = new URL(shareUrl);
  url.searchParams.set('t', Date.now().toString());
  const internalPath = url.pathname + url.search;

  return (
    <Card className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-center">
          Share Your AR View
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="p-4 bg-white rounded-lg">
          <QRCodeSVG value={shareUrl} size={200} />
        </div>
        <div className="w-full space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={copyToClipboard}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              Copy Link
            </Button>
            <Button 
              onClick={testLink}
              variant="outline"
            >
              Test Link
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground break-all">
            {shareUrl}
          </p>
          <div className="text-center mt-2">
            <Link to={internalPath} className="text-blue-500 hover:underline text-sm">
              View in this browser
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
