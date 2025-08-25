export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  endereco: string;
  valorTotal: number;
  formaPagamento: "semanal" | "quinzenal" | "mensal";
  dataPrimeiraParcela: Date;
  dataCadastro: Date;
  parcelas: Parcela[];
}

export interface Parcela {
  id: string;
  clienteId: string;
  numero: number;
  valor: number;
  vencimento: Date;
  status: "pendente" | "pago" | "atrasado";
  dataPagamento?: Date;
}

// Supabase database interfaces
export interface DbClient {
  id: string;
  name: string;
  phone: string;
  address: string;
  total_amount: number;
  paid_amount: number;
  payment_type: 'semanal' | 'quinzenal' | 'mensal';
  first_payment_date: string;
  created_at: string;
  updated_at: string;
}

export interface DbInstallment {
  id: string;
  client_id: string;
  installment_number: number;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  payment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardMetrics {
  totalClientes: number;
  totalReceberHoje: number;
  totalAtrasado: number;
  totalRecebido: number;
}

export interface CobrancaDia {
  id: string;
  cliente: string;
  telefone: string;
  endereco: string;
  valor: number;
  parcelaId: string;
}

export interface Boleto {
  id: string;
  description: string;
  amount: number;
  due_date: Date;
  status: 'pending' | 'paid';
  payment_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface DbBoleto {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid';
  payment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  expense_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface DbExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  expense_date: string;
  created_at: string;
  updated_at: string;
}