import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { UserPlus, Calendar, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DbClient, DbInstallment } from "@/types";

const NovoCliente = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    endereco: "",
    valorTotal: "",
    formaPagamento: "",
    dataPrimeiraParcela: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calcularParcelas = () => {
    if (!formData.valorTotal || !formData.formaPagamento) return null;
    
    const valor = parseFloat(formData.valorTotal);
    let numeroParcelas: number;
    let valorParcela: number;
    
    switch (formData.formaPagamento) {
      case "semanal":
        numeroParcelas = Math.ceil(valor / 50); // R$ 50 por semana
        valorParcela = valor / numeroParcelas;
        break;
      case "quinzenal":
        numeroParcelas = Math.ceil(valor / 100); // R$ 100 por quinzena
        valorParcela = valor / numeroParcelas;
        break;
      case "mensal":
        numeroParcelas = Math.ceil(valor / 150); // R$ 150 por mês
        valorParcela = valor / numeroParcelas;
        break;
      default:
        return null;
    }
    
    return {
      numeroParcelas,
      valorParcela: Math.round(valorParcela * 100) / 100
    };
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      telefone: "",
      endereco: "",
      valorTotal: "",
      formaPagamento: "",
      dataPrimeiraParcela: ""
    });
  };

  const generateInstallments = (clientId: string, totalAmount: number, paymentType: string, firstPaymentDate: string) => {
    const installments = [];
    let numeroParcelas: number;
    let valorParcela: number;
    
    switch (paymentType) {
      case "semanal":
        numeroParcelas = Math.ceil(totalAmount / 50);
        valorParcela = totalAmount / numeroParcelas;
        break;
      case "quinzenal":
        numeroParcelas = Math.ceil(totalAmount / 100);
        valorParcela = totalAmount / numeroParcelas;
        break;
      case "mensal":
        numeroParcelas = Math.ceil(totalAmount / 150);
        valorParcela = totalAmount / numeroParcelas;
        break;
      default:
        return [];
    }

    const startDate = new Date(firstPaymentDate);
    
    for (let i = 0; i < numeroParcelas; i++) {
      const dueDate = new Date(startDate);
      
      switch (paymentType) {
        case "semanal":
          dueDate.setDate(startDate.getDate() + (i * 7));
          break;
        case "quinzenal":
          dueDate.setDate(startDate.getDate() + (i * 15));
          break;
        case "mensal":
          dueDate.setMonth(startDate.getMonth() + i);
          break;
      }
      
      installments.push({
        client_id: clientId,
        installment_number: i + 1,
        amount: Math.round(valorParcela * 100) / 100,
        due_date: dueDate.toISOString().split('T')[0]
      });
    }
    
    return installments;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Validações básicas
    if (!formData.nome || !formData.telefone || !formData.endereco || 
        !formData.valorTotal || !formData.formaPagamento || !formData.dataPrimeiraParcela) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Inserir cliente
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: formData.nome,
          phone: formData.telefone,
          address: formData.endereco,
          total_amount: parseFloat(formData.valorTotal),
          payment_type: formData.formaPagamento,
          first_payment_date: formData.dataPrimeiraParcela
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // Gerar e inserir parcelas
      const installments = generateInstallments(
        clientData.id,
        parseFloat(formData.valorTotal),
        formData.formaPagamento,
        formData.dataPrimeiraParcela
      );

      const { error: installmentsError } = await supabase
        .from('installments')
        .insert(installments);

      if (installmentsError) throw installmentsError;

      // Invalidar cache e navegar
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      
      toast({
        title: "Cliente cadastrado com sucesso!",
        description: `${formData.nome} foi adicionado ao sistema.`,
        variant: "default",
      });
      
      resetForm();
      navigate("/clientes");
      
    } catch (error: any) {
      console.error('Erro ao cadastrar cliente:', error);
      toast({
        title: "Erro ao cadastrar cliente",
        description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const parcelasInfo = calcularParcelas();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Novo Cliente</h1>
        <p className="text-muted-foreground">
          Cadastre um novo cliente no sistema de crediário
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="lg:col-span-2">
          <Card className="shadow-card bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      type="text"
                      value={formData.nome}
                      onChange={(e) => handleInputChange("nome", e.target.value)}
                      placeholder="Digite o nome completo"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange("telefone", e.target.value)}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="valorTotal">Valor Total *</Label>
                    <Input
                      id="valorTotal"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.valorTotal}
                      onChange={(e) => handleInputChange("valorTotal", e.target.value)}
                      placeholder="0,00"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="endereco">Endereço Completo *</Label>
                    <Input
                      id="endereco"
                      type="text"
                      value={formData.endereco}
                      onChange={(e) => handleInputChange("endereco", e.target.value)}
                      placeholder="Rua, número, bairro, cidade"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="formaPagamento">Forma de Pagamento *</Label>
                    <Select value={formData.formaPagamento} onValueChange={(value) => handleInputChange("formaPagamento", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a forma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="quinzenal">Quinzenal</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="dataPrimeiraParcela">Data da 1ª Parcela *</Label>
                    <Input
                      id="dataPrimeiraParcela"
                      type="date"
                      value={formData.dataPrimeiraParcela}
                      onChange={(e) => handleInputChange("dataPrimeiraParcela", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/clientes")}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-primary hover:bg-primary-hover border-0"
                    disabled={isSubmitting}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Cadastrando..." : "Cadastrar Cliente"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview das Parcelas */}
        <div>
          <Card className="shadow-card bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Preview das Parcelas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {parcelasInfo ? (
                <div className="space-y-4">
                  <div className="p-4 bg-primary-light rounded-lg">
                    <div className="text-sm text-muted-foreground mb-2">
                      Resumo do Parcelamento
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Número de parcelas:</span>
                        <span className="font-semibold">{parcelasInfo.numeroParcelas}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valor por parcela:</span>
                        <span className="font-semibold">
                          R$ {parcelasInfo.valorParcela.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Periodicidade:</span>
                        <span className="font-semibold capitalize">
                          {formData.formaPagamento}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    * As parcelas serão geradas automaticamente após o cadastro
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">
                    Preencha o valor total e a forma de pagamento para ver o preview
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NovoCliente;