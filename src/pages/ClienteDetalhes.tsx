import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Phone, MapPin, Calendar, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { DbClient, DbInstallment } from "@/types";
import PagamentoParcelaDialog from "@/components/dialogs/PagamentoParcelaDialog";
import { useState } from "react";

const ClienteDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedParcela, setSelectedParcela] = useState<DbInstallment | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  // Buscar cliente
  const { data: cliente, isLoading: isLoadingCliente, refetch: refetchCliente } = useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Buscar parcelas
  const { data: parcelas = [], isLoading: isLoadingParcelas, refetch: refetchParcelas } = useQuery({
    queryKey: ['installments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('installments')
        .select('*')
        .eq('client_id', id)
        .order('installment_number', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };
  
  if (isLoadingCliente || isLoadingParcelas) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p>Carregando dados do cliente...</p>
        </div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-4">Cliente não encontrado</h1>
          <Link to="/clientes">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Clientes
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calcular resumo do cliente
  const parcelasPagas = parcelas.filter(p => p.status === 'paid');
  const totalPago = cliente.paid_amount || 0;
  const saldoDevedor = cliente.total_amount - totalPago;
  const percentualPago = cliente.total_amount > 0 ? Math.round((totalPago / cliente.total_amount) * 100) : 0;
  
  const resumo = {
    totalPago,
    saldoDevedor,
    percentualPago
  };

  const openWhatsApp = (telefone: string) => {
    const cleanPhone = telefone.replace(/\D/g, "");
    window.open(`https://wa.me/55${cleanPhone}`, "_blank");
  };

  const openMaps = (endereco: string) => {
    window.open(`https://maps.google.com/?q=${encodeURIComponent(endereco)}`, "_blank");
  };

  const handleOpenPaymentDialog = (parcela: any) => {
    setSelectedParcela(parcela as DbInstallment);
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentUpdated = () => {
    refetchCliente();
    refetchParcelas();
  };

  const getStatusBadge = (parcela: any) => {
    switch (parcela.status) {
      case "paid":
        return <Badge variant="secondary" className="bg-success-light text-success">Pago</Badge>;
      case "overdue":
        return <Badge variant="destructive">Em Atraso</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const getStatusIcon = (parcela: any) => {
    switch (parcela.status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/clientes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{cliente.name}</h1>
          <p className="text-muted-foreground">
            Cliente desde {formatDate(cliente.created_at)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do Cliente */}
        <div className="lg:col-span-1 space-y-6">
          {/* Dados Pessoais */}
          <Card className="shadow-card bg-gradient-card">
            <CardHeader>
              <CardTitle>Dados do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <button
                  onClick={() => openWhatsApp(cliente.phone)}
                  className="flex items-center gap-3 w-full text-left p-3 rounded-lg border border-border hover:bg-success-light hover:border-success transition-colors"
                >
                  <Phone className="h-5 w-5 text-success" />
                  <div>
                    <p className="font-medium text-foreground">{cliente.phone}</p>
                    <p className="text-sm text-muted-foreground">Abrir no WhatsApp</p>
                  </div>
                </button>

                <button
                  onClick={() => openMaps(cliente.address)}
                  className="flex items-center gap-3 w-full text-left p-3 rounded-lg border border-border hover:bg-primary-light hover:border-primary transition-colors"
                >
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{cliente.address}</p>
                    <p className="text-sm text-muted-foreground">Abrir no Google Maps</p>
                  </div>
                </button>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Forma de Pagamento</p>
                    <p className="font-medium capitalize">{cliente.payment_type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">1ª Parcela</p>
                    <p className="font-medium">{formatDate(cliente.first_payment_date)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumo Financeiro */}
          <Card className="shadow-card bg-gradient-card">
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-bold text-lg text-foreground">
                    {resumo.percentualPago}%
                  </span>
                </div>
                
                <Progress value={resumo.percentualPago} className="h-3" />
                
                <div className="grid grid-cols-1 gap-4 pt-2">
                  <div className="p-3 bg-primary-light rounded-lg">
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-xl font-bold text-primary">
                      {formatCurrency(cliente.total_amount)}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-success-light rounded-lg">
                    <p className="text-sm text-muted-foreground">Já Pago</p>
                    <p className="text-xl font-bold text-success">
                      {formatCurrency(resumo.totalPago)}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-destructive-light rounded-lg">
                    <p className="text-sm text-muted-foreground">Saldo Devedor</p>
                    <p className="text-xl font-bold text-destructive">
                      {formatCurrency(resumo.saldoDevedor)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Parcelas */}
        <div className="lg:col-span-2">
          <Card className="shadow-card bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Parcelas ({parcelas.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parcelas.map((parcela) => (
                      <TableRow key={parcela.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(parcela)}
                            {parcela.installment_number}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(parcela.amount)}
                        </TableCell>
                        <TableCell>
                          {formatDate(parcela.due_date)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(parcela)}
                        </TableCell>
                        <TableCell>
                          {parcela.payment_date ? (
                            <span className="text-sm text-muted-foreground">
                              {formatDate(parcela.payment_date)}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {parcela.status === "pending" || parcela.status === "overdue" ? (
                            <Button
                              onClick={() => handleOpenPaymentDialog(parcela)}
                              size="sm"
                              className="bg-gradient-success hover:bg-success border-0"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Pagar
                            </Button>
                          ) : (
                            <span className="text-sm text-success font-medium">✓ Pago</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de Pagamento */}
      {selectedParcela && (
        <PagamentoParcelaDialog
          isOpen={isPaymentDialogOpen}
          onClose={() => {
            setIsPaymentDialogOpen(false);
            setSelectedParcela(null);
          }}
          parcela={selectedParcela}
          onPaymentUpdated={handlePaymentUpdated}
        />
      )}
    </div>
  );
};

export default ClienteDetalhes;