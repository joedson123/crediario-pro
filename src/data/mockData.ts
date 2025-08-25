import { Cliente, Parcela, DashboardMetrics, CobrancaDia } from "@/types";

// Mock data para demonstração
export const mockClientes: Cliente[] = [
  {
    id: "1",
    nome: "Maria Silva Santos",
    telefone: "(11) 98765-4321",
    endereco: "Rua das Flores, 123 - Centro",
    valorTotal: 1200,
    formaPagamento: "semanal",
    dataPrimeiraParcela: new Date("2024-01-15"),
    dataCadastro: new Date("2024-01-10"),
    parcelas: []
  },
  {
    id: "2", 
    nome: "João Oliveira",
    telefone: "(11) 97654-3210",
    endereco: "Av. Principal, 456 - Bairro Alto",
    valorTotal: 800,
    formaPagamento: "quinzenal",
    dataPrimeiraParcela: new Date("2024-01-20"),
    dataCadastro: new Date("2024-01-15"),
    parcelas: []
  },
  {
    id: "3",
    nome: "Ana Costa Lima",
    telefone: "(11) 96543-2109",
    endereco: "Rua do Comércio, 789 - Vila Nova",
    valorTotal: 1500,
    formaPagamento: "mensal",
    dataPrimeiraParcela: new Date("2024-02-01"),
    dataCadastro: new Date("2024-01-25"),
    parcelas: []
  }
];

export const mockParcelas: Parcela[] = [
  // Parcelas para Maria Silva Santos (semanal - R$ 50 x 24 semanas)
  ...Array.from({ length: 24 }, (_, i) => ({
    id: `1-${i + 1}`,
    clienteId: "1",
    numero: i + 1,
    valor: 50,
    vencimento: new Date(2024, 0, 15 + (i * 7)), // A partir de 15/01, semanalmente
    status: i < 3 ? "pago" : i === 3 ? "atrasado" : "pendente",
    dataPagamento: i < 3 ? new Date(2024, 0, 15 + (i * 7)) : undefined
  } as Parcela)),
  
  // Parcelas para João Oliveira (quinzenal - R$ 100 x 8 quinzenas)
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `2-${i + 1}`,
    clienteId: "2",
    numero: i + 1,
    valor: 100,
    vencimento: new Date(2024, 0, 20 + (i * 15)), // A partir de 20/01, quinzenalmente
    status: i < 2 ? "pago" : "pendente",
    dataPagamento: i < 2 ? new Date(2024, 0, 20 + (i * 15)) : undefined
  } as Parcela)),
  
  // Parcelas para Ana Costa Lima (mensal - R$ 150 x 10 meses)
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `3-${i + 1}`,
    clienteId: "3",
    numero: i + 1,
    valor: 150,
    vencimento: new Date(2024, 1 + i, 1), // A partir de 01/02, mensalmente
    status: i < 1 ? "pago" : "pendente",
    dataPagamento: i < 1 ? new Date(2024, 1 + i, 1) : undefined
  } as Parcela))
];

// Associar parcelas aos clientes
mockClientes[0].parcelas = mockParcelas.filter(p => p.clienteId === "1");
mockClientes[1].parcelas = mockParcelas.filter(p => p.clienteId === "2");
mockClientes[2].parcelas = mockParcelas.filter(p => p.clienteId === "3");

export const mockDashboardMetrics: DashboardMetrics = {
  totalClientes: mockClientes.length,
  totalReceberHoje: 250,
  totalAtrasado: 150,
  totalRecebido: 450
};

export const mockCobrancasHoje: CobrancaDia[] = [
  {
    id: "1",
    cliente: "Maria Silva Santos",
    telefone: "(11) 98765-4321",
    endereco: "Rua das Flores, 123 - Centro",
    valor: 50,
    parcelaId: "1-4"
  },
  {
    id: "2",
    cliente: "João Oliveira", 
    telefone: "(11) 97654-3210",
    endereco: "Av. Principal, 456 - Bairro Alto",
    valor: 100,
    parcelaId: "2-3"
  }
];

// Funções utilitárias
export const calcularResumoCliente = (cliente: Cliente) => {
  const totalPago = cliente.parcelas
    .filter(p => p.status === "pago")
    .reduce((sum, p) => sum + p.valor, 0);
  
  const saldoDevedor = cliente.valorTotal - totalPago;
  const percentualPago = (totalPago / cliente.valorTotal) * 100;
  
  return {
    totalPago,
    saldoDevedor,
    percentualPago: Math.round(percentualPago)
  };
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR').format(date);
};