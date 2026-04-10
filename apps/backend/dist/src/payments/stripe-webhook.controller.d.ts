import type { Request } from 'express';
import { PaymentsService } from './payments.service';
export declare class StripeWebhookController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    handleStripeWebhook(signature: string | undefined, req: Request): Promise<{
        received: boolean;
        type: string;
    }>;
}
