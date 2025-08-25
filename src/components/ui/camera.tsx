import React, { useEffect } from 'react';
import { Camera, X, RotateCcw, Download } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { useCamera } from '@/hooks/useCamera';
import { cn } from '@/lib/utils';

interface CameraComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
  title?: string;
  className?: string;
  facingMode?: 'user' | 'environment';
}

export const CameraComponent: React.FC<CameraComponentProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Tirar Foto',
  className,
  facingMode = 'environment'
}) => {
  const {
    isCapturing,
    error,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    captureAndSave,
    switchCamera,
    downloadImage
  } = useCamera({ facingMode });

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  const handleCapture = async () => {
    const imageData = await captureAndSave();
    if (imageData) {
      onCapture(imageData);
      onClose();
    }
  };

  const handleDownload = async () => {
    const imageData = await captureAndSave();
    if (imageData) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      downloadImage(imageData, `foto-${timestamp}.jpg`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      <Card className={cn("w-full max-w-2xl bg-background", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {error ? (
            <div className="text-center py-8">
              <div className="text-destructive mb-4">
                <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{error}</p>
              </div>
              <Button onClick={startCamera} variant="outline">
                Tentar Novamente
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Camera Preview */}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Camera overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Grid lines for better composition */}
                  <div className="absolute inset-4 border border-white/30">
                    <div className="absolute top-1/3 left-0 right-0 border-t border-white/20" />
                    <div className="absolute top-2/3 left-0 right-0 border-t border-white/20" />
                    <div className="absolute left-1/3 top-0 bottom-0 border-l border-white/20" />
                    <div className="absolute left-2/3 top-0 bottom-0 border-l border-white/20" />
                  </div>
                </div>
              </div>

              {/* Camera Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={switchCamera}
                  disabled={isCapturing}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Virar
                </Button>

                <Button
                  onClick={handleCapture}
                  disabled={isCapturing}
                  className="bg-gradient-primary hover:bg-primary-hover border-0 px-8"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {isCapturing ? 'Capturando...' : 'Capturar'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isCapturing}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>

              {/* Instructions */}
              <div className="text-center text-sm text-muted-foreground">
                <p>Posicione o documento ou comprovante dentro do quadro</p>
                <p>Certifique-se de que a imagem esteja nítida e bem iluminada</p>
              </div>
            </div>
          )}

          {/* Hidden canvas for image capture */}
          <canvas
            ref={canvasRef}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
};

// Hook for easier camera usage
export const useCameraModal = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);

  const openCamera = () => setIsOpen(true);
  const closeCamera = () => setIsOpen(false);
  
  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
  };

  const clearImage = () => setCapturedImage(null);

  return {
    isOpen,
    capturedImage,
    openCamera,
    closeCamera,
    handleCapture,
    clearImage
  };
};