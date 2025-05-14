
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { saveARExperience } from '@/services/imageService';
import { Link } from 'react-router-dom';
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const { cloudinaryUrls, isSubmitting, submitToCloudinary } = useAR();
  
  const generateNewQRCode = async () => {
    // If we already have a Cloudinary URL from context, use it
    if (cloudinaryUrls.metadataId) {
      const url = `${window.location.origin}/ar-view/${cloudinaryUrls.metadataId}`;
      setShareUrl(url);
      return;
    }
    
    setIsGenerating(true);
    try {
      // Submit to backend API
      await submitToCloudinary();
      setIsGenerating(false);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast({
        title: "QR Code Generation Failed",
        description: "There was an error creating your shareable link.",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          toast({
            title: "Link Copied",
            description: "Share URL copied to clipboard",
          });
        })
        .catch(() => {
          toast({
            title: "Copy Failed",
            description: "Could not copy to clipboard",
            variant: "destructive",
          });
        });
    }
  };

  // Use the metadataId from context if available
  const finalShareUrl = shareUrl || (cloudinaryUrls.metadataId ? 
    `${window.location.origin}/ar-view/${cloudinaryUrls.metadataId}` : null);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-4">Share Your Creation</h3>
          
          {finalShareUrl ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 bg-white rounded-lg">
                <QRCodeSVG
                  value={finalShareUrl}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
              <p className="text-sm break-all">{finalShareUrl}</p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={copyToClipboard}>
                  Copy Link
                </Button>
                <Link to={finalShareUrl}>
                  <Button>Open AR View</Button>
                </Link>
              </div>
            </div>
          ) : (
            <Button 
              onClick={generateNewQRCode} 
              disabled={isGenerating || isSubmitting}
            >
              {isGenerating || isSubmitting ? 'Generating...' : 'Generate Share Link'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
