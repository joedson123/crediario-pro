import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/data/mockData";
import type { Expense, DbExpense } from "@/types";

const categories = [
  { value: "gasolina", label: "Gasolina" },
  { value: "alimentacao", label: "Alimentação" },
  { value: "transporte", label: "Transporte" },
  { value: "manutencao", label: "Manutenção" },
  { value: "escritorio", label: "Escritório" },
  { value: "marketing", label: "Marketing" },
  { value: "outros", label: "Outros" }
];

const Despesas = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    expense_date: ""
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });

      if (error) throw error;

      const mappedExpenses: Expense[] = (data as DbExpense[]).map(expense => ({
        ...expense,
        expense_date: new Date(expense.expense_date),
        created_at: new Date(expense.created_at),
        updated_at: new Date(expense.updated_at),
      }));

      setExpenses(mappedExpenses);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Falha ao carregar despesas",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const expenseData = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        expense_date: formData.expense_date,
      };

      if (editingExpense) {
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', editingExpense.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Despesa atualizada com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert(expenseData);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Despesa cadastrada com sucesso"
        });
      }

      resetForm();
      fetchExpenses();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Falha ao salvar despesa",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      expense_date: expense.expense_date.toISOString().split('T')[0]
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Despesa excluída com sucesso"
      });

      fetchExpenses();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Falha ao excluir despesa",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({ description: "", amount: "", category: "", expense_date: "" });
    setEditingExpense(null);
    setIsOpen(false);
  };

  const getCategoryLabel = (value: string) => {
    return categories.find(cat => cat.value === value)?.label || value;
  };

  const getTotalByCategory = () => {
    return categories.map(category => {
      const total = expenses
        .filter(expense => expense.category === category.value)
        .reduce((sum, expense) => sum + expense.amount, 0);
      return { ...category, total };
    }).filter(cat => cat.total > 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Despesas</h1>
          <p className="text-muted-foreground">
            Controle suas despesas por categoria
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:bg-primary-hover border-0">
              <Plus className="h-4 w-4 mr-2" />
              Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingExpense ? "Editar Despesa" : "Cadastrar Nova Despesa"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Combustível do carro"
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
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expense_date">Data da Despesa</Label>
                <Input
                  id="expense_date"
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
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

      {/* Resumo por Categoria */}
      <Card className="shadow-card bg-gradient-card">
        <CardHeader>
          <CardTitle>Resumo por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {getTotalByCategory().map((category) => (
              <div key={category.value} className="text-center">
                <Badge variant="outline" className="mb-2">
                  {category.label}
                </Badge>
                <p className="font-semibold text-foreground">
                  {formatCurrency(category.total)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Despesas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {expenses.length === 0 ? (
          <div className="col-span-full">
            <Card className="shadow-card bg-gradient-card">
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma despesa cadastrada ainda</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          expenses.map((expense) => (
            <Card key={expense.id} className="shadow-card hover:shadow-card-hover transition-all duration-200 bg-gradient-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {expense.description}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {expense.expense_date.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {getCategoryLabel(expense.category)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground">
                    {formatCurrency(expense.amount)}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(expense)}
                      size="sm"
                      variant="outline"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(expense.id)}
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Despesas;