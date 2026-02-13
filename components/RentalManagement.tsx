
import React, { useState } from 'react';
import { AppState, Car, Rental, CarStatus } from '../types';
import { Key, Plus, CheckCircle2, User, Calendar, DollarSign, X } from 'lucide-react';

interface Props {
  state: AppState;
  onAddRental: (rental: Omit<Rental, 'id'>) => void;
  onFinishRental: (rentalId: string) => void;
}

const RentalManagement: React.FC<Props> = ({ state, onAddRental, onFinishRental }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    carId: '',
    customerName: '',
    customerDoc: '',
    customerPhone: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    dailyRate: 0,
    totalValue: 0
  });

  const availableCars = state.inventory.filter(c => c.status === CarStatus.STOCK);
  const activeRentals = state.rentals.filter(r => r.active);
  const historyRentals = state.rentals.filter(r => !r.active);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRental({
      carId: formData.carId,
      customer: {
        name: formData.customerName,
        document: formData.customerDoc,
        phone: formData.customerPhone
      },
      startDate: formData.startDate,
      endDate: formData.endDate,
      dailyRate: formData.dailyRate,
      totalValue: formData.totalValue,
      active: true
    });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Gestão de Locação</h2>
          <p className="text-slate-500 text-xs">Contratos ativos e histórico de aluguéis.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all"
        >
          Novo Contrato
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Locações Ativas</h3>
              <span className="bg-blue-600 text-white text-[9px] px-2 py-0.5 font-bold">{activeRentals.length} CONTRATOS</span>
            </div>
            <div className="divide-y divide-slate-100">
              {activeRentals.length === 0 ? (
                <p className="p-10 text-center text-slate-400 text-xs italic uppercase">Nenhum veículo locado no momento.</p>
              ) : (
                activeRentals.map(rental => {
                  const car = state.inventory.find(c => c.id === rental.carId);
                  return (
                    <div key={rental.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50 transition-colors">
                      <div className="flex gap-4">
                        <div className="bg-slate-100 p-3 text-slate-500 h-fit"><Key size={20}/></div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 uppercase">{car?.brand} {car?.model} <span className="text-slate-400 ml-2">[{car?.plate.toUpperCase()}]</span></p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                            <span className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-medium"><User size={12}/> {rental.customer.name}</span>
                            <span className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-medium"><Calendar size={12}/> Saída: {new Date(rental.startDate).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                        <div className="text-right">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Receita Prevista</p>
                          <p className="text-sm font-bold text-slate-900">{formatCurrency(rental.totalValue)}</p>
                        </div>
                        <button 
                          onClick={() => onFinishRental(rental.id)}
                          className="px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 text-[10px] font-bold uppercase transition-all"
                        >
                          Check-in / Devolver
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Histórico Recente</h3>
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
              {historyRentals.map(rental => {
                const car = state.inventory.find(c => c.id === rental.carId);
                return (
                  <div key={rental.id} className="p-3 flex justify-between items-center text-[11px]">
                    <span className="font-bold text-slate-600 uppercase">{car?.model} ({rental.customer.name})</span>
                    <span className="font-bold text-green-600">{formatCurrency(rental.totalValue)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#0f172a] text-white p-6 border border-slate-800">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Receita de Locação</p>
            <p className="text-2xl font-bold">{formatCurrency(state.rentals.reduce((acc, r) => acc + r.totalValue, 0))}</p>
            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Taxa Médias Diária</span>
              <span className="text-[10px] text-blue-400 font-bold">R$ {(state.rentals.length > 0 ? state.rentals.reduce((acc, r) => acc + r.dailyRate, 0) / state.rentals.length : 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg shadow-xl border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest text-center">Formalização de Aluguel</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600"><X size={18}/></button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Veículo Disponível</label>
                <select 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-500"
                  value={formData.carId}
                  onChange={e => setFormData({ ...formData, carId: e.target.value })}
                >
                  <option value="">SELECIONE UM CARRO...</option>
                  {availableCars.map(car => (
                    <option key={car.id} value={car.id}>{car.brand} {car.model} ({car.plate.toUpperCase()})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="col-span-2">
                  <p className="text-[9px] font-bold text-blue-600 uppercase border-b border-blue-100 mb-2">Dados do Locatário</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome Completo</label>
                  <input required className="w-full bg-slate-50 border border-slate-200 p-2 text-xs outline-none" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">CPF/CNPJ</label>
                  <input required className="w-full bg-slate-50 border border-slate-200 p-2 text-xs outline-none" value={formData.customerDoc} onChange={e => setFormData({ ...formData, customerDoc: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="col-span-2">
                  <p className="text-[9px] font-bold text-blue-600 uppercase border-b border-blue-100 mb-2">Datas e Valores</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Início</label>
                  <input type="date" required className="w-full bg-slate-50 border border-slate-200 p-2 text-xs outline-none" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Previsão Entrega</label>
                  <input type="date" required className="w-full bg-slate-50 border border-slate-200 p-2 text-xs outline-none" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Valor Diária (R$)</label>
                  <input type="number" required className="w-full bg-slate-50 border border-slate-200 p-2 text-xs outline-none" value={formData.dailyRate || ''} onChange={e => setFormData({ ...formData, dailyRate: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Valor Total Contrato (R$)</label>
                  <input type="number" required className="w-full bg-slate-50 border border-slate-200 p-2 text-xs outline-none font-bold text-blue-600" value={formData.totalValue || ''} onChange={e => setFormData({ ...formData, totalValue: parseFloat(e.target.value) })} />
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white text-[10px] font-bold py-3 uppercase tracking-widest transition-all mt-4">Emitir Contrato e Bloquear Veículo</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalManagement;
