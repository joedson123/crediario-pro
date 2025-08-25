import React, { useState } from 'react';
import { MapPin, Camera, Clock, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CameraComponent, useCameraModal } from '@/components/ui/camera';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/data/mockData';
import type { Cliente } from '@/types';

interface CheckInVisitaProps {
  cliente: Cliente;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type StatusVisita = 'visitado' | 'nao_estava' | 'reagendado' | 'pago' | 'parcial';

interface VisitaData {
  clienteId: string;
  status: StatusVisita;
  observacoes: string;
  valorRecebido?: number;
  latitude?: number;
  longitude?: number;
  foto?: string;
  timestamp: number;
}

const CheckInVisita: React.FC<CheckInVisitaProps> = ({
  cliente,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [status, setStatus] = useState<StatusVisita>('visitado');
  const [observacoes, setObservacoes] = useState('');
  const [valorRecebido, setValorRecebido] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { saveOfflineData, isOnline } = useOfflineStorage();
  const { latitude, longitude, error: geoError } = useGeolocation({ watch: false });
  const {
    isOpen: cameraOpen,
    capturedImage,
    openCamera,
    closeCamera,
    handleCapture,
    clearImage
  } = useCameraModal();

  const handleSubmit = async () => {
    if (!status) {
      toast({
        title: "Erro",
        description: "Selecione o status da visita",
        variant: "destructive"
      });
      return;
    }

    if ((status === 'pago' || status === 'parcial') && !valorRecebido) {
      toast({
        title: "Erro",
        description: "Informe o valor recebido",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const visitaData: VisitaData = {
        clienteId: cliente.id,
        status,
        observacoes,
        valorRecebido: valorRecebido ? parseFloat(valorRecebido) : undefined,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        foto: capturedImage || undefined,
        timestamp: Date.now()
      };

      // Save to offline storage
      await saveOfflineData('visit', visitaData);

      toast({
        title: "Check-in realizado!",
        description: `Visita ao cliente ${cliente.nome} registrada${!isOnline ? ' (será sincronizada quando voltar online)' : ''}`,
        variant: "default"
      });

      // Reset form
      setStatus('visitado');
      setObservacoes('');
      setValorRecebido('');
      clearImage();
      
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao registrar check-in",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: StatusVisita) => {
    switch (status) {
      case 'pago': return 'bg-green-500';
      case 'parcial': return 'bg-yellow-500';
      case 'visitado': return 'bg-blue-500';
      case 'nao_estava': return 'bg-orange-500';
      case 'reagendado': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: StatusVisita) => {
    switch (status) {
      case 'pago': return 'Pago';
      case 'parcial': return 'Pagamento Parcial';
      case 'visitado': return 'Visitado';
      case 'nao_estava': return 'Não Estava';
      case 'reagendado': return 'Reagendado';
      default: return status;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-background max-h-[90vh] overflow-y-auto">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Check-in de Visita</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">{cliente.nome}</h3>
              <p className="text-sm text-muted-foreground">{cliente.endereco}</p>
              <Badge variant="outline">
                {formatCurrency(cliente.valorTotal)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Location Status */}
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              {geoError ? (
                <span className="text-destructive">Localização indisponível</span>
              ) : latitude && longitude ? (
                <span className="text-success">Localização obtida</span>
              ) : (
                <span className="text-muted-foreground">Obtendo localização...</span>
              )}
            </div>

            {/* Online/Offline Status */}
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`} />
              <span>{isOnline ? 'Online' : 'Offline - será sincronizado depois'}</span>
            </div>

            {/* Status Selection */}
            <div className="space-y-2">
              <Label htmlFor="status">Status da Visita *</Label>
              <Select value={status} onValueChange={(value: StatusVisita) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visitado">Visitado - Sem pagamento</SelectItem>
                  <SelectItem value="pago">Pago - Valor total</SelectItem>
                  <SelectItem value="parcial">Pagamento parcial</SelectItem>
                  <SelectItem value="nao_estava">Não estava em casa</SelectItem>
                  <SelectItem value="reagendado">Reagendado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Value Input for payments */}
            {(status === 'pago' || status === 'parcial') && (
              <div className="space-y-2">
                <Label htmlFor="valor">Valor Recebido *</Label>
                <input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={valorRecebido}
                  onChange={(e) => setValorRecebido(e.target.value)}
                  placeholder="0,00"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            )}

            {/* Photo Section */}
            <div className="space-y-2">
              <Label>Foto do Comprovante (Opcional)</Label>
              {capturedImage ? (
                <div className="space-y-2">
                  <img
                    src={capturedImage}
                    alt="Comprovante"
                    className="w-full h-32 object-cover rounded-md border"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearImage}
                      className="flex-1"
                    >
                      Remover
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openCamera}
                      className="flex-1"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Nova Foto
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={openCamera}
                  className="w-full"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Tirar Foto
                </Button>
              )}
            </div>

            {/* Observations */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Adicione observações sobre a visita..."
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-success hover:bg-success border-0"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Salvando...' : 'Confirmar Check-in'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Camera Modal */}
      <CameraComponent
        isOpen={cameraOpen}
        onClose={closeCamera}
        onCapture={handleCapture}
        title="Foto do Comprovante"
      />
    </>
  );
};

export default CheckInVisita;