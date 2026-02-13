
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, CarFront, Landmark, ChevronLeft, ChevronRight, Key, Wrench, Package, History } from 'lucide-react';
import { Car, CarStatus, AppState, OperationalExpense, Rental, Product, ServiceOrder, VehicleType, HistoryEntry } from './types.ts';
import { DEFAULT_REPAIR_CHECKLIST } from './constants.ts';
import Dashboard from './components/Dashboard.tsx';
import Inventory from './components/Inventory.tsx';
import OperationalCosts from './components/OperationalCosts.tsx';
import RentalManagement from './components/RentalManagement.tsx';
import WorkshopAndStore from './components/WorkshopAndStore.tsx';
import HistoryLog from './components/HistoryLog.tsx';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'expenses' | 'rentals' | 'workshop' | 'history'>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('autocarchapada_state_v2');
    return saved ? JSON.parse(saved) : { 
      inventory: [], 
      expenses: [], 
      rentals: [], 
      products: [], 
      serviceOrders: [],
      history: []
    };
  });

  useEffect(() => {
    localStorage.setItem('autocarchapada_state_v2', JSON.stringify(state));
  }, [state]);

  const addLog = (category: HistoryEntry['category'], description: string, type: HistoryEntry['type'] = 'ADD') => {
    const newLog: HistoryEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      category,
      description,
      type
    };
    setState(prev => ({ ...prev, history: [newLog, ...prev.history].slice(0, 500) })); 
  };

  const addCar = (newCar: Omit<Car, 'id' | 'repairs' | 'status' | 'purchaseDate'>) => {
    const car: Car = {
      ...newCar,
      id: crypto.randomUUID(),
      purchaseDate: new Date().toISOString().split('T')[0],
      status: CarStatus.STOCK,
      repairs: DEFAULT_REPAIR_CHECKLIST.map(name => ({
        id: crypto.randomUUID(),
        name,
        cost: 0,
        completed: false
      }))
    };
    setState(prev => ({ ...prev, inventory: [car, ...prev.inventory] }));
    addLog('Patio', `Novo veículo registrado: ${car.brand} ${car.model} (${car.plate.toUpperCase()})`);
  };

  const updateCar = (updatedCar: Car) => {
    const oldCar = state.inventory.find(c => c.id === updatedCar.id);
    setState(prev => ({
      ...prev,
      inventory: prev.inventory.map(c => c.id === updatedCar.id ? updatedCar : c)
    }));
    if (oldCar?.status !== updatedCar.status) {
      addLog('Patio', `Status do veículo ${updatedCar.plate} alterado para ${updatedCar.status}`, 'UPDATE');
    }
  };

  const addExpense = (expense: Omit<OperationalExpense, 'id' | 'date'>) => {
    const newExpense: OperationalExpense = {
      ...expense,
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0]
    };
    setState(prev => ({ ...prev, expenses: [newExpense, ...prev.expenses] }));
    addLog('Financeiro', `Nova despesa fixada: ${expense.name} - R$ ${expense.amount}`);
  };

  const deleteExpense = (id: string) => {
    const expense = state.expenses.find(e => e.id === id);
    setState(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) }));
    if (expense) addLog('Financeiro', `Despesa removida: ${expense.name}`, 'DELETE');
  };

  const addRental = (rental: Omit<Rental, 'id'>) => {
    const newRental: Rental = { ...rental, id: crypto.randomUUID() };
    const car = state.inventory.find(c => c.id === rental.carId);
    setState(prev => ({
      ...prev,
      rentals: [newRental, ...prev.rentals],
      inventory: prev.inventory.map(c => c.id === rental.carId ? { ...c, status: CarStatus.RENTED } : c)
    }));
    addLog('Locação', `Início de contrato: ${car?.model} - Cliente: ${rental.customer.name}`);
  };

  const finishRental = (rentalId: string) => {
    const rental = state.rentals.find(r => r.id === rentalId);
    if (!rental) return;
    const car = state.inventory.find(c => c.id === rental.carId);
    setState(prev => ({
      ...prev,
      rentals: prev.rentals.map(r => r.id === rentalId ? { ...r, active: false } : r),
      inventory: prev.inventory.map(c => c.id === rental.carId ? { ...c, status: CarStatus.STOCK } : c)
    }));
    addLog('Locação', `Devolução processada: ${car?.model} - Cliente: ${rental.customer.name}`, 'FINISH');
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: crypto.randomUUID() };
    setState(prev => ({ ...prev, products: [...prev.products, newProduct] }));
    addLog('Produtos', `Novo item no estoque de peças: ${product.name} (${product.quantity} un)`);
  };

  const updateProductStock = (id: string, newQty: number) => {
    const product = state.products.find(p => p.id === id);
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, quantity: newQty } : p)
    }));
    addLog('Produtos', `Ajuste de estoque: ${product?.name} alterado para ${newQty} un`, 'UPDATE');
  };

  const addServiceOrder = (so: Omit<ServiceOrder, 'id' | 'date'>) => {
    const newSO: ServiceOrder = {
      ...so,
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0]
    };
    const updatedProducts = state.products.map(p => {
      const usedInSO = so.usedParts.find(up => up.productId === p.id);
      if (usedInSO) return { ...p, quantity: p.quantity - usedInSO.quantity };
      return p;
    });
    setState(prev => ({ 
      ...prev, 
      serviceOrders: [newSO, ...prev.serviceOrders],
      products: updatedProducts
    }));
    addLog('Oficina', `O.S. finalizada: ${so.customerName} - Veículo: ${so.vehicleInfo}`);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f1f5f9]">
      <nav className={`${isSidebarCollapsed ? 'md:w-16' : 'md:w-60'} w-full bg-[#0b1426] text-slate-400 flex flex-col sticky top-0 md:h-screen z-10 transition-all duration-200 border-r border-slate-800`}>
        <div className={`p-4 h-16 border-b border-slate-800 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isSidebarCollapsed && (
            <h1 className="text-xs font-black tracking-tighter text-white uppercase italic">
              AUTO CAR <span className="text-slate-400">CHAPADA</span>
            </h1>
          )}
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-1 hover:bg-slate-800 rounded text-slate-400 transition-colors">
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        
        <div className="flex-1 p-2 space-y-1 mt-4">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18} />} label="Dashboard" collapsed={isSidebarCollapsed} />
          <NavItem active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<CarFront size={18} />} label="Patio" collapsed={isSidebarCollapsed} />
          <NavItem active={activeTab === 'rentals'} onClick={() => setActiveTab('rentals')} icon={<Key size={18} />} label="Locação" collapsed={isSidebarCollapsed} />
          <NavItem active={activeTab === 'workshop'} onClick={() => setActiveTab('workshop')} icon={<Wrench size={18} />} label="Oficina & Peças" collapsed={isSidebarCollapsed} />
          <NavItem active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={<Landmark size={18} />} label="Custos Fixos" collapsed={isSidebarCollapsed} />
          <NavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={18} />} label="Histórico" collapsed={isSidebarCollapsed} />
        </div>

        <div className="p-4 border-t border-slate-800">
          {!isSidebarCollapsed && <p className="text-[10px] text-slate-500 font-bold uppercase text-center tracking-widest">Painel Administrativo</p>}
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        {activeTab === 'dashboard' && <Dashboard state={state} />}
        {activeTab === 'inventory' && <Inventory inventory={state.inventory} onAddCar={addCar} onUpdateCar={updateCar} />}
        {activeTab === 'rentals' && <RentalManagement state={state} onAddRental={addRental} onFinishRental={finishRental} />}
        {activeTab === 'workshop' && <WorkshopAndStore state={state} onAddProduct={addProduct} onUpdateStock={updateProductStock} onAddService={addServiceOrder} />}
        {activeTab === 'expenses' && <OperationalCosts expenses={state.expenses} onAddExpense={addExpense} onDeleteExpense={deleteExpense} />}
        {activeTab === 'history' && <HistoryLog history={state.history} />}
      </main>
    </div>
  );
};

interface NavItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ active, onClick, icon, label, collapsed }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all ${active ? 'bg-[#1e293b] text-white border-l-2 border-slate-300' : 'text-slate-400 hover:bg-[#111c30] hover:text-slate-200'} ${collapsed ? 'justify-center' : 'justify-start'}`}>
    <div className="shrink-0">{icon}</div>
    {!collapsed && <span className="text-[10px] uppercase font-bold tracking-widest">{label}</span>}
  </button>
);

export default App;
