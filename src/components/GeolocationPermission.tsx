import { useState, useEffect } from 'react';
import { MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GeolocationPermissionProps {
  onPermissionGranted: () => void;
  onPermissionDenied: (error: string) => void;
}

const GeolocationPermission = ({ onPermissionGranted, onPermissionDenied }: GeolocationPermissionProps) => {
  const [permissionState, setPermissionState] = useState<'checking' | 'prompt' | 'denied' | 'granted'>('checking');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    if (!navigator.geolocation) {
      onPermissionDenied('Geolocalização não é suportada neste dispositivo');
      return;
    }

    // Check if permission API is available
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        
        switch (permission.state) {
          case 'granted':
            setPermissionState('granted');
            onPermissionGranted();
            break;
          case 'denied':
            setPermissionState('denied');
            onPermissionDenied('Permissão de localização foi negada');
            break;
          case 'prompt':
            setPermissionState('prompt');
            break;
        }
      } catch (error) {
        // Fallback for browsers that don't support permissions API
        setPermissionState('prompt');
      }
    } else {
      // Fallback for older browsers
      setPermissionState('prompt');
    }
  };

  const requestPermission = async () => {
    setIsRequesting(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
          }
        );
      });
      
      setPermissionState('granted');
      onPermissionGranted();
    } catch (error: any) {
      let errorMessage = 'Erro ao obter localização';
      
      if (error.code === 1) {
        errorMessage = 'Permissão de localização negada. Por favor, habilite a localização nas configurações do navegador.';
      } else if (error.code === 2) {
        errorMessage = 'Localização indisponível. Verifique se o GPS está ativado.';
      } else if (error.code === 3) {
        errorMessage = 'Tempo limite excedido. Tente novamente.';
      }
      
      setPermissionState('denied');
      onPermissionDenied(errorMessage);
    } finally {
      setIsRequesting(false);
    }
  };

  if (permissionState === 'checking') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-6">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Verificando permissões...</span>
        </CardContent>
      </Card>
    );
  }

  if (permissionState === 'granted') {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          Localização Necessária
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {permissionState === 'prompt' && (
          <>
            <p className="text-center text-muted-foreground">
              Para mostrar clientes próximos e otimizar suas rotas, precisamos acessar sua localização.
            </p>
            <Button 
              onClick={requestPermission} 
              className="w-full"
              disabled={isRequesting}
            >
              {isRequesting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Solicitando permissão...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-2" />
                  Permitir Localização
                </>
              )}
            </Button>
          </>
        )}
        
        {permissionState === 'denied' && (
          <>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Permissão de localização negada. Para usar o mapa de clientes:
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>No celular:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Toque no ícone de cadeado/informações na barra de endereços</li>
                <li>Ative a permissão de "Localização"</li>
                <li>Recarregue a página</li>
              </ul>
              
              <p className="mt-3"><strong>No computador:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Clique no ícone de localização na barra de endereços</li>
                <li>Selecione "Sempre permitir"</li>
                <li>Recarregue a página</li>
              </ul>
            </div>
            
            <Button 
              onClick={checkPermissionStatus} 
              variant="outline" 
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GeolocationPermission;