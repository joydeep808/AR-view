
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useAR } from '@/contexts/ARContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    setShareEnabled
  } = useAR();

  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number[]) => {
    setOverlayPosition({
      ...overlayPosition,
      [axis]: value[0],
    });
  };

  const handleRotationChange = (axis: 'x' | 'y' | 'z', value: number[]) => {
    setOverlayRotation({
      ...overlayRotation,
      [axis]: value[0],
    });
  };

  const handleScaleChange = (value: number[]) => {
    setOverlayScale(value[0]);
  };

  const handleReset = () => {
    resetAR();
  };

  const handleShare = () => {
    setShareEnabled(true);
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
                <span className="text-sm text-muted-foreground">{overlayPosition.x.toFixed(2)}</span>
              </div>
              <Slider
                id="x-position"
                min={-5}
                max={5}
                step={0.1}
                value={[overlayPosition.x]}
                onValueChange={(value) => handlePositionChange('x', value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="y-position">Y Position</Label>
                <span className="text-sm text-muted-foreground">{overlayPosition.y.toFixed(2)}</span>
              </div>
              <Slider
                id="y-position"
                min={-5}
                max={5}
                step={0.1}
                value={[overlayPosition.y]}
                onValueChange={(value) => handlePositionChange('y', value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="z-position">Z Position</Label>
                <span className="text-sm text-muted-foreground">{overlayPosition.z.toFixed(2)}</span>
              </div>
              <Slider
                id="z-position"
                min={-5}
                max={5}
                step={0.1}
                value={[overlayPosition.z]}
                onValueChange={(value) => handlePositionChange('z', value)}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="rotation" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="x-rotation">X Rotation</Label>
                <span className="text-sm text-muted-foreground">{overlayRotation.x.toFixed(2)}</span>
              </div>
              <Slider
                id="x-rotation"
                min={-Math.PI}
                max={Math.PI}
                step={0.1}
                value={[overlayRotation.x]}
                onValueChange={(value) => handleRotationChange('x', value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="y-rotation">Y Rotation</Label>
                <span className="text-sm text-muted-foreground">{overlayRotation.y.toFixed(2)}</span>
              </div>
              <Slider
                id="y-rotation"
                min={-Math.PI}
                max={Math.PI}
                step={0.1}
                value={[overlayRotation.y]}
                onValueChange={(value) => handleRotationChange('y', value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="z-rotation">Z Rotation</Label>
                <span className="text-sm text-muted-foreground">{overlayRotation.z.toFixed(2)}</span>
              </div>
              <Slider
                id="z-rotation"
                min={-Math.PI}
                max={Math.PI}
                step={0.1}
                value={[overlayRotation.z]}
                onValueChange={(value) => handleRotationChange('z', value)}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="scale" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="scale">Scale</Label>
                <span className="text-sm text-muted-foreground">{overlayScale.toFixed(2)}</span>
              </div>
              <Slider
                id="scale"
                min={0.1}
                max={3}
                step={0.1}
                value={[overlayScale]}
                onValueChange={handleScaleChange}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between mt-6 space-x-2">
          <Button onClick={handleReset} variant="outline" className="flex-1">
            Reset
          </Button>
          <Button 
            onClick={handleShare} 
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
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
