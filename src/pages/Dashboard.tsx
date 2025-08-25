import { useState, useEffect } from "react";
import { Users, Calendar, AlertTriangle, TrendingUp, Phone, MapPin, CheckCircle } from "lucide-react";
import MetricCard from "@/components/ui/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/data/mockData";
import type { DashboardMetrics, CobrancaDia } from "@/types";

const Dashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalClientes: 0,
    totalReceberHoje: 0,
    totalAtrasado: 0,
    totalRecebido: 0
  });
  const [cobrancasHoje, setCobrancasHoje] = useState<CobrancaDia[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Buscar total de clientes
      const { count: totalClientes } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      // Buscar parcelas do dia atual
      const today = new Date().toISOString().split('T')[0];
      const { data: installmentsToday, error: installmentsError } = await supabase
        .from('installments')
        .select(`
          id,
          amount,
          status,
          client_id,
          clients (name, phone, address)
        `)
        .eq('due_date', today);

      if (installmentsError) throw installmentsError;

      // Calcular métricas
      let totalReceberHoje = 0;
      let totalAtrasado = 0;
      const cobrancasData: CobrancaDia[] = [];

      if (installmentsToday) {
        installmentsToday.forEach((installment: any) => {
          if (installment.status === 'pending') {
            totalReceberHoje += installment.amount;
            cobrancasData.push({
              id: installment.id,
              cliente: installment.clients.name,
              telefone: installment.clients.phone,
              endereco: installment.clients.address,
              valor: installment.amount,
              parcelaId: installment.id
            });
          }
        });
      }

      // Buscar parcelas em atraso
      const { data: overdueInstallments } = await supabase
        .from('installments')
        .select('amount')
        .eq('status', 'overdue');

      if (overdueInstallments) {
        totalAtrasado = overdueInstallments.reduce((sum, installment) => sum + installment.amount, 0);
      }

      // Buscar total já recebido
      const { data: paidInstallments } = await supabase
        .from('installments')
        .select('amount')
        .eq('status', 'paid');

      const totalRecebido = paidInstallments ? 
        paidInstallments.reduce((sum, installment) => sum + installment.amount, 0) : 0;

      setMetrics({
        totalClientes: totalClientes || 0,
        totalReceberHoje,
        totalAtrasado,
        totalRecebido
      });

      setCobrancasHoje(cobrancasData);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    }
  };

  const handleMarcarPago = async (parcelaId: string) => {
    try {
      const { error } = await supabase
        .from('installments')
        .update({ 
          status: 'paid',
          payment_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', parcelaId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Parcela marcada como paga"
      });

      fetchDashboardData();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao marcar parcela como paga",
        variant: "destructive"
      });
    }
  };

  const openWhatsApp = (telefone: string) => {
    const cleanPhone = telefone.replace(/\D/g, "");
    window.open(`https://wa.me/55${cleanPhone}`, "_blank");
  };

  const openMaps = (endereco: string) => {
    window.open(`https://maps.google.com/?q=${encodeURIComponent(endereco)}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu negócio de crediário
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Clientes"
          value={metrics.totalClientes.toString()}
          icon={Users}
          variant="default"
        />
        
        <MetricCard
          title="A Receber Hoje"
          value={formatCurrency(metrics.totalReceberHoje)}
          icon={Calendar}
          variant="warning"
        />
        
        <MetricCard
          title="Em Atraso"
          value={formatCurrency(metrics.totalAtrasado)}
          icon={AlertTriangle}
          variant="destructive"
        />
        
        <MetricCard
          title="Já Recebido"
          value={formatCurrency(metrics.totalRecebido)}
          icon={TrendingUp}
          variant="success"
        />
      </div>

      {/* Cobranças do Dia */}
      <Card className="shadow-card bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Cobranças de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cobrancasHoje.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma cobrança para hoje</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cobrancasHoje.map((cobranca) => (
                <div
                  key={cobranca.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex-1 space-y-2 md:space-y-0">
                    <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                      <h3 className="font-semibold text-foreground">
                        {cobranca.cliente}
                      </h3>
                      <Badge variant="outline" className="w-fit">
                        {formatCurrency(cobranca.valor)}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 text-sm text-muted-foreground">
                      <button
                        onClick={() => openWhatsApp(cobranca.telefone)}
                        className="flex items-center gap-1 hover:text-success transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        {cobranca.telefone}
                      </button>
                      
                      <button
                        onClick={() => openMaps(cobranca.endereco)}
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <MapPin className="h-4 w-4" />
                        {cobranca.endereco}
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-3 md:mt-0 md:ml-4">
                    <Button
                      onClick={() => handleMarcarPago(cobranca.parcelaId)}
                      variant="default"
                      size="sm"
                      className="w-full md:w-auto bg-gradient-success hover:bg-success border-0"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Pago
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;