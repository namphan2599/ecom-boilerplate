import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import {
  ApiErrorResponseDto,
  ValidationErrorResponseDto,
} from '../common/http/api-error-response.dto';
import type { AuthenticatedUser } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CartService } from '../cart/cart.service';
import { AppRole } from '../common/auth/role.enum';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { PaymentsService } from './payments.service';

@ApiTags('checkout')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AppRole.CUSTOMER, AppRole.ADMIN)
@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly cartService: CartService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post('session')
  @ApiOperation({
    summary: 'Create a hosted checkout session from the user cart',
  })
  @ApiCreatedResponse({
    description: 'Creates a hosted checkout session and reserves inventory.',
    schema: {
      example: {
        provider: 'mock-stripe',
        checkoutToken: 'chk_1234567890abcdef',
        sessionId: 'cs_test_1234567890abcdef',
        checkoutUrl:
          'https://checkout.stripe.com/c/pay/cs_test_1234567890abcdef',
        successUrl: 'https://storefront.aura.local/checkout/success',
        cancelUrl: 'https://storefront.aura.local/checkout/cancel',
        expiresAt: '2026-04-08T14:45:00.000Z',
        order: {
          orderNumber: 'AURA-000001',
          status: 'PENDING',
          currencyCode: 'USD',
          subtotal: 159.98,
          discountTotal: 30,
          taxTotal: 10.4,
          shippingTotal: 0,
          grandTotal: 140.38,
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'The checkout request is invalid or the cart is empty.',
    type: ValidationErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'A valid bearer token is required to start checkout.',
    type: ApiErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Only customer or admin roles can create checkout sessions.',
    type: ApiErrorResponseDto,
  })
  async createCheckoutSession(
    @Req() req: Request & { user: AuthenticatedUser },
    @Body() input: CreateCheckoutSessionDto,
  ) {
    const cart = await this.cartService.getCartForUser(req.user);

    return this.paymentsService.createCheckoutSession({
      customer: req.user,
      cart,
      couponCode: input.couponCode,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
    });
  }
}
