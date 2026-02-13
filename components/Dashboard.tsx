
import React, { useMemo } from 'react';
import { AppState, CarStatus } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DollarSign, Car as CarIcon, Wrench, TrendingDown, Target, Key } from 'lucide-react';

interface Props {
  state: AppState;
}

const Dashboard: React.FC<Props> = ({ state }) => {
  const stats = useMemo(() => {
    const inStock = state.inventory.filter(c => c.status !== CarStatus.SOLD);
    const soldCars = state.inventory.filter(c => c.status === CarStatus.SOLD);
    
    const today = new Date();
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(today.getDate() + 2);

    const rentalAlerts = state.rentals.filter(r => {
      if (!r.active) return false;
      const end = new Date(r.endDate);
      return end <= twoDaysFromNow;
    });

    const lowStockAlerts = state.products.filter(p => p.quantity <= p.minQuantity);

    const salesProfit = soldCars.reduce((acc, c) => {
      const repairs = c.repairs.reduce((rAcc, r) => rAcc + r.cost, 0);
      return acc + ((c.salePrice || 0) - (c.purchasePrice + repairs));
    }, 0);

    const rentalRevenue = state.rentals.reduce((acc, r) => acc + r.totalValue, 0);
    
    const workshopProfit = state.serviceOrders.reduce((acc, so) => {
      const partsSale = so.usedParts.reduce((pAcc, p) => pAcc + (p.saleAtTime * p.quantity), 0);
      const partsCost = so.usedParts.reduce((pAcc, p) => pAcc + (p.costAtTime * p.quantity), 0);
      return acc + so.serviceValue + (partsSale - partsCost);
    }, 0);

    const expenses = state.expenses.reduce((acc, e) => acc + e.amount, 0);

    return {
      netProfit: (salesProfit + rentalRevenue + workshopProfit) - expenses,
      rentalRevenue,
      workshopProfit,
      expenses,
      rentalAlerts,
      lowStockAlerts,
      totalAssets: inStock.length
    };
  }, [state]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6">
      <header className="border-b border-slate-300 pb-4">
        <h2 className="text-xl font-black text-[#0b1426] uppercase italic tracking-tighter">Auto Car <span className="text-slate-500">Chapada</span></h2>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Painel de Controle de Performance</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Lucro Líquido Real" value={formatCurrency(stats.netProfit)} icon={<Target size={20}/>} color={stats.netProfit >= 0 ? "text-green-600" : "text-red-600"} sub="Geral Consolidado" highlight />
        <StatCard label="Margem de Oficina" value={formatCurrency(stats.workshopProfit)} icon={<Wrench size={20}/>} sub="M.O. + Lucro de Peças" />
        <StatCard label="Receita Locação" value={formatCurrency(stats.rentalRevenue)} icon={<Key size={20}/>} sub="Contratos de Aluguel" />
        <StatCard label="Custos Operacionais" value={formatCurrency(stats.expenses)} icon={<TrendingDown size={20}/>} color="text-red-500" sub="Despesas Mensais" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#e5e7eb] border border-slate-300 p-6 shadow-sm">
          <h3 className="text-[10px] font-bold text-[#0b1426] uppercase tracking-widest mb-6">Alertas Operacionais</h3>
          <div className="space-y-3">
             {stats.rentalAlerts.length > 0 && (
                <div className="p-3 bg-amber-100 border-l-4 border-amber-600 text-amber-900 text-[11px] font-bold uppercase">
                  {stats.rentalAlerts.length} Locações vencem em 48h
                </div>
             )}
             {stats.lowStockAlerts.length > 0 && (
                <div className="p-3 bg-red-100 border-l-4 border-red-600 text-red-900 text-[11px] font-bold uppercase">
                  {stats.lowStockAlerts.length} Itens com estoque crítico
                </div>
             )}
             {stats.rentalAlerts.length === 0 && stats.lowStockAlerts.length === 0 && (
               <p className="text-slate-500 italic text-xs font-medium">Todos os processos estão regulares.</p>
             )}
          </div>
        </div>

        <div className="bg-[#e5e7eb] border border-slate-300 p-6 shadow-sm">
          <h3 className="text-[10px] font-bold text-[#0b1426] uppercase tracking-widest mb-6">Volume de Ativos</h3>
          <div className="flex items-center gap-6">
            <div className="bg-[#0b1426] p-6 text-white flex-1">
               <p className="text-[9px] font-bold uppercase text-slate-400 mb-1 tracking-widest">Veículos em Pátio</p>
               <p className="text-4xl font-black italic">{stats.totalAssets}</p>
            </div>
            <div className="bg-white p-6 border border-slate-300 flex-1">
               <p className="text-[9px] font-bold uppercase text-slate-400 mb-1 tracking-widest">Status Geral</p>
               <p className="text-sm font-bold text-slate-900 uppercase italic">Operacional</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string, icon: React.ReactNode, sub: string, color?: string, highlight?: boolean }> = ({ label, value, icon, sub, color = "text-slate-900", highlight = false }) => (
  <div className={`p-5 border ${highlight ? 'bg-[#0b1426] border-[#0b1426] shadow-lg' : 'bg-[#e5e7eb] border-slate-300'}`}>
    <div className="flex justify-between items-start mb-2">
      <span className={`text-[10px] font-bold uppercase tracking-widest ${highlight ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
      <div className={highlight ? 'text-slate-200' : 'text-[#0b1426]'}>{icon}</div>
    </div>
    <p className={`text-xl font-black italic tracking-tighter ${highlight ? 'text-white' : color}`}>{value}</p>
    <p className={`text-[10px] mt-1 font-medium ${highlight ? 'text-slate-500' : 'text-slate-400'}`}>{sub}</p>
  </div>
);

export default Dashboard;
