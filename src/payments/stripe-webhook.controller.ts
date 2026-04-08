import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { ApiErrorResponseDto } from '../common/http/api-error-response.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('webhooks/stripe')
export class StripeWebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Receive Stripe webhook events' })
  @ApiOkResponse({
    description: 'Confirms webhook receipt after signature and payload validation.',
    schema: {
      example: {
        received: true,
        type: 'checkout.session.completed',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'The Stripe signature header or payload was invalid.',
    type: ApiErrorResponseDto,
  })
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
