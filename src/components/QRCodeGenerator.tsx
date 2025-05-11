
import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAR } from '@/contexts/ARContext';
import { Link } from 'react-router-dom';
import { saveARExperience } from '@/services/imageService';

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
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { toast } = useToast();
  const { cloudinaryUrls } = useAR();

  useEffect(() => {
    const generateShareUrl = async () => {
      if (arData.baseImage && arData.overlayImage) {
        // If we already have a metadata ID from Cloudinary, use it
        if (cloudinaryUrls.metadataId) {
          const baseUrl = window.location.origin;
          setShareUrl(`${baseUrl}/ar-view/${cloudinaryUrls.metadataId}`);
        }
      }
    };

    generateShareUrl();
  }, [arData, cloudinaryUrls]);

  const generateNewShareUrl = async () => {
    if (!arData.baseImage || !arData.overlayImage) {
      toast({
        title: "Missing images",
        description: "Please upload both base and overlay images.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Save AR experience and get unique ID
      const result = await saveARExperience(
        arData.baseImage,
        arData.overlayImage,
        arData.position,
        arData.rotation,
        arData.scale
      );

      const baseUrl = window.location.origin;
      const newShareUrl = `${baseUrl}/ar-view/${result.uniqueId}`;
      setShareUrl(newShareUrl);
      
      toast({
        title: "QR Code generated",
        description: "Your AR experience is ready to share!",
      });
    } catch (error) {
      console.error('Error generating share URL:', error);
      toast({
        title: "Generation failed",
        description: "Could not generate QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

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
    // Open the link in a new tab
    window.open(shareUrl, '_blank');
  };

  if (!arData.baseImage || !arData.overlayImage) return null;

  return (
    <Card className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-center">
          Share Your AR View
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {shareUrl ? (
          <>
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
                <Link to={shareUrl.replace(window.location.origin, '')} className="text-blue-500 hover:underline text-sm">
                  View in this browser
                </Link>
              </div>
            </div>
          </>
        ) : (
          <Button 
            onClick={generateNewShareUrl} 
            disabled={isGenerating}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {isGenerating ? "Generating..." : "Generate QR Code"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
