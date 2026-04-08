import { Module } from '@nestjs/common';
import { CartModule } from '../cart/cart.module';
import { CatalogModule } from '../catalog/catalog.module';
import { DiscountsModule } from '../discounts/discounts.module';
import { InventoryModule } from '../inventory/inventory.module';
import { CheckoutController } from './checkout.controller';
import { PaymentsService } from './payments.service';
import { StripeWebhookController } from './stripe-webhook.controller';

@Module({
  imports: [CartModule, CatalogModule, DiscountsModule, InventoryModule],
  controllers: [CheckoutController, StripeWebhookController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
