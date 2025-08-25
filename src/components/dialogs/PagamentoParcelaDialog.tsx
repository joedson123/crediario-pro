import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DbInstallment } from "@/types";

interface PagamentoParcelaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  parcela: DbInstallment;
  onPaymentUpdated: () => void;
}

const PagamentoParcelaDialog = ({ isOpen, onClose, parcela, onPaymentUpdated }: PagamentoParcelaDialogProps) => {
  const { toast } = useToast();
  const [valorPagamento, setValorPagamento] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const valorRestante = parcela.amount;
  const maxPagamento = valorRestante;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    const pagamento = parseFloat(valorPagamento);
    
    if (pagamento <= 0 || pagamento > maxPagamento) {
      toast({
        title: "Valor inválido",
        description: `O valor deve ser entre R$ 0,01 e R$ ${maxPagamento.toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (pagamento === valorRestante) {
        // Pagamento total - marca como pago
        const { error } = await supabase
          .from('installments')
          .update({
            status: 'paid',
            payment_date: new Date().toISOString().split('T')[0]
          })
          .eq('id', parcela.id);

        if (error) throw error;

        // Atualizar valor pago do cliente
        const { data: client } = await supabase
          .from('clients')
          .select('paid_amount')
          .eq('id', parcela.client_id)
          .single();

        if (client) {
          const { error: clientError } = await supabase
            .from('clients')
            .update({
              paid_amount: (client.paid_amount || 0) + pagamento
            })
            .eq('id', parcela.client_id);

          if (clientError) throw clientError;
        }

        toast({
          title: "Pagamento registrado!",
          description: `Parcela ${parcela.installment_number} marcada como paga.`,
        });
      } else {
        // Pagamento parcial - criar nova parcela com o valor restante
        const valorRestanteNovo = valorRestante - pagamento;
        
        // Marcar parcela atual como paga com o valor do pagamento
        const { error: updateError } = await supabase
          .from('installments')
          .update({
            status: 'paid',
            amount: pagamento,
            payment_date: new Date().toISOString().split('T')[0]
          })
          .eq('id', parcela.id);

        if (updateError) throw updateError;

        // Criar nova parcela com o valor restante
        const { error: insertError } = await supabase
          .from('installments')
          .insert({
            client_id: parcela.client_id,
            installment_number: parcela.installment_number,
            amount: valorRestanteNovo,
            due_date: parcela.due_date,
            status: 'pending'
          });

        if (insertError) throw insertError;

        // Atualizar valor pago do cliente
        const { data: client } = await supabase
          .from('clients')
          .select('paid_amount')
          .eq('id', parcela.client_id)
          .single();

        if (client) {
          const { error: clientError } = await supabase
            .from('clients')
            .update({
              paid_amount: (client.paid_amount || 0) + pagamento
            })
            .eq('id', parcela.client_id);

          if (clientError) throw clientError;
        }

        toast({
          title: "Pagamento parcial registrado!",
          description: `R$ ${pagamento.toFixed(2)} registrado. Saldo restante: R$ ${valorRestanteNovo.toFixed(2)}`,
        });
      }

      onPaymentUpdated();
      onClose();
      setValorPagamento("");
      
    } catch (error: any) {
      console.error('Erro ao registrar pagamento:', error);
      toast({
        title: "Erro ao registrar pagamento",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento - Parcela {parcela.installment_number}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="p-3 bg-primary-light rounded-lg">
              <p className="text-sm text-muted-foreground">Valor da parcela</p>
              <p className="text-lg font-bold text-primary">R$ {parcela.amount.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valorPagamento">Valor do pagamento *</Label>
            <Input
              id="valorPagamento"
              type="number"
              min="0.01"
              max={maxPagamento}
              step="0.01"
              value={valorPagamento}
              onChange={(e) => setValorPagamento(e.target.value)}
              placeholder="0,00"
              required
            />
            <p className="text-xs text-muted-foreground">
              Máximo: R$ {maxPagamento.toFixed(2)}
            </p>
          </div>

          {valorPagamento && parseFloat(valorPagamento) < valorRestante && (
            <div className="p-3 bg-warning-light rounded-lg">
              <p className="text-sm font-medium text-warning">Pagamento Parcial</p>
              <p className="text-xs text-muted-foreground">
                Saldo restante: R$ {(valorRestante - parseFloat(valorPagamento)).toFixed(2)}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-success hover:bg-success border-0"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registrando..." : "Registrar Pagamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PagamentoParcelaDialog;