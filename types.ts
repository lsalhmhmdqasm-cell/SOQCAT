export enum OrderStatus {
  PENDING = 'قيد الانتظار',
  PREPARING = 'جاري التجهيز',
  DELIVERING = 'جاري التوصيل',
  COMPLETED = 'مكتمل',
  CANCELLED = 'ملغي'
}

export interface User {
  id: string;
  name: string;
  phone: string;
  isAdmin: boolean;
  joinedAt?: string;
}

export interface Address {
  id: string;
  label: string; // e.g. "Home", "Office"
  details: string;
  lat?: number;
  lng?: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  isFavorite?: boolean; // UI state
}

export interface CartItem extends Product {
  quantity: number;
}

export interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  status: 'available' | 'busy';
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  date: string;
  deliveryAddress: string;
  location?: { lat: number; lng: number };
  deliveryPersonId?: string; // Assigned driver
  estimatedTime?: number; // minutes
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

export interface Slider {
  id: string;
  image: string;
  title: string;
}

export interface AppSettings {
  shopName: string;
  logo: string;
  deliveryFee: number;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  date: string;
  isRead: boolean;
  type: 'order' | 'promo' | 'system';
  relatedId?: string; // e.g., order ID
}