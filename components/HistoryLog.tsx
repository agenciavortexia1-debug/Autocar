
import React, { useState, useMemo } from 'react';
import { HistoryEntry } from '../types';
import { Search, Clock, Filter, Tag, ArrowUpRight } from 'lucide-react';

interface Props {
  history: HistoryEntry[];
}

const HistoryLog: React.FC<Props> = ({ history }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredHistory = useMemo(() => {
    return history.filter(h => {
      const matchesSearch = h.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            h.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || h.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [history, searchTerm, categoryFilter]);

  const categories = ['all', 'Patio', 'Financeiro', 'Locação', 'Oficina', 'Produtos'];

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Patio': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Financeiro': return 'bg-red-100 text-red-700 border-red-200';
      case 'Locação': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Oficina': return 'bg-green-100 text-green-700 border-green-200';
      case 'Produtos': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <header className="border-b border-slate-300 pb-4">
        <h2 className="text-xl font-black text-[#0b1426] uppercase italic tracking-tighter">Histórico de Movimentações</h2>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Auditoria completa de atividades do sistema</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 items-center bg-[#e5e7eb] p-2 border border-slate-300 flex-1 w-full">
          <Search className="text-slate-500 ml-2" size={16} />
          <input 
            type="text" 
            placeholder="BUSCAR NO HISTÓRICO..." 
            className="flex-1 bg-transparent border-none focus:ring-0 text-[10px] font-bold text-slate-700 uppercase" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${
                categoryFilter === cat 
                ? 'bg-[#0b1426] text-white border-[#0b1426]' 
                : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? 'Ver Todos' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-300 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredHistory.length === 0 ? (
            <div className="p-20 text-center">
              <Clock className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 italic text-xs font-medium uppercase tracking-widest">Nenhuma movimentação encontrada com esses filtros.</p>
            </div>
          ) : (
            filteredHistory.map((log) => (
              <div key={log.id} className="p-4 hover:bg-[#f8fafc] transition-colors flex items-center gap-4 group">
                <div className="flex flex-col items-center justify-center text-slate-400 w-16">
                   <p className="text-[10px] font-black leading-none">{new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                   <p className="text-[8px] font-bold uppercase">{new Date(log.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</p>
                </div>
                <div className="h-10 w-px bg-slate-200 group-hover:bg-slate-300 transition-colors"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 border ${getCategoryColor(log.category)}`}>
                      {log.category}
                    </span>
                    <span className={`text-[8px] font-bold uppercase tracking-widest ${
                      log.type === 'ADD' ? 'text-green-600' : 
                      log.type === 'DELETE' ? 'text-red-600' : 
                      'text-blue-600'
                    }`}>
                      • {log.type}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-800 uppercase italic leading-tight">{log.description}</p>
                </div>
                <ArrowUpRight className="text-slate-200 group-hover:text-slate-400 transition-colors" size={16} />
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="bg-[#0b1426] p-4 text-center">
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">O sistema armazena automaticamente as últimas 500 movimentações</p>
      </div>
    </div>
  );
};

export default HistoryLog;
