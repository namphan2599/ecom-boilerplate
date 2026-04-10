import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

export interface InventorySnapshot {
  sku: string;
  onHand: number;
  reserved: number;
  safetyStock: number;
  updatedAt: Date;
}

export interface InventoryReservation {
  checkoutToken: string;
  sku: string;
  quantity: number;
  status: 'ACTIVE' | 'CONFIRMED' | 'RELEASED';
  expiresAt: Date;
  confirmedAt?: Date;
  releasedAt?: Date;
}

export interface ReserveStockInput {
  sku: string;
  quantity: number;
  checkoutToken: string;
  ttlMinutes?: number;
}

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);
  private readonly inventory = new Map<string, InventorySnapshot>();
  private readonly reservations = new Map<string, InventoryReservation>();

  /**
   * Seed helper for local development and tests.
   * Replace this in production with a Prisma-backed repository + transaction.
   */
  seed(
    records: Array<
      Partial<InventorySnapshot> & { sku: string; onHand: number }
    >,
  ): void {
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

  getSnapshot(sku: string): InventorySnapshot {
    const snapshot = this.inventory.get(sku);

    if (!snapshot) {
      throw new NotFoundException(
        `No inventory record found for SKU \`${sku}\`.`,
      );
    }

    return snapshot;
  }

  listReservationsForCheckout(checkoutToken: string): InventoryReservation[] {
    const reservations = [...this.reservations.values()]
      .filter((reservation) => reservation.checkoutToken === checkoutToken)
      .sort((left, right) => left.sku.localeCompare(right.sku));

    if (reservations.length === 0) {
      throw new NotFoundException(
        `No inventory reservation found for checkout \`${checkoutToken}\`.`,
      );
    }

    return reservations;
  }

  assertAvailable(sku: string, quantity: number): InventorySnapshot {
    this.assertPositiveQuantity(quantity);

    const snapshot = this.getSnapshot(sku);
    const sellable = this.getSellableQuantity(snapshot);

    if (quantity > sellable) {
      throw new ConflictException(
        `Requested quantity (${quantity}) exceeds sellable stock (${sellable}) for SKU \`${sku}\`.`,
      );
    }

    return snapshot;
  }

  reserveStock(input: ReserveStockInput): InventoryReservation {
    this.assertPositiveQuantity(input.quantity);

    const reservationKey = this.getReservationKey(
      input.checkoutToken,
      input.sku,
    );
    const existingReservation = this.reservations.get(reservationKey);

    if (existingReservation && existingReservation.status !== 'RELEASED') {
      if (existingReservation.quantity !== input.quantity) {
        throw new ConflictException(
          `Checkout \`${input.checkoutToken}\` already has a reservation for SKU \`${input.sku}\`.`,
        );
      }

      return existingReservation;
    }

    this.assertAvailable(input.sku, input.quantity);

    const snapshot = this.getSnapshot(input.sku);
    snapshot.reserved += input.quantity;
    snapshot.updatedAt = new Date();

    const reservation: InventoryReservation = {
      checkoutToken: input.checkoutToken,
      sku: input.sku,
      quantity: input.quantity,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + (input.ttlMinutes ?? 15) * 60_000),
    };

    this.reservations.set(reservationKey, reservation);
    this.logger.log(
      `Reserved ${input.quantity} unit(s) of ${input.sku} for checkout ${input.checkoutToken}.`,
    );

    return reservation;
  }

  confirmReservation(checkoutToken: string): InventoryReservation {
    const reservations = this.listReservationsForCheckout(checkoutToken);
    const activeReservations = reservations.filter(
      (reservation) => reservation.status === 'ACTIVE',
    );

    if (activeReservations.length === 0) {
      return reservations[0];
    }

    const expiredReservation = activeReservations.find(
      (reservation) => reservation.expiresAt.getTime() < Date.now(),
    );

    if (expiredReservation) {
      this.releaseReservation(checkoutToken);
      throw new ConflictException(
        `Reservation for checkout \`${checkoutToken}\` has expired.`,
      );
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

    this.logger.log(
      `Confirmed ${activeReservations.length} inventory reservation(s) for checkout ${checkoutToken}.`,
    );

    return reservations[0];
  }

  releaseReservation(checkoutToken: string): InventoryReservation {
    const reservations = this.listReservationsForCheckout(checkoutToken);
    const releasableReservations = reservations.filter(
      (reservation) => reservation.status === 'ACTIVE',
    );

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

    this.logger.warn(
      `Released ${releasableReservations.length} inventory reservation(s) for checkout ${checkoutToken}.`,
    );

    return reservations[0];
  }

  releaseExpiredReservations(
    referenceTime: Date = new Date(),
  ): InventoryReservation[] {
    const expiredReservations = [...this.reservations.values()].filter(
      (reservation) =>
        reservation.status === 'ACTIVE' &&
        reservation.expiresAt.getTime() <= referenceTime.getTime(),
    );

    const processedTokens = new Set<string>();

    for (const reservation of expiredReservations) {
      if (processedTokens.has(reservation.checkoutToken)) {
        continue;
      }

      this.releaseReservation(reservation.checkoutToken);
      processedTokens.add(reservation.checkoutToken);
    }

    return expiredReservations;
  }

  adjustOnHand(sku: string, delta: number, reason: string): InventorySnapshot {
    if (delta === 0) {
      return this.getSnapshot(sku);
    }

    const snapshot = this.getSnapshot(sku);
    const nextOnHand = snapshot.onHand + delta;

    if (nextOnHand < 0) {
      throw new ConflictException(
        `Inventory for SKU \`${sku}\` cannot drop below zero.`,
      );
    }

    snapshot.onHand = nextOnHand;
    snapshot.updatedAt = new Date();
    this.logger.log(`Adjusted ${sku} by ${delta}. Reason: ${reason}`);

    return snapshot;
  }

  private getReservationKey(checkoutToken: string, sku: string): string {
    return `${checkoutToken}:${sku}`;
  }

  private getSellableQuantity(snapshot: InventorySnapshot): number {
    return Math.max(
      snapshot.onHand - snapshot.reserved - snapshot.safetyStock,
      0,
    );
  }

  private assertPositiveQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new ConflictException('Quantity must be a positive integer.');
    }
  }
}
