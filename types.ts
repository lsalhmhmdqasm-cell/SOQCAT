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
  email?: string;
  role?: string;
  shop_id?: string | number;
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
  shop_id?: string | number;
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
  trackingNumber?: string;
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
  type: 'order' | 'promo' | 'system' | 'lead';
  relatedId?: string; // e.g., order ID
}

export interface PlatformLandingConfig {
  version: number;
  brand: {
    name: string;
    tagline_md?: string;
    tagline_lg?: string;
    footer_rights?: string;
    footer_by?: string;
  };
  hero: {
    title: string;
    highlight?: string;
    subtitle?: string;
    primary_cta?: string;
    secondary_cta?: string;
  };
  partners?: {
    title?: string;
    subtitle?: string;
    items?: string[];
  };
  preview?: {
    title?: string;
    subtitle?: string;
    cta?: string;
  };
  testimonials?: {
    title?: string;
    subtitle?: string;
    items?: Array<{ name: string; text: string }>;
  };
  security?: {
    title?: string;
    subtitle?: string;
    items?: Array<{ icon?: string; title: string; desc: string }>;
  };
  stats?: Array<{ icon?: string; value: string; label: string }>;
  how_it_works?: {
    title?: string;
    subtitle?: string;
    cta?: string;
    steps?: Array<{ title: string; desc: string }>;
  };
  features?: {
    title?: string;
    subtitle?: string;
    items?: Array<{ icon?: string; title: string; desc: string }>;
  };
  cta_strip?: {
    title?: string;
    subtitle?: string;
    primary_cta?: string;
    secondary_cta?: string;
  };
  pricing?: {
    title?: string;
    subtitle?: string;
    yearly_badge?: string;
    cycle_labels?: { monthly?: string; yearly?: string };
    plans?: Array<{
      key: string;
      name: string;
      monthly_price: string;
      yearly_price: string;
      monthly_suffix?: string;
      yearly_suffix?: string;
      features?: string[];
      cta?: string;
      highlight?: boolean;
      badge?: string | null;
    }>;
  };
  faq?: {
    title?: string;
    subtitle?: string;
    items?: Array<{ q: string; a: string }>;
  };
  contact?: {
    title?: string;
    subtitle?: string;
    labels?: { shop_name?: string; phone?: string; plan?: string };
    placeholders?: { shop_name?: string; phone?: string };
    submit?: { idle?: string; loading?: string };
  };
}
