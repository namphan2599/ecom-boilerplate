import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CartService } from '../cart/cart.service';
import { AppRole } from '../common/auth/role.enum';
import { Roles } from '../common/auth/roles.decorator';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { PaymentsService } from './payments.service';

@ApiTags('checkout')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles(AppRole.CUSTOMER, AppRole.ADMIN)
@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly cartService: CartService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post('session')
  @ApiOperation({ summary: 'Create a hosted checkout session from the user cart' })
  @ApiCreatedResponse({
    description: 'Creates a hosted checkout session and reserves inventory.',
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
