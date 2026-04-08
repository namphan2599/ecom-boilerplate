import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
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
  @ApiOkResponse({ description: 'Returns orders owned by the authenticated user.' })
  getMyOrders(@Req() req: Request & { user: AuthenticatedUser }) {
    return this.paymentsService.listOrdersForUser(req.user.userId);
  }

  @Get('admin')
  @Roles(AppRole.ADMIN)
  @ApiOperation({ summary: 'Get all orders for admin fulfillment view' })
  @ApiOkResponse({ description: 'Returns all known orders.' })
  getAllOrdersForAdmin() {
    return this.paymentsService.listAllOrders();
  }

  @Patch('admin/:orderNumber/status')
  @Roles(AppRole.ADMIN)
  @ApiOperation({ summary: 'Update order status as an admin user' })
  @ApiOkResponse({ description: 'Returns the updated order snapshot.' })
  updateOrderStatus(
    @Param('orderNumber') orderNumber: string,
    @Body() input: UpdateOrderStatusDto,
  ) {
    return this.paymentsService.updateOrderStatus(orderNumber, input.status);
  }
}
