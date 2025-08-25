import { useState, useRef, useCallback } from 'react';

interface CameraState {
  isOpen: boolean;
  isCapturing: boolean;
  error: string | null;
  stream: MediaStream | null;
}

interface CameraOptions {
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
  quality?: number;
}

export const useCamera = (options: CameraOptions = {}) => {
  const {
    facingMode = 'environment', // Back camera by default for documents
    width = 1920,
    height = 1080,
    quality = 0.8
  } = options;

  const [state, setState] = useState<CameraState>({
    isOpen: false,
    isCapturing: false,
    error: null,
    stream: null
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null, isCapturing: true }));

      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Câmera não é suportada neste navegador');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: width },
          height: { ideal: height }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setState(prev => ({
        ...prev,
        isOpen: true,
        isCapturing: false,
        stream,
        error: null
      }));
    } catch (error: any) {
      let errorMessage = 'Erro ao acessar a câmera';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Permissão de câmera negada. Permita o acesso à câmera nas configurações do navegador.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Nenhuma câmera encontrada no dispositivo.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Câmera está sendo usada por outro aplicativo.';
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        isCapturing: false
      }));
    }
  }, [facingMode, width, height]);

  const stopCamera = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach(track => track.stop());
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setState({
      isOpen: false,
      isCapturing: false,
      error: null,
      stream: null
    });
  }, [state.stream]);

  const capturePhoto = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!videoRef.current || !canvasRef.current) {
        resolve(null);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        resolve(null);
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64 image
      const imageData = canvas.toDataURL('image/jpeg', quality);
      resolve(imageData);
    });
  }, [quality]);

  const captureAndSave = useCallback(async (): Promise<string | null> => {
    try {
      setState(prev => ({ ...prev, isCapturing: true }));
      
      const imageData = await capturePhoto();
      
      setState(prev => ({ ...prev, isCapturing: false }));
      
      return imageData;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Erro ao capturar foto',
        isCapturing: false
      }));
      return null;
    }
  }, [capturePhoto]);

  // Switch between front and back camera
  const switchCamera = useCallback(async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    
    stopCamera();
    
    // Wait a bit before starting with new facing mode
    setTimeout(() => {
      startCamera();
    }, 100);
  }, [facingMode, stopCamera, startCamera]);

  // Convert base64 to blob for upload
  const base64ToBlob = useCallback((base64: string, mimeType: string = 'image/jpeg'): Blob => {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }, []);

  // Save image to device (download)
  const downloadImage = useCallback((base64: string, filename: string = 'photo.jpg') => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return {
    ...state,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    capturePhoto,
    captureAndSave,
    switchCamera,
    base64ToBlob,
    downloadImage
  };
};