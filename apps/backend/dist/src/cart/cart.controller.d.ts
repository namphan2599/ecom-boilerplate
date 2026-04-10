import type { Request } from 'express';
import type { AuthenticatedUser } from '../auth/auth.service';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(req: Request & {
        user: AuthenticatedUser;
    }): Promise<import("./cart.service").CartView>;
    addItem(req: Request & {
        user: AuthenticatedUser;
    }, input: AddCartItemDto): Promise<import("./cart.service").CartView>;
    updateItem(req: Request & {
        user: AuthenticatedUser;
    }, sku: string, input: UpdateCartItemDto): Promise<import("./cart.service").CartView>;
    removeItem(req: Request & {
        user: AuthenticatedUser;
    }, sku: string): Promise<import("./cart.service").CartView>;
}
