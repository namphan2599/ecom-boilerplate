import { OrderStatus } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.service';
import { type CartView } from '../cart/cart.service';
import { CatalogService } from '../catalog/catalog.service';
import { DiscountsService } from '../discounts/discounts.service';
import { InventoryService } from '../inventory/inventory.service';
export interface StripeLikeEvent {
    id: string;
    type: string;
    data: {
        object: Record<string, unknown>;
    };
}
export interface CreateCheckoutSessionInput {
    customer: AuthenticatedUser;
    cart: CartView;
    couponCode?: string;
    successUrl?: string;
    cancelUrl?: string;
}
export interface CheckoutOrderView {
    orderNumber: string;
    checkoutToken: string;
    userId: string;
    customerEmail: string;
    customerName?: string;
    status: OrderStatus;
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
    items: CartView['items'];
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
export declare class PaymentsService {
    private readonly inventoryService;
    private readonly discountsService;
    private readonly catalogService?;
    private readonly logger;
    private readonly processedEventIds;
    private readonly fallbackOrders;
    private readonly sessionIndex;
    private orderSequence;
    constructor(inventoryService: InventoryService, discountsService: DiscountsService, catalogService?: CatalogService | undefined);
    createCheckoutSession(input: CreateCheckoutSessionInput): Promise<HostedCheckoutSessionView>;
    listOrdersForUser(userId: string): {
        items: CheckoutOrderView[];
        total: number;
    };
    listAllOrders(): {
        items: CheckoutOrderView[];
        total: number;
    };
    updateOrderStatus(orderNumber: string, status: OrderStatus): CheckoutOrderView;
    getOrderByCheckoutToken(checkoutToken: string): CheckoutOrderView;
    parseAndVerifyWebhook(input: {
        signature?: string;
        payload: unknown;
    }): StripeLikeEvent;
    handleWebhookEvent(event: StripeLikeEvent): Promise<CheckoutOrderView | void>;
    private handlePaymentSucceeded;
    private handlePaymentFailed;
    private ensureInventorySeeded;
    private findOrderFromPayload;
    private getCheckoutToken;
    private isStripeLikeEvent;
    private assertStatusTransition;
    private nextOrderNumber;
    private roundCurrency;
}
