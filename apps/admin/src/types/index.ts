export type UserRole = 'ADMIN' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

// Product
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  isFeatured: boolean;
  categoryId: string | null;
  tags: Tag[];
  variants: ProductVariant[];
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  options: Record<string, string>;
  stock: number;
  reservedStock: number;
  prices: ProductVariantPrice[];
}

export interface ProductVariantPrice {
  currency: string;
  amount: number;
}

// Category
export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: Category[];
}

// Tag
export interface Tag {
  id: string;
  name: string;
}

// Coupon / Discount
export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  currency?: string;
  expiresAt: string | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
}

// Order
export interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';
  userId: string;
  customerName: string;
  customerEmail: string;
  currency: string;
  totalAmount: number;
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
}

export interface OrderItem {
  id: string;
  variantId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  price: number; // For consistency in some templates
  currency: string;
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
