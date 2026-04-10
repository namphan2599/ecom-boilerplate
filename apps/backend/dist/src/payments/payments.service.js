"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const node_crypto_1 = require("node:crypto");
const catalog_service_1 = require("../catalog/catalog.service");
const discounts_service_1 = require("../discounts/discounts.service");
const inventory_service_1 = require("../inventory/inventory.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    inventoryService;
    discountsService;
    catalogService;
    logger = new common_1.Logger(PaymentsService_1.name);
    processedEventIds = new Set();
    fallbackOrders = new Map();
    sessionIndex = new Map();
    orderSequence = 0;
    constructor(inventoryService, discountsService, catalogService) {
        this.inventoryService = inventoryService;
        this.discountsService = discountsService;
        this.catalogService = catalogService;
    }
    async createCheckoutSession(input) {
        if (input.cart.items.length === 0) {
            throw new common_1.BadRequestException('Cannot create a checkout session for an empty cart.');
        }
        const currencyCode = input.cart.summary.currencyCode.toUpperCase();
        const mixedCurrency = input.cart.items.some((item) => item.currencyCode.toUpperCase() !== currencyCode);
        if (mixedCurrency) {
            throw new common_1.BadRequestException('All checkout items must share the same currency.');
        }
        const couponApplication = input.couponCode
            ? await this.discountsService.validateAndApplyCoupon({
                code: input.couponCode,
                subtotal: input.cart.summary.subtotal,
                currencyCode,
            })
            : null;
        const checkoutToken = `chk_${(0, node_crypto_1.randomUUID)().replace(/-/g, '')}`;
        try {
            for (const item of input.cart.items) {
                await this.ensureInventorySeeded(item.sku, item.currencyCode);
                this.inventoryService.reserveStock({
                    checkoutToken,
                    sku: item.sku,
                    quantity: item.quantity,
                });
            }
            if (couponApplication) {
                await this.discountsService.markCouponUsed(couponApplication.coupon.code);
            }
        }
        catch (error) {
            try {
                this.inventoryService.releaseReservation(checkoutToken);
            }
            catch {
            }
            if (couponApplication) {
                await this.discountsService
                    .releaseCouponUsage(couponApplication.coupon.code)
                    .catch(() => undefined);
            }
            throw error;
        }
        const sessionId = `cs_test_${(0, node_crypto_1.randomUUID)().replace(/-/g, '').slice(0, 24)}`;
        const subtotal = this.roundCurrency(input.cart.summary.subtotal);
        const discountTotal = this.roundCurrency(couponApplication?.discountAmount ?? 0);
        const taxableSubtotal = this.roundCurrency(Math.max(subtotal - discountTotal, 0));
        const shippingTotal = this.roundCurrency(taxableSubtotal >= 100 ? 0 : 9.99);
        const taxTotal = this.roundCurrency(taxableSubtotal * 0.08);
        const grandTotal = this.roundCurrency(taxableSubtotal + shippingTotal + taxTotal);
        const timestamp = new Date().toISOString();
        const order = {
            orderNumber: this.nextOrderNumber(),
            checkoutToken,
            userId: input.customer.userId,
            customerEmail: input.customer.email,
            customerName: input.customer.displayName,
            status: client_1.OrderStatus.PENDING,
            paymentStatus: 'requires_payment',
            currencyCode,
            subtotal,
            discountTotal,
            taxTotal,
            shippingTotal,
            grandTotal,
            couponCode: couponApplication?.coupon.code,
            stripeCheckoutSessionId: sessionId,
            items: input.cart.items.map((item) => ({ ...item })),
            createdAt: timestamp,
            updatedAt: timestamp,
        };
        this.fallbackOrders.set(checkoutToken, order);
        this.sessionIndex.set(sessionId, checkoutToken);
        const successUrl = input.successUrl ??
            process.env.CHECKOUT_SUCCESS_URL ??
            'https://storefront.aura.local/checkout/success';
        const cancelUrl = input.cancelUrl ??
            process.env.CHECKOUT_CANCEL_URL ??
            'https://storefront.aura.local/checkout/cancel';
        return {
            provider: process.env.STRIPE_SECRET_KEY ? 'stripe' : 'mock-stripe',
            checkoutToken,
            sessionId,
            checkoutUrl: `https://checkout.stripe.com/c/pay/${sessionId}`,
            successUrl,
            cancelUrl,
            expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
            order,
        };
    }
    listOrdersForUser(userId) {
        const items = [...this.fallbackOrders.values()]
            .filter((order) => order.userId === userId)
            .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
        return {
            items,
            total: items.length,
        };
    }
    listAllOrders() {
        const items = [...this.fallbackOrders.values()].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
        return {
            items,
            total: items.length,
        };
    }
    updateOrderStatus(orderNumber, status) {
        const order = [...this.fallbackOrders.values()].find((candidate) => candidate.orderNumber === orderNumber);
        if (!order) {
            throw new common_1.NotFoundException(`Order with number \`${orderNumber}\` was not found.`);
        }
        if (order.status === status) {
            return order;
        }
        this.assertStatusTransition(order.status, status);
        order.status = status;
        order.updatedAt = new Date().toISOString();
        if (status === client_1.OrderStatus.PAID ||
            status === client_1.OrderStatus.SHIPPED ||
            status === client_1.OrderStatus.DELIVERED) {
            order.paymentStatus = 'paid';
        }
        if (status === client_1.OrderStatus.CANCELLED) {
            order.paymentStatus = 'failed';
        }
        if (status === client_1.OrderStatus.REFUNDED) {
            order.paymentStatus = 'failed';
        }
        return order;
    }
    getOrderByCheckoutToken(checkoutToken) {
        const order = this.fallbackOrders.get(checkoutToken);
        if (!order) {
            throw new common_1.NotFoundException(`No checkout order found for token \`${checkoutToken}\`.`);
        }
        return order;
    }
    parseAndVerifyWebhook(input) {
        if (!input.signature) {
            throw new common_1.BadRequestException('Missing Stripe signature header.');
        }
        if (!this.isStripeLikeEvent(input.payload)) {
            throw new common_1.BadRequestException('Invalid Stripe webhook payload.');
        }
        return input.payload;
    }
    async handleWebhookEvent(event) {
        if (this.processedEventIds.has(event.id)) {
            this.logger.warn(`Ignoring duplicate Stripe event ${event.id}.`);
            return;
        }
        this.processedEventIds.add(event.id);
        switch (event.type) {
            case 'payment_intent.succeeded':
            case 'checkout.session.completed':
                return this.handlePaymentSucceeded(event.data.object);
            case 'payment_intent.payment_failed':
            case 'checkout.session.expired':
                return this.handlePaymentFailed(event.data.object);
            case 'charge.refunded':
                this.logger.warn('Refund event received. Wire this into your returns workflow.');
                return;
            default:
                this.logger.debug(`Unhandled Stripe event type: ${event.type}`);
        }
    }
    async handlePaymentSucceeded(payload) {
        const order = this.findOrderFromPayload(payload);
        if (!order) {
            this.logger.warn('Payment success webhook received without a known checkout token.');
            return;
        }
        if (order.status !== client_1.OrderStatus.PAID) {
            this.inventoryService.confirmReservation(order.checkoutToken);
            order.status = client_1.OrderStatus.PAID;
            order.paymentStatus = 'paid';
            order.updatedAt = new Date().toISOString();
            if (typeof payload.id === 'string') {
                order.stripeCheckoutSessionId = payload.id;
            }
            if (typeof payload.payment_intent === 'string') {
                order.stripePaymentIntentId = payload.payment_intent;
            }
        }
        this.logger.log(`Payment succeeded for checkout token: ${order.checkoutToken}`);
        return order;
    }
    async handlePaymentFailed(payload) {
        const order = this.findOrderFromPayload(payload);
        if (!order) {
            this.logger.warn('Payment failure webhook received without a known checkout token.');
            return;
        }
        if (order.status !== client_1.OrderStatus.CANCELLED) {
            this.inventoryService.releaseReservation(order.checkoutToken);
            if (order.couponCode) {
                await this.discountsService.releaseCouponUsage(order.couponCode);
            }
            order.status = client_1.OrderStatus.CANCELLED;
            order.paymentStatus = 'failed';
            order.updatedAt = new Date().toISOString();
            if (typeof payload.id === 'string') {
                order.stripeCheckoutSessionId = payload.id;
            }
        }
        this.logger.warn(`Payment failed for checkout token: ${order.checkoutToken}`);
        return order;
    }
    async ensureInventorySeeded(sku, currencyCode) {
        try {
            this.inventoryService.getSnapshot(sku);
            return;
        }
        catch (error) {
            if (!(error instanceof common_1.NotFoundException)) {
                throw error;
            }
        }
        if (!this.catalogService) {
            throw new common_1.NotFoundException(`No inventory record found for SKU \`${sku}\`.`);
        }
        const variant = await this.catalogService.resolveVariantSnapshot(sku, currencyCode);
        this.inventoryService.seed([
            {
                sku: variant.sku,
                onHand: variant.inventoryOnHand,
                reserved: variant.inventoryReserved,
            },
        ]);
    }
    findOrderFromPayload(payload) {
        const checkoutToken = this.getCheckoutToken(payload);
        if (checkoutToken) {
            return this.fallbackOrders.get(checkoutToken);
        }
        const sessionId = typeof payload.id === 'string' ? payload.id : undefined;
        const tokenFromSession = sessionId
            ? this.sessionIndex.get(sessionId)
            : undefined;
        return tokenFromSession
            ? this.fallbackOrders.get(tokenFromSession)
            : undefined;
    }
    getCheckoutToken(payload) {
        const metadata = payload.metadata;
        if (!metadata || typeof metadata !== 'object') {
            return undefined;
        }
        const rawToken = metadata.checkoutToken;
        return typeof rawToken === 'string' && rawToken.length > 0
            ? rawToken
            : undefined;
    }
    isStripeLikeEvent(payload) {
        if (!payload || typeof payload !== 'object') {
            return false;
        }
        const candidate = payload;
        return !!candidate.id && !!candidate.type && !!candidate.data?.object;
    }
    assertStatusTransition(from, to) {
        const transitions = {
            [client_1.OrderStatus.PENDING]: [client_1.OrderStatus.PAID, client_1.OrderStatus.CANCELLED],
            [client_1.OrderStatus.PAID]: [
                client_1.OrderStatus.SHIPPED,
                client_1.OrderStatus.CANCELLED,
                client_1.OrderStatus.REFUNDED,
            ],
            [client_1.OrderStatus.SHIPPED]: [client_1.OrderStatus.DELIVERED, client_1.OrderStatus.REFUNDED],
            [client_1.OrderStatus.DELIVERED]: [client_1.OrderStatus.REFUNDED],
            [client_1.OrderStatus.CANCELLED]: [],
            [client_1.OrderStatus.REFUNDED]: [],
        };
        if (!transitions[from].includes(to)) {
            throw new common_1.BadRequestException(`Invalid order status transition from \`${from}\` to \`${to}\`.`);
        }
    }
    nextOrderNumber() {
        this.orderSequence += 1;
        return `AURA-${String(this.orderSequence).padStart(6, '0')}`;
    }
    roundCurrency(value) {
        return Number(value.toFixed(2));
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService,
        discounts_service_1.DiscountsService,
        catalog_service_1.CatalogService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map