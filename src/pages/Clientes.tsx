import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Phone, MapPin, Eye, Search, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/data/mockData";
import type { Cliente, DbClient } from "@/types";

const Clientes = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['customers:list'],
    queryFn: async () => {
      // Buscar clientes com suas parcelas pendentes
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select(`
          *,
          installments!inner(
            id,
            due_date,
            status,
            amount
          )
        `)
        .eq('installments.status', 'pending')
        .order('created_at', { ascending: false });

      if (clientsError) throw clientsError;

      // Buscar também clientes sem parcelas pendentes
      const { data: allClientsData, error: allClientsError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (allClientsError) throw allClientsError;

      const today = new Date().toISOString().split('T')[0];
      
      // Processar clientes com parcelas pendentes
      const clientsWithPendingInstallments = (clientsData || []).map((client: any) => {
        const proximaParcela = client.installments
          .filter((p: any) => p.status === 'pending')
          .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];
        
        return {
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
          proximaCobranca: proximaParcela ? new Date(proximaParcela.due_date) : null,
          temCobrancaHoje: proximaParcela?.due_date === today
        };
      });

      // Processar clientes sem parcelas pendentes
      const allClientsProcessed = (allClientsData || []).map((client: any) => {
        const clientWithPending = clientsWithPendingInstallments.find(c => c.id === client.id);
        if (clientWithPending) return clientWithPending;
        
        return {
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
          proximaCobranca: null,
          temCobrancaHoje: false
        };
      });

      // Ordenar: primeiro os que têm cobrança hoje, depois por data de próxima cobrança
      return allClientsProcessed.sort((a, b) => {
        if (a.temCobrancaHoje && !b.temCobrancaHoje) return -1;
        if (!a.temCobrancaHoje && b.temCobrancaHoje) return 1;
        
        if (a.proximaCobranca && b.proximaCobranca) {
          return a.proximaCobranca.getTime() - b.proximaCobranca.getTime();
        }
        
        if (a.proximaCobranca && !b.proximaCobranca) return -1;
        if (!a.proximaCobranca && b.proximaCobranca) return 1;
        
        return b.dataCadastro.getTime() - a.dataCadastro.getTime();
      });
    }
  });

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone.includes(searchTerm) ||
    cliente.endereco.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calcularResumoCliente = (cliente: any) => {
    const totalPago = cliente.paid_amount || 0;
    const saldoDevedor = cliente.valorTotal - totalPago;
    const percentualPago = (totalPago / cliente.valorTotal) * 100;
    
    return {
      totalPago,
      saldoDevedor,
      percentualPago: Math.round(percentualPago)
    };
  };

  const openWhatsApp = (telefone: string) => {
    const cleanPhone = telefone.replace(/\D/g, "");
    window.open(`https://wa.me/55${cleanPhone}`, "_blank");
  };

  const openMaps = (endereco: string) => {
    // Open Google Maps with directions from current location to the address
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(endereco)}&travelmode=driving`;
    window.open(mapsUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie todos os seus clientes de crediário
          </p>
        </div>
        
        <Link to="/novo-cliente">
          <Button className="bg-gradient-primary hover:bg-primary-hover border-0">
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </Link>
      </div>

      {/* Barra de Pesquisa */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Pesquisar por nome, telefone ou endereço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredClientes.length === 0 ? (
          <div className="col-span-full">
            <Card className="shadow-card bg-gradient-card">
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>
                    {searchTerm
                      ? "Nenhum cliente encontrado com os termos pesquisados"
                      : "Nenhum cliente cadastrado ainda"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredClientes.map((cliente) => {
            const resumo = calcularResumoCliente(cliente);
            
            return (
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
                      </div>
                    </div>
                    
                    <Link to={`/clientes/${cliente.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Contatos */}
                  <div className="flex flex-col sm:flex-row gap-2 text-sm">
                    <button
                      onClick={() => openWhatsApp(cliente.telefone)}
                      className="flex items-center gap-2 text-muted-foreground hover:text-success transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      {cliente.telefone}
                    </button>
                    
                    <button
                      onClick={() => openMaps(cliente.endereco)}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <MapPin className="h-4 w-4" />
                      {cliente.endereco}
                    </button>
                  </div>

                  {/* Resumo Financeiro */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium text-foreground">
                        {resumo.percentualPago}%
                      </span>
                    </div>
                    
                    <Progress 
                      value={resumo.percentualPago} 
                      className="h-2"
                    />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Já Pago</p>
                        <p className="font-semibold text-success">
                          {formatCurrency(resumo.totalPago)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-muted-foreground">Saldo Devedor</p>
                        <p className="font-semibold text-destructive">
                          {formatCurrency(resumo.saldoDevedor)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Clientes;