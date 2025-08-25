import { useState, useEffect } from 'react';
import { MapPin, Navigation, Route, Phone, Eye, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/data/mockData';
import CheckInVisita from '@/components/CheckInVisita';
import type { Cliente, DbClient } from '@/types';

interface ClienteComLocalizacao extends Cliente {
  latitude?: number;
  longitude?: number;
  distancia?: number;
}

const MapaClientes = () => {
  const [selectedClient, setSelectedClient] = useState<ClienteComLocalizacao | null>(null);
  const [checkInClient, setCheckInClient] = useState<ClienteComLocalizacao | null>(null);
  const [sortBy, setSortBy] = useState<'distance' | 'name' | 'amount'>('distance');
  
  const { latitude, longitude, error: geoError, getCurrentPosition } = useGeolocation({
    enableHighAccuracy: true,
    watch: false
  });

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['clients:map'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data as DbClient[]).map(client => ({
        id: client.id,
        nome: client.name,
        telefone: client.phone,
        endereco: client.address,
        valorTotal: client.total_amount,
        paid_amount: client.paid_amount,
        formaPagamento: client.payment_type as "semanal" | "quinzenal" | "mensal",
        dataPrimeiraParcela: new Date(client.first_payment_date),
        dataCadastro: new Date(client.created_at),
        parcelas: [],
        // Simulated coordinates - in real app, you'd geocode addresses
        latitude: -23.5505 + (Math.random() - 0.5) * 0.1,
        longitude: -46.6333 + (Math.random() - 0.5) * 0.1
      }));
    }
  });

  // Calculate distances and sort clients
  const clientesComDistancia = clientes.map(cliente => {
    if (latitude && longitude && cliente.latitude && cliente.longitude) {
      const distance = calculateDistance(
        latitude,
        longitude,
        cliente.latitude,
        cliente.longitude
      );
      return { ...cliente, distancia: distance };
    }
    return cliente;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        return (a.distancia || 999) - (b.distancia || 999);
      case 'name':
        return a.nome.localeCompare(b.nome);
      case 'amount':
        return b.valorTotal - a.valorTotal;
      default:
        return 0;
    }
  });

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const openGoogleMaps = (endereco: string, lat?: number, lng?: number) => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(endereco)}`, '_blank');
    }
  };

  const openWhatsApp = (telefone: string) => {
    const cleanPhone = telefone.replace(/\D/g, "");
    window.open(`https://wa.me/55${cleanPhone}`, "_blank");
  };

  const generateOptimizedRoute = () => {
    if (!latitude || !longitude) {
      alert('Localização atual não disponível');
      return;
    }

    const nearbyClients = clientesComDistancia
      .filter(c => c.distancia && c.distancia <= 10) // Within 10km
      .slice(0, 8); // Max 8 waypoints for Google Maps

    if (nearbyClients.length === 0) {
      alert('Nenhum cliente próximo encontrado');
      return;
    }

    const waypoints = nearbyClients
      .map(c => c.latitude && c.longitude ? `${c.latitude},${c.longitude}` : encodeURIComponent(c.endereco))
      .join('|');

    const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${latitude},${longitude}&waypoints=${waypoints}&travelmode=driving&optimize=true`;
    
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mapa de Clientes</h1>
          <p className="text-muted-foreground">
            Visualize e navegue até seus clientes
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={getCurrentPosition}
            variant="outline"
            size="sm"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Atualizar Localização
          </Button>
          
          <Button
            onClick={generateOptimizedRoute}
            className="bg-gradient-primary hover:bg-primary-hover border-0"
            size="sm"
            disabled={!latitude || !longitude}
          >
            <Route className="h-4 w-4 mr-2" />
            Rota Otimizada
          </Button>
        </div>
      </div>

      {/* Status da Localização */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-medium">Sua Localização:</span>
            </div>
            
            {geoError ? (
              <Badge variant="destructive">{geoError}</Badge>
            ) : latitude && longitude ? (
              <Badge variant="default">
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </Badge>
            ) : (
              <Badge variant="secondary">Obtendo localização...</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium">Ordenar por:</span>
            <Button
              variant={sortBy === 'distance' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('distance')}
            >
              Distância
            </Button>
            <Button
              variant={sortBy === 'name' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('name')}
            >
              Nome
            </Button>
            <Button
              variant={sortBy === 'amount' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('amount')}
            >
              Valor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {clientesComDistancia.map((cliente) => (
          <Card key={cliente.id} className="shadow-card hover:shadow-card-hover transition-all duration-200 bg-gradient-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {cliente.nome}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">
                      {cliente.formaPagamento}
                    </Badge>
                    <Badge variant="secondary">
                      {formatCurrency(cliente.valorTotal)}
                    </Badge>
                    {cliente.distancia && (
                      <Badge variant="default">
                        {cliente.distancia.toFixed(1)} km
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4" />
                  {cliente.endereco}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {cliente.telefone}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => openGoogleMaps(cliente.endereco, cliente.latitude, cliente.longitude)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Navegar
                </Button>
                
                <Button
                  onClick={() => openWhatsApp(cliente.telefone)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                
                <Button
                  onClick={() => setCheckInClient(cliente)}
                  variant="default"
                  size="sm"
                  className="bg-gradient-success hover:bg-success border-0"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Check-in
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clientesComDistancia.length === 0 && !isLoading && (
        <Card className="shadow-card bg-gradient-card">
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum cliente encontrado</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Check-in Modal */}
      {checkInClient && (
        <CheckInVisita
          cliente={checkInClient}
          isOpen={!!checkInClient}
          onClose={() => setCheckInClient(null)}
          onSuccess={() => {
            // Refresh data or show success message
            console.log('Check-in realizado com sucesso!');
          }}
        />
      )}
    </div>
  );
};

export default MapaClientes;