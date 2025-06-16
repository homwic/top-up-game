export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  variants: ProductVariant[];
  code: string;
  image?: string;
  description: string;
  type: 'prepaid' | 'postpaid';
  status: 'active' | 'inactive';
  isPopular?: boolean;
  gameIdConfig?: GameIdConfig; // New field for game ID configuration
}

export interface ProductVariant {
  id: string;
  name: string;
  amount: string; // e.g., "5 Diamonds", "100 UC"
  price: number;
  originalPrice?: number;
  code: string;
  status: 'active' | 'inactive';
}

export interface GameIdConfig {
  requiresGameId: boolean;
  gameIdLabel: string; // e.g., "User ID", "Player ID", "Game ID"
  gameIdPlaceholder: string; // e.g., "Masukkan User ID", "12345678"
  requiresServerId: boolean;
  serverIdLabel?: string; // e.g., "Server ID", "Zone ID"
  serverIdPlaceholder?: string; // e.g., "Masukkan Server ID", "2001"
  gameIdFormat?: string; // e.g., "numeric", "alphanumeric"
  gameIdMinLength?: number;
  gameIdMaxLength?: number;
  serverIdFormat?: string; // e.g., "numeric", "alphanumeric"
  serverIdMinLength?: number;
  serverIdMaxLength?: number;
}

export interface ServerOption {
  id: string;
  name: string;
  code?: string;
}

export interface DigiflazzProduct {
  product_name: string;
  category: string;
  brand: string;
  type: string;
  seller_name: string;
  price: number;
  buyer_sku_code: string;
  buyer_product_status: boolean;
  seller_product_status: boolean;
  unlimited_stock: boolean;
  stock: number;
  multi: boolean;
  start_cut_off: string;
  end_cut_off: string;
  desc: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userPhone: string;
  gameId: string;
  serverId?: string; // New field for server ID
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
  referenceId?: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
}

export interface DigiflazzConfig {
  username: string;
  apiKey: string;
  isConfigured: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export type PaymentMethod = 'ovo' | 'dana' | 'gopay' | 'bank_transfer' | 'credit_card';
export type TransactionStatus = 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';
export type GameCategory = 'moba' | 'battle_royale' | 'rpg' | 'fps' | 'racing' | 'sports' | 'all';