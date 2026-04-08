import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InventoryService } from '../inventory/inventory.service';

export interface StripeLikeEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly processedEventIds = new Set<string>();

  constructor(private readonly inventoryService: InventoryService) {}

  /**
   * Replace this lightweight validation with stripe.webhooks.constructEvent()
   * once the Stripe SDK and webhook secret are wired into the project.
   */
  parseAndVerifyWebhook(input: {
    signature?: string;
    payload: unknown;
  }): StripeLikeEvent {
    if (!input.signature) {
      throw new BadRequestException('Missing Stripe signature header.');
    }

    if (!this.isStripeLikeEvent(input.payload)) {
      throw new BadRequestException('Invalid Stripe webhook payload.');
    }

    return input.payload;
  }

  handleWebhookEvent(event: StripeLikeEvent): void {
    if (this.processedEventIds.has(event.id)) {
      this.logger.warn(`Ignoring duplicate Stripe event ${event.id}.`);
      return;
    }

    this.processedEventIds.add(event.id);

    switch (event.type) {
      case 'payment_intent.succeeded':
      case 'checkout.session.completed':
        this.handlePaymentSucceeded(event.data.object);
        return;

      case 'payment_intent.payment_failed':
      case 'checkout.session.expired':
        this.handlePaymentFailed(event.data.object);
        return;

      case 'charge.refunded':
        this.logger.warn(
          'Refund event received. Wire this into your returns workflow.',
        );
        return;

      default:
        this.logger.debug(`Unhandled Stripe event type: ${event.type}`);
    }
  }

  private handlePaymentSucceeded(payload: Record<string, unknown>): void {
    const checkoutToken = this.getCheckoutToken(payload);

    if (checkoutToken) {
      this.inventoryService.confirmReservation(checkoutToken);
    }

    this.logger.log(
      `Payment succeeded for checkout token: ${checkoutToken ?? 'unknown'}`,
    );
  }

  private handlePaymentFailed(payload: Record<string, unknown>): void {
    const checkoutToken = this.getCheckoutToken(payload);

    if (checkoutToken) {
      this.inventoryService.releaseReservation(checkoutToken);
    }

    this.logger.warn(
      `Payment failed for checkout token: ${checkoutToken ?? 'unknown'}`,
    );
  }

  private getCheckoutToken(
    payload: Record<string, unknown>,
  ): string | undefined {
    const metadata = payload.metadata;

    if (!metadata || typeof metadata !== 'object') {
      return undefined;
    }

    const rawToken = (metadata as Record<string, unknown>).checkoutToken;
    return typeof rawToken === 'string' && rawToken.length > 0
      ? rawToken
      : undefined;
  }

  private isStripeLikeEvent(payload: unknown): payload is StripeLikeEvent {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const candidate = payload as Partial<StripeLikeEvent>;
    return !!candidate.id && !!candidate.type && !!candidate.data?.object;
  }
}
