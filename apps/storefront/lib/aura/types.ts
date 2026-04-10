export type AppRole = 'ADMIN' | 'CUSTOMER';
export type AuthProvider = 'local' | 'google';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: AppRole;
  displayName?: string;
  provider: AuthProvider;
}

export interface AuthTokenResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: AuthenticatedUser;
}

export interface CatalogCategoryView {
  id: string;
  name: string;
  slug: string;
}

export interface CatalogTagView {
  id: string;
  name: string;
  slug: string;
}

export interface CatalogPriceView {
  currencyCode: string;
  amount: number;
  compareAtAmount?: number | null;
}

export interface CatalogVariantView {
  id: string;
  sku: string;
  title: string;
  attributes: Record<string, string>;
  inventoryOnHand: number;
  inventoryReserved: number;
  isActive: boolean;
  prices: CatalogPriceView[];
}

export interface CatalogProductView {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  status: string;
  imageUrl?: string | null;
  imageKey?: string | null;
  isFeatured: boolean;
  category: CatalogCategoryView | null;
  tags: CatalogTagView[];
  variants: CatalogVariantView[];
}

export interface CatalogListResponse {
  items: CatalogProductView[];
  total: number;
}

export interface CartItemView {
  productId: string;
  variantId: string;
  sku: string;
  productName: string;
  variantName: string;
  attributes: Record<string, string>;
  currencyCode: string;
  unitPrice: number;
  compareAtAmount?: number | null;
  quantity: number;
  lineTotal: number;
  addedAt: string;
  updatedAt: string;
}

export interface CartView {
  userId: string;
  items: CartItemView[];
  summary: {
    currencyCode: string;
    itemCount: number;
    distinctItems: number;
    subtotal: number;
  };
  persistence: 'redis' | 'memory';
  updatedAt: string;
}

export interface CheckoutOrderView {
  orderNumber: string;
  checkoutToken: string;
  userId: string;
  customerEmail: string;
  customerName?: string;
  status: string;
  paymentStatus: 'requires_payment' | 'paid' | 'failed';
  currencyCode: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  grandTotal: number;
  couponCode?: string;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId?: string;
  items: CartItemView[];
  createdAt: string;
  updatedAt: string;
}

export interface HostedCheckoutSessionView {
  provider: 'stripe' | 'mock-stripe';
  checkoutToken: string;
  sessionId: string;
  checkoutUrl: string;
  successUrl: string;
  cancelUrl: string;
  expiresAt: string;
  order: CheckoutOrderView;
}

export interface OrderListResponse {
  items: CheckoutOrderView[];
  total: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ProductCardModel {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl?: string | null;
  categoryLabel: string;
  tagLabels: string[];
  priceAmount: number;
  priceCurrencyCode: string;
  compareAtAmount?: number | null;
  variantCount: number;
  featured: boolean;
}

export interface StorefrontSession {
  token: string;
  user: AuthenticatedUser;
}
