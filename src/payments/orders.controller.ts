import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
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
import { AppRole } from '../common/auth/role.enum';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { PaymentsService } from './payments.service';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('me')
  @Roles(AppRole.CUSTOMER, AppRole.ADMIN)
  @ApiOperation({ summary: 'Get order history for the authenticated customer' })
  @ApiOkResponse({
    description: 'Returns orders owned by the authenticated user.',
    schema: {
      example: {
        items: [
          {
            orderNumber: 'AURA-000001',
            status: 'PAID',
            paymentStatus: 'paid',
            userId: 'customer-local',
            grandTotal: 140.38,
          },
        ],
        total: 1,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'A valid bearer token is required to view order history.',
    type: ApiErrorResponseDto,
  })
  getMyOrders(@Req() req: Request & { user: AuthenticatedUser }) {
    return this.paymentsService.listOrdersForUser(req.user.userId);
  }

  @Get('admin')
  @Roles(AppRole.ADMIN)
  @ApiOperation({ summary: 'Get all orders for admin fulfillment view' })
  @ApiOkResponse({ description: 'Returns all known orders.' })
  @ApiUnauthorizedResponse({
    description: 'A valid admin bearer token is required.',
    type: ApiErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Only admins can access the fulfillment queue.',
    type: ApiErrorResponseDto,
  })
  getAllOrdersForAdmin() {
    return this.paymentsService.listAllOrders();
  }

  @Patch('admin/:orderNumber/status')
  @Roles(AppRole.ADMIN)
  @ApiOperation({ summary: 'Update order status as an admin user' })
  @ApiOkResponse({ description: 'Returns the updated order snapshot.' })
  @ApiBadRequestResponse({
    description: 'The requested status transition is invalid.',
    type: ValidationErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'A valid admin bearer token is required.',
    type: ApiErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Only admins can update order statuses.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'The requested order number does not exist.',
    type: ApiErrorResponseDto,
  })
  updateOrderStatus(
    @Param('orderNumber') orderNumber: string,
    @Body() input: UpdateOrderStatusDto,
  ) {
    return this.paymentsService.updateOrderStatus(orderNumber, input.status);
  }
}
