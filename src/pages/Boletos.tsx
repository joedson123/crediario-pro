import { useState, useEffect } from "react";
import { Plus, CheckCircle, Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/data/mockData";
import type { Boleto, DbBoleto } from "@/types";

const Boletos = () => {
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    due_date: ""
  });

  useEffect(() => {
    fetchBoletos();
  }, []);

  const fetchBoletos = async () => {
    try {
      const { data, error } = await supabase
        .from('boletos')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;

      const mappedBoletos: Boleto[] = (data as DbBoleto[]).map(boleto => ({
        ...boleto,
        due_date: new Date(boleto.due_date),
        payment_date: boleto.payment_date ? new Date(boleto.payment_date) : undefined,
        created_at: new Date(boleto.created_at),
        updated_at: new Date(boleto.updated_at),
      }));

      setBoletos(mappedBoletos);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Falha ao carregar boletos",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('boletos')
        .insert({
          description: formData.description,
          amount: parseFloat(formData.amount),
          due_date: formData.due_date,
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Boleto cadastrado com sucesso"
      });

      setFormData({ description: "", amount: "", due_date: "" });
      setIsOpen(false);
      fetchBoletos();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Falha ao cadastrar boleto",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarPago = async (id: string) => {
    try {
      const { error } = await supabase
        .from('boletos')
        .update({ 
          status: 'paid',
          payment_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Boleto marcado como pago"
      });

      fetchBoletos();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar boleto",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (boleto: Boleto) => {
    if (boleto.status === 'paid') {
      return <Badge variant="default" className="bg-success">Pago</Badge>;
    }
    
    const isOverdue = new Date() > boleto.due_date;
    return (
      <Badge variant={isOverdue ? "destructive" : "secondary"}>
        {isOverdue ? "Vencido" : "Pendente"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Boletos</h1>
          <p className="text-muted-foreground">
            Gerencie seus boletos a pagar
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:bg-primary-hover border-0">
              <Plus className="h-4 w-4 mr-2" />
              Novo Boleto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Boleto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Conta de luz, água, etc..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount">Valor</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="due_date">Data de Vencimento</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {boletos.length === 0 ? (
          <div className="col-span-full">
            <Card className="shadow-card bg-gradient-card">
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum boleto cadastrado ainda</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          boletos.map((boleto) => (
            <Card key={boleto.id} className="shadow-card hover:shadow-card-hover transition-all duration-200 bg-gradient-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {boleto.description}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Vencimento: {boleto.due_date.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  {getStatusBadge(boleto)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground">
                    {formatCurrency(boleto.amount)}
                  </span>
                  {boleto.status === 'pending' && (
                    <Button
                      onClick={() => handleMarcarPago(boleto.id)}
                      size="sm"
                      className="bg-gradient-success hover:bg-success border-0"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Pago
                    </Button>
                  )}
                </div>
                
                {boleto.payment_date && (
                  <p className="text-sm text-muted-foreground">
                    Pago em: {boleto.payment_date.toLocaleDateString('pt-BR')}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Boletos;