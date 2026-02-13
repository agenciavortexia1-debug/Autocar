
import React, { useState, useMemo } from 'react';
import { AppState, Product, ServiceOrder, UsedPart } from '../types';
import { Wrench, Package, Plus, Trash2, ArrowRightLeft, AlertTriangle, Search, X, User, Car } from 'lucide-react';

interface Props {
  state: AppState;
  onAddProduct: (p: Omit<Product, 'id'>) => void;
  onUpdateStock: (id: string, qty: number) => void;
  onAddService: (so: Omit<ServiceOrder, 'id' | 'date'>) => void;
}

const WorkshopAndStore: React.FC<Props> = ({ state, onAddProduct, onUpdateStock, onAddService }) => {
  const [activeTab, setActiveTab] = useState<'services' | 'inventory'>('services');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);

  const [productForm, setProductForm] = useState({ name: '', quantity: 0, minQuantity: 1, costPrice: 0, salePrice: 0 });
  
  // Form de O.S.
  const [serviceForm, setServiceForm] = useState({
    customerName: '',
    customerPhone: '',
    vehicleInfo: '',
    description: '',
    serviceValue: 0,
    usedParts: [] as UsedPart[]
  });

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const totalPartsValue = useMemo(() => {
    return serviceForm.usedParts.reduce((acc, p) => acc + (p.saleAtTime * p.quantity), 0);
  }, [serviceForm.usedParts]);

  const addPartToSO = (productId: string) => {
    const product = state.products.find(p => p.id === productId);
    if (!product || product.quantity <= 0) return;

    const existing = serviceForm.usedParts.find(p => p.productId === productId);
    if (existing) {
       if (existing.quantity >= product.quantity) return; // Limite do estoque
       setServiceForm({
         ...serviceForm,
         usedParts: serviceForm.usedParts.map(p => p.productId === productId ? { ...p, quantity: p.quantity + 1 } : p)
       });
    } else {
      setServiceForm({
        ...serviceForm,
        usedParts: [...serviceForm.usedParts, {
          productId: product.id,
          name: product.name,
          quantity: 1,
          costAtTime: product.costPrice,
          saleAtTime: product.salePrice
        }]
      });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Centro de Serviços & Oficina</h2>
          <p className="text-slate-500 text-xs">Clientes externos, venda de peças e serviços técnicos.</p>
        </div>
      </header>

      <div className="flex border-b border-slate-200">
        <button onClick={() => setActiveTab('services')} className={`px-6 py-3 font-bold text-[10px] uppercase tracking-widest ${activeTab === 'services' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>Ordens de Serviço (Externo)</button>
        <button onClick={() => setActiveTab('inventory')} className={`px-6 py-3 font-bold text-[10px] uppercase tracking-widest ${activeTab === 'inventory' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>Insumos & Peças</button>
      </div>

      {activeTab === 'services' ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => setShowServiceModal(true)} className="bg-slate-900 text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest">Abrir Nova O.S.</button>
          </div>
          <div className="bg-white border border-slate-200 overflow-hidden">
            <table className="w-full text-[11px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-widest">Cliente / Veículo</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-widest">Serviço</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-widest">Peças</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-widest">Lucro Real O.S.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.serviceOrders.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400 italic">Nenhuma O.S. registrada.</td></tr>
                ) : (
                  state.serviceOrders.map(so => {
                    const partsSale = so.usedParts.reduce((acc, p) => acc + (p.saleAtTime * p.quantity), 0);
                    const partsCost = so.usedParts.reduce((acc, p) => acc + (p.costAtTime * p.quantity), 0);
                    const profit = so.serviceValue + (partsSale - partsCost);
                    return (
                      <tr key={so.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900 uppercase">{so.customerName}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">{so.vehicleInfo}</p>
                        </td>
                        <td className="px-4 py-3">{so.description}</td>
                        <td className="px-4 py-3 font-medium text-slate-500">{formatCurrency(partsSale)}</td>
                        <td className="px-4 py-3 font-black text-green-600">{formatCurrency(profit)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => setShowProductModal(true)} className="bg-slate-900 text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest">Novo Item</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {state.products.map(p => (
              <div key={p.id} className={`bg-white border p-4 flex flex-col gap-2 ${p.quantity <= p.minQuantity ? 'border-red-200 bg-red-50/20' : 'border-slate-200'}`}>
                <div className="flex justify-between items-start">
                  <h4 className="text-[11px] font-bold text-slate-900 uppercase">{p.name}</h4>
                  {p.quantity <= p.minQuantity && <AlertTriangle size={14} className="text-red-600" />}
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400 font-bold">PATIO</span>
                  <span className={`font-black ${p.quantity <= p.minQuantity ? 'text-red-600' : 'text-slate-900'}`}>{p.quantity} UN</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400 font-bold">CUSTO</span>
                  <span className="font-bold">{formatCurrency(p.costPrice)}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400 font-bold">VENDA</span>
                  <span className="font-bold text-blue-600">{formatCurrency(p.salePrice)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DE ORDEM DE SERVIÇO */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl shadow-2xl border border-slate-200 h-[85vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Lançar Ordem de Serviço Externa</h3>
              <button onClick={() => setShowServiceModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
            </div>
            
            <form className="flex-1 overflow-y-auto p-6 space-y-6" onSubmit={(e) => {
              e.preventDefault();
              onAddService(serviceForm);
              setShowServiceModal(false);
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome do Cliente</label>
                  <input required className="w-full bg-slate-50 border border-slate-200 p-2 text-xs outline-none" placeholder="João da Silva" value={serviceForm.customerName} onChange={e => setServiceForm({...serviceForm, customerName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Veículo (Modelo/Placa)</label>
                  <input required className="w-full bg-slate-50 border border-slate-200 p-2 text-xs outline-none" placeholder="Fiesta ABC-1234" value={serviceForm.vehicleInfo} onChange={e => setServiceForm({...serviceForm, vehicleInfo: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Resumo do Serviço</label>
                <input required className="w-full bg-slate-50 border border-slate-200 p-2 text-xs outline-none" placeholder="Ex: Manutenção Preventiva" value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} />
              </div>

              <div className="bg-slate-50 p-4 border border-slate-200 rounded-sm">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-3">Adicionar Peças do Patio</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  {state.products.map(p => (
                    <button key={p.id} type="button" onClick={() => addPartToSO(p.id)} disabled={p.quantity <= 0} className="flex justify-between items-center bg-white p-2 border border-slate-200 text-left hover:border-blue-500 disabled:opacity-50 group">
                      <div>
                        <p className="text-[10px] font-bold text-slate-900 uppercase">{p.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold">{p.quantity} DISPONÍVEIS</p>
                      </div>
                      <Plus size={14} className="text-slate-300 group-hover:text-blue-500" />
                    </button>
                  ))}
                </div>

                <div className="space-y-2 border-t border-slate-200 pt-3">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Itens Selecionados</p>
                  {serviceForm.usedParts.map(up => (
                    <div key={up.productId} className="flex justify-between items-center text-[10px] font-bold p-2 bg-white border border-slate-100">
                      <span className="text-slate-700">{up.quantity}x {up.name.toUpperCase()}</span>
                      <div className="flex gap-4 items-center">
                        <span className="text-blue-600">{formatCurrency(up.saleAtTime * up.quantity)}</span>
                        <button type="button" onClick={() => setServiceForm({
                          ...serviceForm,
                          usedParts: serviceForm.usedParts.filter(p => p.productId !== up.productId)
                        })} className="text-red-400 hover:text-red-600"><Trash2 size={12}/></button>
                      </div>
                    </div>
                  ))}
                  {serviceForm.usedParts.length === 0 && <p className="text-[10px] text-slate-400 italic">Nenhuma peça adicionada.</p>}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mão de Obra (R$)</label>
                <input type="number" required className="w-full bg-slate-50 border border-slate-200 p-3 text-lg font-bold outline-none text-slate-900" value={serviceForm.serviceValue || ''} onChange={e => setServiceForm({...serviceForm, serviceValue: parseFloat(e.target.value)})} />
              </div>

              <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Total O.S. (Cliente)</p>
                  <p className="text-xl font-bold">{formatCurrency(serviceForm.serviceValue + totalPartsValue)}</p>
                </div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 text-[10px] uppercase tracking-widest transition-all">Fechar O.S. & Debitar Patio</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE PRODUTO */}
      {showProductModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md shadow-xl border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Cadastrar Insumo</h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400"><X size={18}/></button>
            </div>
            <form className="p-6 space-y-4" onSubmit={(e) => {
              e.preventDefault();
              onAddProduct(productForm);
              setShowProductModal(false);
            }}>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Descrição do Produto</label>
                <input required className="w-full bg-slate-50 border border-slate-200 p-2 text-xs outline-none" placeholder="Ex: Óleo 5W30" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Qtd Inicial</label>
                  <input type="number" required className="w-full bg-slate-50 border border-slate-200 p-2 text-xs outline-none" value={productForm.quantity || ''} onChange={e => setProductForm({...productForm, quantity: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Qtd Mínima</label>
                  <input type="number" required className="w-full bg-slate-50 border border-slate-200 p-2 text-xs outline-none" value={productForm.minQuantity || ''} onChange={e => setProductForm({...productForm, minQuantity: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Preço Custo (R$)</label>
                  <input type="number" required className="w-full bg-slate-50 border border-slate-200 p-2 text-xs outline-none" value={productForm.costPrice || ''} onChange={e => setProductForm({...productForm, costPrice: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Preço Venda (R$)</label>
                  <input type="number" required className="w-full bg-slate-50 border border-slate-200 p-2 text-xs outline-none" value={productForm.salePrice || ''} onChange={e => setProductForm({...productForm, salePrice: parseFloat(e.target.value)})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 text-[10px] uppercase tracking-widest mt-4">Salvar no Patio</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopAndStore;
