import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MetricCard from '@/components/ui/metric-card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/data/mockData';

interface SalesMetrics {
  vendasDia: {
    quantidade: number;
    valor: number;
  };
  vendasMes: {
    quantidade: number;
    valor: number;
  };
}

const RelatoriosProdutividade = () => {
  const [metrics, setMetrics] = useState<SalesMetrics>({
    vendasDia: { quantidade: 0, valor: 0 },
    vendasMes: { quantidade: 0, valor: 0 }
  });

  const { data: salesData, isLoading } = useQuery({
    queryKey: ['sales-metrics'],
    queryFn: async () => {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString();

      // Vendas do dia (clientes cadastrados hoje)
      const { data: dailySales, error: dailyError } = await supabase
        .from('clients')
        .select('total_amount')
        .gte('created_at', startOfDay)
        .lt('created_at', endOfDay);

      if (dailyError) throw dailyError;

      // Vendas do mês (clientes cadastrados este mês)
      const { data: monthlySales, error: monthlyError } = await supabase
        .from('clients')
        .select('total_amount')
        .gte('created_at', startOfMonth)
        .lt('created_at', endOfMonth);

      if (monthlyError) throw monthlyError;

      const vendasDia = {
        quantidade: dailySales?.length || 0,
        valor: dailySales?.reduce((sum, client) => sum + (client.total_amount || 0), 0) || 0
      };

      const vendasMes = {
        quantidade: monthlySales?.length || 0,
        valor: monthlySales?.reduce((sum, client) => sum + (client.total_amount || 0), 0) || 0
      };

      return { vendasDia, vendasMes };
    }
  });

  useEffect(() => {
    if (salesData) {
      setMetrics(salesData);
    }
  }, [salesData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Relatórios de Vendas</h1>
        <p className="text-muted-foreground">
          Acompanhe suas vendas diárias e mensais
        </p>
      </div>

      {/* Métricas de Vendas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Vendas Hoje"
          value={metrics.vendasDia.quantidade.toString()}
          subtitle="clientes"
          icon={Users}
          trend={{ value: 0, isPositive: true }}
        />
        
        <MetricCard
          title="Valor Hoje"
          value={formatCurrency(metrics.vendasDia.valor)}
          subtitle="em vendas"
          icon={DollarSign}
          trend={{ value: 0, isPositive: true }}
        />
        
        <MetricCard
          title="Vendas do Mês"
          value={metrics.vendasMes.quantidade.toString()}
          subtitle="clientes"
          icon={BarChart3}
          trend={{ value: 0, isPositive: true }}
        />
        
        <MetricCard
          title="Valor do Mês"
          value={formatCurrency(metrics.vendasMes.valor)}
          subtitle="em vendas"
          icon={TrendingUp}
          trend={{ value: 0, isPositive: true }}
        />
      </div>

      {/* Resumo Detalhado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendas do Dia */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Vendas de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Novos Clientes:</span>
                <span className="font-semibold text-foreground">{metrics.vendasDia.quantidade}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Valor Total:</span>
                <span className="font-semibold text-success">{formatCurrency(metrics.vendasDia.valor)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ticket Médio:</span>
                <span className="font-semibold text-foreground">
                  {metrics.vendasDia.quantidade > 0 
                    ? formatCurrency(metrics.vendasDia.valor / metrics.vendasDia.quantidade)
                    : formatCurrency(0)
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vendas do Mês */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Vendas do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Novos Clientes:</span>
                <span className="font-semibold text-foreground">{metrics.vendasMes.quantidade}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Valor Total:</span>
                <span className="font-semibold text-success">{formatCurrency(metrics.vendasMes.valor)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ticket Médio:</span>
                <span className="font-semibold text-foreground">
                  {metrics.vendasMes.quantidade > 0 
                    ? formatCurrency(metrics.vendasMes.valor / metrics.vendasMes.quantidade)
                    : formatCurrency(0)
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações Adicionais */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground space-y-2">
            <p>• <strong>Vendas do Dia:</strong> Contabiliza todos os clientes cadastrados hoje e seus valores totais</p>
            <p>• <strong>Vendas do Mês:</strong> Contabiliza todos os clientes cadastrados neste mês e seus valores totais</p>
            <p>• <strong>Ticket Médio:</strong> Valor médio por cliente cadastrado</p>
            <p>• Os valores são atualizados automaticamente a cada novo cliente cadastrado</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatoriosProdutividade;