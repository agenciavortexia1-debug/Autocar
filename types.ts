
export enum CarStatus {
  STOCK = 'No Patio',
  REPAIR = 'Em Reparo',
  SOLD = 'Vendido',
  RENTED = 'Locado'
}

export type VehicleType = 'Carro' | 'Moto';

export interface RepairItem {
  id: string;
  name: string;
  cost: number;
  completed: boolean;
}

export interface Car {
  id: string;
  type: VehicleType;
  brand: string;
  model: string;
  year: number;
  plate: string;
  purchasePrice: number;
  salePrice?: number;
  status: CarStatus;
  repairs: RepairItem[];
  purchaseDate: string;
  soldDate?: string;
  docStatus: 'OK' | 'PENDENTE';
  docDetails?: string;
}

export interface Customer {
  name: string;
  document: string;
  phone: string;
}

export interface Rental {
  id: string;
  carId: string;
  customer: Customer;
  startDate: string;
  endDate: string;
  dailyRate: number;
  totalValue: number;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  costPrice: number;
  salePrice: number;
}

export interface UsedPart {
  productId: string;
  name: string;
  quantity: number;
  costAtTime: number;
  saleAtTime: number;
}

export interface ServiceOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  vehicleInfo: string;
  description: string;
  serviceValue: number;
  usedParts: UsedPart[];
  date: string;
}

export interface OperationalExpense {
  id: string;
  name: string;
  amount: number;
  category: 'Aluguel' | 'Energia' | 'Água' | 'Funcionários' | 'Marketing' | 'Outros';
  date: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  category: 'Patio' | 'Financeiro' | 'Locação' | 'Oficina' | 'Produtos';
  description: string;
  type: 'ADD' | 'UPDATE' | 'DELETE' | 'FINISH';
}

export interface AppState {
  inventory: Car[];
  expenses: OperationalExpense[];
  rentals: Rental[];
  products: Product[];
  serviceOrders: ServiceOrder[];
  history: HistoryEntry[];
}
