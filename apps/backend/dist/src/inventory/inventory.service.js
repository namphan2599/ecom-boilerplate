"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var InventoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
let InventoryService = InventoryService_1 = class InventoryService {
    logger = new common_1.Logger(InventoryService_1.name);
    inventory = new Map();
    reservations = new Map();
    seed(records) {
        for (const record of records) {
            this.inventory.set(record.sku, {
                sku: record.sku,
                onHand: record.onHand,
                reserved: record.reserved ?? 0,
                safetyStock: record.safetyStock ?? 0,
                updatedAt: new Date(),
            });
        }
    }
    getSnapshot(sku) {
        const snapshot = this.inventory.get(sku);
        if (!snapshot) {
            throw new common_1.NotFoundException(`No inventory record found for SKU \`${sku}\`.`);
        }
        return snapshot;
    }
    listReservationsForCheckout(checkoutToken) {
        const reservations = [...this.reservations.values()]
            .filter((reservation) => reservation.checkoutToken === checkoutToken)
            .sort((left, right) => left.sku.localeCompare(right.sku));
        if (reservations.length === 0) {
            throw new common_1.NotFoundException(`No inventory reservation found for checkout \`${checkoutToken}\`.`);
        }
        return reservations;
    }
    assertAvailable(sku, quantity) {
        this.assertPositiveQuantity(quantity);
        const snapshot = this.getSnapshot(sku);
        const sellable = this.getSellableQuantity(snapshot);
        if (quantity > sellable) {
            throw new common_1.ConflictException(`Requested quantity (${quantity}) exceeds sellable stock (${sellable}) for SKU \`${sku}\`.`);
        }
        return snapshot;
    }
    reserveStock(input) {
        this.assertPositiveQuantity(input.quantity);
        const reservationKey = this.getReservationKey(input.checkoutToken, input.sku);
        const existingReservation = this.reservations.get(reservationKey);
        if (existingReservation && existingReservation.status !== 'RELEASED') {
            if (existingReservation.quantity !== input.quantity) {
                throw new common_1.ConflictException(`Checkout \`${input.checkoutToken}\` already has a reservation for SKU \`${input.sku}\`.`);
            }
            return existingReservation;
        }
        this.assertAvailable(input.sku, input.quantity);
        const snapshot = this.getSnapshot(input.sku);
        snapshot.reserved += input.quantity;
        snapshot.updatedAt = new Date();
        const reservation = {
            checkoutToken: input.checkoutToken,
            sku: input.sku,
            quantity: input.quantity,
            status: 'ACTIVE',
            expiresAt: new Date(Date.now() + (input.ttlMinutes ?? 15) * 60_000),
        };
        this.reservations.set(reservationKey, reservation);
        this.logger.log(`Reserved ${input.quantity} unit(s) of ${input.sku} for checkout ${input.checkoutToken}.`);
        return reservation;
    }
    confirmReservation(checkoutToken) {
        const reservations = this.listReservationsForCheckout(checkoutToken);
        const activeReservations = reservations.filter((reservation) => reservation.status === 'ACTIVE');
        if (activeReservations.length === 0) {
            return reservations[0];
        }
        const expiredReservation = activeReservations.find((reservation) => reservation.expiresAt.getTime() < Date.now());
        if (expiredReservation) {
            this.releaseReservation(checkoutToken);
            throw new common_1.ConflictException(`Reservation for checkout \`${checkoutToken}\` has expired.`);
        }
        const timestamp = new Date();
        for (const reservation of activeReservations) {
            const snapshot = this.getSnapshot(reservation.sku);
            snapshot.reserved = Math.max(snapshot.reserved - reservation.quantity, 0);
            snapshot.onHand = Math.max(snapshot.onHand - reservation.quantity, 0);
            snapshot.updatedAt = timestamp;
            reservation.status = 'CONFIRMED';
            reservation.confirmedAt = timestamp;
            reservation.releasedAt = undefined;
        }
        this.logger.log(`Confirmed ${activeReservations.length} inventory reservation(s) for checkout ${checkoutToken}.`);
        return reservations[0];
    }
    releaseReservation(checkoutToken) {
        const reservations = this.listReservationsForCheckout(checkoutToken);
        const releasableReservations = reservations.filter((reservation) => reservation.status === 'ACTIVE');
        if (releasableReservations.length === 0) {
            return reservations[0];
        }
        const timestamp = new Date();
        for (const reservation of releasableReservations) {
            const snapshot = this.getSnapshot(reservation.sku);
            snapshot.reserved = Math.max(snapshot.reserved - reservation.quantity, 0);
            snapshot.updatedAt = timestamp;
            reservation.status = 'RELEASED';
            reservation.releasedAt = timestamp;
        }
        this.logger.warn(`Released ${releasableReservations.length} inventory reservation(s) for checkout ${checkoutToken}.`);
        return reservations[0];
    }
    releaseExpiredReservations(referenceTime = new Date()) {
        const expiredReservations = [...this.reservations.values()].filter((reservation) => reservation.status === 'ACTIVE' &&
            reservation.expiresAt.getTime() <= referenceTime.getTime());
        const processedTokens = new Set();
        for (const reservation of expiredReservations) {
            if (processedTokens.has(reservation.checkoutToken)) {
                continue;
            }
            this.releaseReservation(reservation.checkoutToken);
            processedTokens.add(reservation.checkoutToken);
        }
        return expiredReservations;
    }
    adjustOnHand(sku, delta, reason) {
        if (delta === 0) {
            return this.getSnapshot(sku);
        }
        const snapshot = this.getSnapshot(sku);
        const nextOnHand = snapshot.onHand + delta;
        if (nextOnHand < 0) {
            throw new common_1.ConflictException(`Inventory for SKU \`${sku}\` cannot drop below zero.`);
        }
        snapshot.onHand = nextOnHand;
        snapshot.updatedAt = new Date();
        this.logger.log(`Adjusted ${sku} by ${delta}. Reason: ${reason}`);
        return snapshot;
    }
    getReservationKey(checkoutToken, sku) {
        return `${checkoutToken}:${sku}`;
    }
    getSellableQuantity(snapshot) {
        return Math.max(snapshot.onHand - snapshot.reserved - snapshot.safetyStock, 0);
    }
    assertPositiveQuantity(quantity) {
        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new common_1.ConflictException('Quantity must be a positive integer.');
        }
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = InventoryService_1 = __decorate([
    (0, common_1.Injectable)()
], InventoryService);
//# sourceMappingURL=inventory.service.js.map