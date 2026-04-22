export type UserRole = 'employee' | 'admin' | 'representative';

export interface UserProfile {
  id: string;
  phone?: string;
  username: string; // Real name, unique, non-editable
  realName: string;
  nickname?: string;
  role: UserRole;
  companyId?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  address: string;
  workingTime?: string;
  contactMethod?: string;
  representativeId?: string;
}

export interface Dish {
  id: string;
  name: string;
  type: 'main' | 'addon';
  basePrice: number;
  description?: string;
  imageUrl?: string;
}

export interface Combo {
  id: string;
  name: string;
  dishIds: string[];
  price: number;
  description?: string;
  imageUrl?: string;
}

export interface DailyMenu {
  id: string; // YYYY-MM-DD
  date: string;
  dishIds: string[];
  comboIds: string[];
  priceOverrides?: Record<string, number>;
  status: 'draft' | 'published';
}

export type OrderStatus = 'pending_payment' | 'payment_submitted' | 'confirmed' | 'rejected';

export interface OrderItem {
  id: string;
  name: string;
  type: 'dish' | 'combo';
  price: number;
  quantity: number;
  note?: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  companyId: string;
  companyName: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  shipFee: number;
  paymentImageUrl?: string;
  note?: string;
  createdAt: any;
}

export interface LateOrderRequest {
  id: string;
  userId: string;
  date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}
