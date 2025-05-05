import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAR } from '@/contexts/ARContext';

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
      
      // In a real implementation, we would generate a unique URL with the AR data
      // Here we're simulating this by creating a URL with query parameters or using metadata ID
      if (cloudinaryUrls.metadataId) {
        // If we have a metadata ID, use it for a cleaner URL
        setShareUrl(`https://example.com/ar-view/${cloudinaryUrls.metadataId}`);
      } else {
        // Otherwise use query parameters with truncated image URLs
        const queryParams = new URLSearchParams({
          baseImage: encodeURIComponent(baseImageUrl.substring(0, 50) + '...'),
          overlayImage: encodeURIComponent(overlayImageUrl.substring(0, 50) + '...'),
          posX: arData.position.x.toString(),
          posY: arData.position.y.toString(),
          posZ: arData.position.z.toString(),
          rotX: arData.rotation.x.toString(),
          rotY: arData.rotation.y.toString(),
          rotZ: arData.rotation.z.toString(),
          scale: arData.scale.toString()
        });
        
        setShareUrl(`https://example.com/ar-view?${queryParams.toString()}`);
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

  if (!shareUrl) return null;

  return (
    <Card className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-center">
          {cloudinaryUrls.metadataId ? 'Share Your Cloudinary AR View' : 'Share Your AR View'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="p-4 bg-white rounded-lg">
          <QRCodeSVG value={shareUrl} size={200} />
        </div>
        <div className="w-full space-y-2">
          <Button 
            onClick={copyToClipboard}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            Copy Link
          </Button>
          {cloudinaryUrls.metadataId && (
            <p className="text-center text-sm text-green-600">
              Using Cloudinary URLs for better sharing performance
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
