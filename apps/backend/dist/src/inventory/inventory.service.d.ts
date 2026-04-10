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
export declare class InventoryService {
    private readonly logger;
    private readonly inventory;
    private readonly reservations;
    seed(records: Array<Partial<InventorySnapshot> & {
        sku: string;
        onHand: number;
    }>): void;
    getSnapshot(sku: string): InventorySnapshot;
    listReservationsForCheckout(checkoutToken: string): InventoryReservation[];
    assertAvailable(sku: string, quantity: number): InventorySnapshot;
    reserveStock(input: ReserveStockInput): InventoryReservation;
    confirmReservation(checkoutToken: string): InventoryReservation;
    releaseReservation(checkoutToken: string): InventoryReservation;
    releaseExpiredReservations(referenceTime?: Date): InventoryReservation[];
    adjustOnHand(sku: string, delta: number, reason: string): InventorySnapshot;
    private getReservationKey;
    private getSellableQuantity;
    private assertPositiveQuantity;
}
