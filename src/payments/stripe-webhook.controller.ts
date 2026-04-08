import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { PaymentsService } from './payments.service';

@Controller('webhooks/stripe')
export class StripeWebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @HttpCode(200)
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string | undefined,
    @Req() req: Request,
  ): Promise<{ received: boolean; type: string }> {
    if (!signature) {
      throw new BadRequestException('Missing `stripe-signature` header.');
    }

    const payload: unknown =
      (req as Request & { rawBody?: Buffer }).rawBody ?? (req.body as unknown);

    const event = this.paymentsService.parseAndVerifyWebhook({
      signature,
      payload,
    });

    await this.paymentsService.handleWebhookEvent(event);

    return {
      received: true,
      type: event.type,
    };
  }
}
