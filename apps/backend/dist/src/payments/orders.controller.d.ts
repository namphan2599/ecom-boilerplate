import type { Request } from 'express';
import type { AuthenticatedUser } from '../auth/auth.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { PaymentsService } from './payments.service';
export declare class OrdersController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    getMyOrders(req: Request & {
        user: AuthenticatedUser;
    }): {
        items: import("./payments.service").CheckoutOrderView[];
        total: number;
    };
    getAllOrdersForAdmin(): {
        items: import("./payments.service").CheckoutOrderView[];
        total: number;
    };
    updateOrderStatus(orderNumber: string, input: UpdateOrderStatusDto): import("./payments.service").CheckoutOrderView;
}
