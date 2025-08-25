import { useState } from 'react';
import { CalendarIcon, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatCurrency } from '@/data/mockData';

interface PagamentoDashboardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pagamento: {
    valor: number;
    tipo: 'total' | 'parcial';
    novaData?: string;
  }) => void;
  cobranca: {
    id: string;
    cliente: string;
    valor: number;
    parcelaId: string;
  };
}

const PagamentoDashboardDialog = ({
  isOpen,
  onClose,
  onConfirm,
  cobranca
}: PagamentoDashboardDialogProps) => {
  const [tipoPagamento, setTipoPagamento] = useState<'total' | 'parcial'>('total');
  const [valorPago, setValorPago] = useState(cobranca.valor.toString());
  const [novaData, setNovaData] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    
    try {
      const valor = parseFloat(valorPago);
      if (isNaN(valor) || valor <= 0) {
        alert('Por favor, insira um valor válido');
        return;
      }

      if (valor > cobranca.valor) {
        alert('O valor pago não pode ser maior que o valor da parcela');
        return;
      }

      await onConfirm({
        valor,
        tipo: tipoPagamento,
        novaData: tipoPagamento === 'parcial' && novaData ? novaData : undefined
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTipoPagamentoChange = (value: string) => {
    setTipoPagamento(value as 'total' | 'parcial');
    if (value === 'total') {
      setValorPago(cobranca.valor.toString());
      setNovaData('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Registrar Pagamento
          </DialogTitle>
          <DialogDescription>
            Cliente: <strong>{cobranca.cliente}</strong><br />
            Valor da parcela: <strong>{formatCurrency(cobranca.valor)}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tipo de Pagamento */}
          <div className="space-y-3">
            <Label>Tipo de Pagamento</Label>
            <RadioGroup
              value={tipoPagamento}
              onValueChange={handleTipoPagamentoChange}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="total" id="total" />
                <Label htmlFor="total">Pagamento Total</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="parcial" id="parcial" />
                <Label htmlFor="parcial">Pagamento Parcial</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Valor Pago */}
          <div className="space-y-2">
            <Label htmlFor="valor">Valor Pago</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0"
              max={cobranca.valor}
              value={valorPago}
              onChange={(e) => setValorPago(e.target.value)}
              placeholder="0,00"
              disabled={tipoPagamento === 'total'}
            />
          </div>

          {/* Nova Data (apenas para pagamento parcial) */}
          {tipoPagamento === 'parcial' && (
            <div className="space-y-2">
              <Label htmlFor="novaData">Nova Data de Vencimento (opcional)</Label>
              <div className="relative">
                <Input
                  id="novaData"
                  type="date"
                  value={novaData}
                  onChange={(e) => setNovaData(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              <p className="text-xs text-muted-foreground">
                Se não informar, o saldo restante ficará em aberto
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-gradient-success hover:bg-success"
          >
            {isLoading ? 'Processando...' : 'Confirmar Pagamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PagamentoDashboardDialog;