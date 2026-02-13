
import React, { useState } from 'react';
import { OperationalExpense } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';
import { Landmark, Plus, Trash2 } from 'lucide-react';

interface Props {
  expenses: OperationalExpense[];
  onAddExpense: (expense: Omit<OperationalExpense, 'id' | 'date'>) => void;
  onDeleteExpense: (id: string) => void;
}

const OperationalCosts: React.FC<Props> = ({ expenses, onAddExpense, onDeleteExpense }) => {
  const [formData, setFormData] = useState({ name: '', amount: 0, category: EXPENSE_CATEGORIES[0] as any });
  const totalMonthly = expenses.reduce((acc, e) => acc + e.amount, 0);
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) return;
    onAddExpense(formData);
    setFormData({ name: '', amount: 0, category: EXPENSE_CATEGORIES[0] as any });
  };

  return (
    <div className="space-y-8">
      <header className="border-b border-slate-300 pb-4">
        <h2 className="text-xl font-black text-[#0b1426] uppercase italic tracking-tighter">Gestão Financeira</h2>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Controle de Gastos Estruturais</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-[#e5e7eb] p-6 border border-slate-300 sticky top-10 shadow-sm">
            <h3 className="text-[10px] font-bold mb-6 text-[#0b1426] uppercase tracking-widest flex items-center gap-2">
              <Plus size={14} className="text-slate-500" />
              Lançar Despesa Fixa
            </h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Descrição</label>
                <input required className="w-full bg-white border border-slate-200 p-2.5 text-xs outline-none focus:border-[#0b1426]" placeholder="Ex: Aluguel Unidade" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Valor Mensal (R$)</label>
                <input required type="number" className="w-full bg-white border border-slate-200 p-2.5 text-xs outline-none focus:border-[#0b1426]" value={formData.amount || ''} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Categoria Contábil</label>
                <select className="w-full bg-white border border-slate-200 p-2.5 text-xs outline-none focus:border-[#0b1426]" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })}>
                  {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full bg-[#0b1426] text-white text-[10px] font-bold py-3.5 uppercase tracking-widest transition-all hover:bg-[#111c30]">Salvar Lançamento</button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0b1426] text-white p-6 flex justify-between items-center shadow-lg">
            <div>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Gasto Operacional Total</p>
              <p className="text-3xl font-black italic tracking-tighter">{formatCurrency(totalMonthly)}</p>
            </div>
            <Landmark size={32} className="text-slate-700" />
          </div>

          <div className="bg-[#e5e7eb] border border-slate-300 overflow-hidden shadow-sm">
            <table className="w-full text-[11px]">
              <thead className="bg-slate-300 border-b border-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-[#0b1426] uppercase tracking-widest">Descrição</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-widest">Categoria</th>
                  <th className="px-4 py-3 text-left font-bold text-[#0b1426] uppercase tracking-widest">Valor</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {expenses.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400 italic">Nenhuma despesa registrada.</td></tr>
                ) : (
                  expenses.map(expense => (
                    <tr key={expense.id} className="hover:bg-slate-200 transition-colors">
                      <td className="px-4 py-3 font-bold text-[#0b1426] uppercase italic">{expense.name}</td>
                      <td className="px-4 py-3 text-slate-500 font-bold uppercase">{expense.category}</td>
                      <td className="px-4 py-3 font-black text-[#0b1426]">{formatCurrency(expense.amount)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => onDeleteExpense(expense.id)} className="text-slate-400 hover:text-red-600 p-1.5 transition-colors"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationalCosts;
