import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useAR } from '@/contexts/ARContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, RotateCw } from 'lucide-react';

const ControlPanel: React.FC = () => {
  const {
    overlayPosition,
    setOverlayPosition,
    overlayRotation,
    setOverlayRotation,
    overlayScale,
    setOverlayScale,
    resetAR,
    shareEnabled,
    setShareEnabled,
    isSubmitting,
    submitToCloudinary,
    cloudinaryUrls
  } = useAR();

  // Use local state to track values before sending to context
  const [localPosition, setLocalPosition] = useState({...overlayPosition});
  const [localRotation, setLocalRotation] = useState({
    x: overlayRotation.x * (180 / Math.PI), // Convert to degrees for UI
    y: overlayRotation.y * (180 / Math.PI),
    z: overlayRotation.z * (180 / Math.PI)
  });
  const [localScale, setLocalScale] = useState(overlayScale);
  
  // Update local state when context values change
  useEffect(() => {
    setLocalPosition({...overlayPosition});
  }, [overlayPosition]);
  
  useEffect(() => {
    setLocalRotation({
      x: overlayRotation.x * (180 / Math.PI),
      y: overlayRotation.y * (180 / Math.PI),
      z: overlayRotation.z * (180 / Math.PI)
    });
  }, [overlayRotation]);
  
  useEffect(() => {
    setLocalScale(overlayScale);
  }, [overlayScale]);

  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number[]) => {
    // Update local state first
    const newPosition = {
      ...localPosition,
      [axis]: value[0],
    };
    setLocalPosition(newPosition);
    
    // Directly update the context state without setTimeout
    setOverlayPosition({...newPosition});
  };

  const handleRotationChange = (axis: 'x' | 'y' | 'z', value: number[]) => {
    // Update local rotation in degrees
    const newLocalRotation = {
      ...localRotation,
      [axis]: value[0],
    };
    setLocalRotation(newLocalRotation);
    
    // Convert to radians for the actual overlay
    const newRotation = {
      ...overlayRotation,
      [axis]: value[0] * (Math.PI / 180), // Convert degrees to radians
    };
    
    // Directly update context state
    setOverlayRotation({...newRotation});
  };

  const handleScaleChange = (value: number[]) => {
    setLocalScale(value[0]);
    setOverlayScale(value[0]);
  };

  const handleReset = () => {
    resetAR();
    // Reset local state too
    setLocalPosition({ x: 0, y: 0.5, z: 0.1 });
    setLocalRotation({ x: 90, y: 0, z: 0 }); // 90 degrees = Math.PI/2 radians
    setLocalScale(0.8);
  };

  const handleShare = () => {
    setShareEnabled(true);
  };

  const handleSubmit = async () => {
    await submitToCloudinary();
  };

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-center">AR Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="position" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="position">Position</TabsTrigger>
            <TabsTrigger value="rotation">Rotation</TabsTrigger>
            <TabsTrigger value="scale">Scale</TabsTrigger>
          </TabsList>
          
          <TabsContent value="position" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="x-position">X Position</Label>
                <span className="text-sm text-muted-foreground">{localPosition.x.toFixed(2)}</span>
              </div>
              <Slider
                id="x-position"
                min={-5}
                max={5}
                step={0.1}
                value={[localPosition.x]}
                onValueChange={(value) => handlePositionChange('x', value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="y-position">Y Position</Label>
                <span className="text-sm text-muted-foreground">{localPosition.y.toFixed(2)}</span>
              </div>
              <Slider
                id="y-position"
                min={-5}
                max={5}
                step={0.1}
                value={[localPosition.y]}
                onValueChange={(value) => handlePositionChange('y', value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="z-position">Z Position</Label>
                <span className="text-sm text-muted-foreground">{localPosition.z.toFixed(2)}</span>
              </div>
              <Slider
                id="z-position"
                min={-5}
                max={5}
                step={0.1}
                value={[localPosition.z]}
                onValueChange={(value) => handlePositionChange('z', value)}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="rotation" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="x-rotation">X Rotation</Label>
                <span className="text-sm text-muted-foreground">{localRotation.x.toFixed(0)}°</span>
              </div>
              <Slider
                id="x-rotation"
                min={-180}
                max={180}
                step={1} // 1 degree increments
                value={[localRotation.x]}
                onValueChange={(value) => handleRotationChange('x', value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="y-rotation">Y Rotation</Label>
                <span className="text-sm text-muted-foreground">{localRotation.y.toFixed(0)}°</span>
              </div>
              <Slider
                id="y-rotation"
                min={-180}
                max={180}
                step={1} // 1 degree increments
                value={[localRotation.y]}
                onValueChange={(value) => handleRotationChange('y', value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="z-rotation">Z Rotation</Label>
                <span className="text-sm text-muted-foreground">{localRotation.z.toFixed(0)}°</span>
              </div>
              <Slider
                id="z-rotation"
                min={-180}
                max={180}
                step={1} // 1 degree increments
                value={[localRotation.z]}
                onValueChange={(value) => handleRotationChange('z', value)}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="scale" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="scale">Scale</Label>
                <span className="text-sm text-muted-foreground">{localScale.toFixed(2)}</span>
              </div>
              <Slider
                id="scale"
                min={0.1}
                max={3}
                step={0.1}
                value={[localScale]}
                onValueChange={handleScaleChange}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex flex-col mt-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleReset} variant="outline">
              Reset
            </Button>
            <Button 
              onClick={handleSubmit}
              variant="default"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              disabled={isSubmitting || !shareEnabled}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>Save to Cloudinary</>
              )}
            </Button>
          </div>
          
          <Button 
            onClick={handleShare}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            disabled={!shareEnabled && (!overlayPosition || !overlayRotation)}
          >
            Generate QR
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;
