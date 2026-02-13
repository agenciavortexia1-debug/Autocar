
import React, { useState, useMemo } from 'react';
import { Car, CarStatus, VehicleType } from '../types';
import { Search, X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  inventory: Car[];
  onAddCar: (car: Omit<Car, 'id' | 'repairs' | 'status' | 'purchaseDate'>) => void;
  onUpdateCar: (car: Car) => void;
}

const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const Inventory: React.FC<Props> = ({ inventory, onAddCar, onUpdateCar }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);

  const filteredInventory = useMemo(() => {
    return inventory.filter(c => 
      `${c.brand} ${c.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.plate.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory, searchTerm]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-300 pb-4">
        <div>
          <h2 className="text-xl font-black text-[#0b1426] uppercase italic tracking-tighter">Patio de Ativos</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Gestão de Carros e Motos</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-[#0b1426] hover:bg-[#111c30] text-white px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all border border-slate-700 shadow-lg">Novo Veículo</button>
      </header>

      <div className="flex gap-2 items-center bg-[#e5e7eb] p-2 border border-slate-300">
        <Search className="text-slate-500 ml-2" size={16} />
        <input type="text" placeholder="MODELO, MARCA OU PLACA..." className="flex-1 bg-transparent border-none focus:ring-0 text-[10px] font-bold text-slate-700 uppercase" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredInventory.map(car => (
          <div key={car.id} className="bg-[#e5e7eb] border border-slate-300 hover:border-slate-500 transition-all flex flex-col group relative">
            {car.docStatus === 'PENDENTE' && (
              <div className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-md z-10" title="Pendência Documental">
                <AlertCircle size={14} />
              </div>
            )}
            
            <div className="p-4 border-b border-slate-300 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[8px] font-black bg-[#0b1426] text-white px-1.5 py-0.5 uppercase tracking-tighter">{car.type}</span>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{car.brand}</p>
                </div>
                <h3 className="text-sm font-black text-[#0b1426] uppercase italic">{car.model}</h3>
              </div>
              <span className={`text-[8px] font-bold px-1.5 py-0.5 border ${
                car.status === CarStatus.STOCK ? 'border-blue-300 text-blue-700' :
                car.status === CarStatus.REPAIR ? 'border-amber-300 text-amber-700' :
                'border-green-300 text-green-700'
              }`}>
                {car.status.toUpperCase()}
              </span>
            </div>
            
            <div className="p-4 flex-1 space-y-2">
              <div className="flex justify-between text-[10px] border-b border-slate-200 pb-1">
                <span className="text-slate-500 font-bold uppercase">Placa</span>
                <span className="font-bold text-[#0b1426]">{car.plate.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-[10px] border-b border-slate-200 pb-1">
                <span className="text-slate-500 font-bold uppercase">Investimento</span>
                <span className="font-bold text-[#0b1426]">{formatCurrency(car.purchasePrice)}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500 font-bold uppercase">Documentos</span>
                <span className={`font-black ${car.docStatus === 'OK' ? 'text-green-600' : 'text-red-600'}`}>
                  {car.docStatus}
                </span>
              </div>
            </div>

            <button onClick={() => setSelectedCarId(car.id)} className="w-full py-3 bg-slate-200 hover:bg-[#0b1426] hover:text-white text-slate-600 text-[10px] font-bold uppercase tracking-widest transition-all border-t border-slate-300">Visualizar Detalhes</button>
          </div>
        ))}
      </div>

      {showAddModal && <AddCarModal onClose={() => setShowAddModal(false)} onAdd={onAddCar} />}
    </div>
  );
};

const AddCarModal: React.FC<{ onClose: () => void, onAdd: (car: any) => void }> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({ 
    type: 'Carro' as VehicleType, 
    brand: '', 
    model: '', 
    year: new Date().getFullYear(), 
    plate: '', 
    purchasePrice: 0,
    docStatus: 'OK' as 'OK' | 'PENDENTE',
    docDetails: ''
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#f1f5f9] w-full max-w-xl shadow-2xl border border-slate-300 overflow-y-auto max-h-[95vh]">
        <div className="p-4 border-b border-slate-300 flex justify-between items-center bg-[#e5e7eb] sticky top-0 z-20">
          <h3 className="text-[10px] font-bold text-[#0b1426] uppercase tracking-widest">Novo Registro de Veículo</h3>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-[#0b1426]"><X size={18}/></button>
        </div>
        <form className="p-6 space-y-5" onSubmit={(e) => { e.preventDefault(); onAdd(formData); onClose(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dados Básicos */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tipo de Veículo</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setFormData({...formData, type: 'Carro'})} className={`py-2 text-[10px] font-bold uppercase border ${formData.type === 'Carro' ? 'bg-[#0b1426] text-white border-[#0b1426]' : 'bg-white text-slate-500 border-slate-200'}`}>Carro</button>
                  <button type="button" onClick={() => setFormData({...formData, type: 'Moto'})} className={`py-2 text-[10px] font-bold uppercase border ${formData.type === 'Moto' ? 'bg-[#0b1426] text-white border-[#0b1426]' : 'bg-white text-slate-500 border-slate-200'}`}>Moto</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Marca</label>
                  <input required className="w-full bg-white border border-slate-300 p-2.5 text-xs outline-none focus:border-[#0b1426]" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Modelo</label>
                  <input required className="w-full bg-white border border-slate-300 p-2.5 text-xs outline-none focus:border-[#0b1426]" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ano</label>
                  <input required type="number" className="w-full bg-white border border-slate-300 p-2.5 text-xs outline-none focus:border-[#0b1426]" value={formData.year} onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Placa</label>
                  <input required className="w-full bg-white border border-slate-300 p-2.5 text-xs outline-none uppercase focus:border-[#0b1426]" value={formData.plate} onChange={e => setFormData({ ...formData, plate: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Preço de Compra (R$)</label>
                <input required type="number" className="w-full bg-white border border-slate-300 p-2.5 text-xs outline-none focus:border-[#0b1426]" value={formData.purchasePrice || ''} onChange={e => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })} />
              </div>
            </div>

            {/* Documentação */}
            <div className="space-y-4">
              <div className="bg-slate-200 p-4 border border-slate-300 rounded-sm">
                <label className="block text-[10px] font-bold text-[#0b1426] uppercase mb-3 flex items-center gap-2">
                   <CheckCircle2 size={14} /> Situação Documental
                </label>
                <div className="flex flex-col gap-2">
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, docStatus: 'OK'})} 
                    className={`py-3 px-4 text-[10px] font-bold uppercase border flex items-center justify-between ${formData.docStatus === 'OK' ? 'bg-green-700 text-white border-green-800' : 'bg-white text-slate-500 border-slate-300'}`}
                  >
                    Documentação OK
                    {formData.docStatus === 'OK' && <CheckCircle2 size={14} />}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, docStatus: 'PENDENTE'})} 
                    className={`py-3 px-4 text-[10px] font-bold uppercase border flex items-center justify-between ${formData.docStatus === 'PENDENTE' ? 'bg-red-700 text-white border-red-800' : 'bg-white text-slate-500 border-slate-300'}`}
                  >
                    Pendência Detectada
                    {formData.docStatus === 'PENDENTE' && <AlertCircle size={14} />}
                  </button>
                </div>

                {formData.docStatus === 'PENDENTE' && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="block text-[9px] font-bold text-red-900 uppercase mb-1">Detalhes da Pendência</label>
                    <textarea 
                      required
                      placeholder="Ex: Multas (R$ 450,00), Licenciamento 2024 atrasado, Necessita 2ª via do CRV (Recibo), Gravame ativo..."
                      className="w-full bg-white border border-red-200 p-3 text-xs outline-none focus:border-red-600 h-32 resize-none leading-relaxed italic"
                      value={formData.docDetails}
                      onChange={e => setFormData({ ...formData, docDetails: e.target.value })}
                    />
                    <p className="text-[8px] text-slate-500 mt-1 uppercase font-medium">Descreva multas, IPVA, restrições ou documentos faltantes.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-[#0b1426] hover:bg-[#111c30] text-white font-black py-4 text-[11px] uppercase tracking-[0.2em] transition-all mt-2 shadow-xl italic border border-slate-700">
            Finalizar Cadastro no Patio
          </button>
        </form>
      </div>
    </div>
  );
};

export default Inventory;
