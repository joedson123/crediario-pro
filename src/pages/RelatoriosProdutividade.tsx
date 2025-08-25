import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, MapPin, Clock, Users, DollarSign, Calendar, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/data/mockData';

interface ProductivityMetrics {
  totalVisits: number;
  successfulVisits: number;
  totalCollected: number;
  averagePerVisit: number;
  distanceTraveled: number;
  timeSpent: number;
  conversionRate: number;
  dailyGoal: number;
  weeklyGoal: number;
  monthlyGoal: number;
}

interface DailyReport {
  date: string;
  visits: number;
  collected: number;
  distance: number;
  efficiency: number;
}

const RelatoriosProdutividade = () => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [metrics, setMetrics] = useState<ProductivityMetrics>({
    totalVisits: 0,
    successfulVisits: 0,
    totalCollected: 0,
    averagePerVisit: 0,
    distanceTraveled: 0,
    timeSpent: 0,
    conversionRate: 0,
    dailyGoal: 500,
    weeklyGoal: 3000,
    monthlyGoal: 12000
  });

  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);

  // Simulated data - in real app, this would come from your database
  useEffect(() => {
    const generateMockData = () => {
      const today = new Date();
      const reports: DailyReport[] = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        reports.push({
          date: date.toISOString().split('T')[0],
          visits: Math.floor(Math.random() * 15) + 5,
          collected: Math.floor(Math.random() * 800) + 200,
          distance: Math.floor(Math.random() * 50) + 10,
          efficiency: Math.floor(Math.random() * 40) + 60
        });
      }
      
      setDailyReports(reports);
      
      // Calculate metrics based on period
      const totalVisits = reports.reduce((sum, r) => sum + r.visits, 0);
      const totalCollected = reports.reduce((sum, r) => sum + r.collected, 0);
      const totalDistance = reports.reduce((sum, r) => sum + r.distance, 0);
      
      setMetrics({
        totalVisits,
        successfulVisits: Math.floor(totalVisits * 0.7),
        totalCollected,
        averagePerVisit: totalCollected / totalVisits,
        distanceTraveled: totalDistance,
        timeSpent: totalVisits * 15, // 15 minutes per visit average
        conversionRate: 70,
        dailyGoal: 500,
        weeklyGoal: 3000,
        monthlyGoal: 12000
      });
    };

    generateMockData();
  }, [period]);

  const getGoalProgress = () => {
    switch (period) {
      case 'today':
        return (metrics.totalCollected / metrics.dailyGoal) * 100;
      case 'week':
        return (metrics.totalCollected / metrics.weeklyGoal) * 100;
      case 'month':
        return (metrics.totalCollected / metrics.monthlyGoal) * 100;
      default:
        return 0;
    }
  };

  const getGoalAmount = () => {
    switch (period) {
      case 'today':
        return metrics.dailyGoal;
      case 'week':
        return metrics.weeklyGoal;
      case 'month':
        return metrics.monthlyGoal;
      default:
        return 0;
    }
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'today':
        return 'Hoje';
      case 'week':
        return 'Esta Semana';
      case 'month':
        return 'Este Mês';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios de Produtividade</h1>
          <p className="text-muted-foreground">
            Acompanhe seu desempenho nas vendas porta a porta
          </p>
        </div>
        
        <Select value={period} onValueChange={(value: 'today' | 'week' | 'month') => setPeriod(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Esta Semana</SelectItem>
            <SelectItem value="month">Este Mês</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Goal Progress */}
      <Card className="shadow-card bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Meta {getPeriodLabel()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-foreground">
                {formatCurrency(metrics.totalCollected)}
              </span>
              <span className="text-muted-foreground">
                de {formatCurrency(getGoalAmount())}
              </span>
            </div>
            
            <Progress value={Math.min(getGoalProgress(), 100)} className="h-3" />
            
            <div className="flex items-center justify-between text-sm">
              <span className={getGoalProgress() >= 100 ? 'text-success' : 'text-muted-foreground'}>
                {getGoalProgress().toFixed(1)}% da meta
              </span>
              <Badge variant={getGoalProgress() >= 100 ? 'default' : 'secondary'}>
                {getGoalProgress() >= 100 ? 'Meta Atingida!' : 'Em Progresso'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Visitas</p>
                <p className="text-2xl font-bold text-foreground">{metrics.totalVisits}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-foreground">{metrics.conversionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Média por Visita</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(metrics.averagePerVisit)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Distância Percorrida</p>
                <p className="text-2xl font-bold text-foreground">{metrics.distanceTraveled} km</p>
              </div>
              <MapPin className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Performance */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Desempenho Diário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dailyReports.map((report, index) => {
              const date = new Date(report.date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={report.date}
                  className={`p-4 rounded-lg border ${isToday ? 'border-primary bg-primary/5' : 'border-border'}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {date.toLocaleDateString('pt-BR', { 
                          weekday: 'short', 
                          day: '2-digit', 
                          month: '2-digit' 
                        })}
                      </span>
                      {isToday && <Badge variant="default" className="text-xs">Hoje</Badge>}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {report.visits} visitas
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {report.distance} km
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Coletado</p>
                      <p className="font-semibold text-success">
                        {formatCurrency(report.collected)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground">Eficiência</p>
                      <p className="font-semibold">{report.efficiency}%</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground">Média/Visita</p>
                      <p className="font-semibold">
                        {formatCurrency(report.collected / report.visits)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground">Km/Visita</p>
                      <p className="font-semibold">
                        {(report.distance / report.visits).toFixed(1)} km
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Tips */}
      <Card className="shadow-card bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Dicas de Melhoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.conversionRate < 60 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">
                  💡 Sua taxa de conversão está baixa. Tente melhorar sua abordagem inicial.
                </p>
              </div>
            )}
            
            {metrics.averagePerVisit < 30 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800">
                  💡 Considere focar em clientes com maior potencial de compra.
                </p>
              </div>
            )}
            
            {metrics.distanceTraveled / metrics.totalVisits > 5 && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm font-medium text-purple-800">
                  💡 Otimize suas rotas para reduzir a distância entre visitas.
                </p>
              </div>
            )}
            
            {getGoalProgress() >= 100 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  🎉 Parabéns! Você atingiu sua meta. Continue assim!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatoriosProdutividade;