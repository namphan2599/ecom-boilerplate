import { ConflictException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { InventoryService } from './inventory.service';

describe('InventoryService', () => {
  let service: InventoryService;

  beforeEach(() => {
    service = new InventoryService();
    service.seed([
      {
        sku: 'HOODIE-BLK-M',
        onHand: 10,
        reserved: 0,
        safetyStock: 1,
      },
      {
        sku: 'CAP-STONE-ONE',
        onHand: 4,
        reserved: 0,
        safetyStock: 0,
      },
    ]);
  });

  it('reserves stock when sellable quantity is sufficient', () => {
    const reservation = service.reserveStock({
      sku: 'HOODIE-BLK-M',
      quantity: 3,
      checkoutToken: 'chk_ok',
      ttlMinutes: 10,
    });

    expect(reservation.status).toBe('ACTIVE');
    expect(service.getSnapshot('HOODIE-BLK-M')).toMatchObject({
      onHand: 10,
      reserved: 3,
      safetyStock: 1,
    });
  });

  it('rejects reservation when requested quantity exceeds sellable stock', () => {
    expect(() =>
      service.reserveStock({
        sku: 'HOODIE-BLK-M',
        quantity: 10,
        checkoutToken: 'chk_oversell',
      }),
    ).toThrow(ConflictException);
  });

  it('releases expired reservations back to inventory on timeout', () => {
    service.reserveStock({
      sku: 'HOODIE-BLK-M',
      quantity: 2,
      checkoutToken: 'chk_expired',
      ttlMinutes: -1,
    });

    const released = service.releaseExpiredReservations();

    expect(released).toHaveLength(1);
    expect(released[0]).toMatchObject({
      checkoutToken: 'chk_expired',
      status: 'RELEASED',
    });
    expect(service.getSnapshot('HOODIE-BLK-M')).toMatchObject({
      onHand: 10,
      reserved: 0,
    });
  });

  it('confirms reservations without double-decrementing stock', () => {
    service.reserveStock({
      sku: 'HOODIE-BLK-M',
      quantity: 2,
      checkoutToken: 'chk_confirm',
    });

    const confirmed = service.confirmReservation('chk_confirm');
    const confirmedAgain = service.confirmReservation('chk_confirm');

    expect(confirmed.status).toBe('CONFIRMED');
    expect(confirmedAgain.status).toBe('CONFIRMED');
    expect(service.getSnapshot('HOODIE-BLK-M')).toMatchObject({
      onHand: 8,
      reserved: 0,
    });
  });

  it('supports multiple SKU reservations for one checkout token', () => {
    service.reserveStock({
      sku: 'HOODIE-BLK-M',
      quantity: 2,
      checkoutToken: 'chk_multi',
    });
    service.reserveStock({
      sku: 'CAP-STONE-ONE',
      quantity: 1,
      checkoutToken: 'chk_multi',
    });

    const reservations = service.listReservationsForCheckout('chk_multi');

    expect(reservations).toHaveLength(2);

    service.releaseReservation('chk_multi');

    expect(service.getSnapshot('HOODIE-BLK-M')).toMatchObject({
      onHand: 10,
      reserved: 0,
    });
    expect(service.getSnapshot('CAP-STONE-ONE')).toMatchObject({
      onHand: 4,
      reserved: 0,
    });
  });
});
