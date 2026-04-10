import type { Request } from 'express';
import type { AuthenticatedUser } from '../auth/auth.service';
import { CartService } from '../cart/cart.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { PaymentsService } from './payments.service';
export declare class CheckoutController {
    private readonly cartService;
    private readonly paymentsService;
    constructor(cartService: CartService, paymentsService: PaymentsService);
    createCheckoutSession(req: Request & {
        user: AuthenticatedUser;
    }, input: CreateCheckoutSessionDto): Promise<import("./payments.service").HostedCheckoutSessionView>;
}
