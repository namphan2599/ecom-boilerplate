import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { Roles } from './common/auth/roles.decorator';
import { AppRole } from './common/auth/role.enum';
import { RolesGuard } from './common/auth/roles.guard';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('admin/summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.ADMIN)
  getAdminSummary(): { scope: AppRole; capabilities: string[] } {
    return {
      scope: AppRole.ADMIN,
      capabilities: ['catalog-management', 'inventory-control', 'order-fulfillment'],
    };
  }

  @Get('me/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.CUSTOMER, AppRole.ADMIN)
  getOrderHistoryContext(): { scope: string; resource: string } {
    return {
      scope: 'authenticated',
      resource: 'order-history',
    };
  }
}
