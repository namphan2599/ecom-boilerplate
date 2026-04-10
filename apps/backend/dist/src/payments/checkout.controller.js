"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_error_response_dto_1 = require("../common/http/api-error-response.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const cart_service_1 = require("../cart/cart.service");
const role_enum_1 = require("../common/auth/role.enum");
const roles_decorator_1 = require("../common/auth/roles.decorator");
const roles_guard_1 = require("../common/auth/roles.guard");
const create_checkout_session_dto_1 = require("./dto/create-checkout-session.dto");
const payments_service_1 = require("./payments.service");
let CheckoutController = class CheckoutController {
    cartService;
    paymentsService;
    constructor(cartService, paymentsService) {
        this.cartService = cartService;
        this.paymentsService = paymentsService;
    }
    async createCheckoutSession(req, input) {
        const cart = await this.cartService.getCartForUser(req.user);
        return this.paymentsService.createCheckoutSession({
            customer: req.user,
            cart,
            couponCode: input.couponCode,
            successUrl: input.successUrl,
            cancelUrl: input.cancelUrl,
        });
    }
};
exports.CheckoutController = CheckoutController;
__decorate([
    (0, common_1.Post)('session'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a hosted checkout session from the user cart',
    }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Creates a hosted checkout session and reserves inventory.',
        schema: {
            example: {
                provider: 'mock-stripe',
                checkoutToken: 'chk_1234567890abcdef',
                sessionId: 'cs_test_1234567890abcdef',
                checkoutUrl: 'https://checkout.stripe.com/c/pay/cs_test_1234567890abcdef',
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
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'The checkout request is invalid or the cart is empty.',
        type: api_error_response_dto_1.ValidationErrorResponseDto,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'A valid bearer token is required to start checkout.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    (0, swagger_1.ApiForbiddenResponse)({
        description: 'Only customer or admin roles can create checkout sessions.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_checkout_session_dto_1.CreateCheckoutSessionDto]),
    __metadata("design:returntype", Promise)
], CheckoutController.prototype, "createCheckoutSession", null);
exports.CheckoutController = CheckoutController = __decorate([
    (0, swagger_1.ApiTags)('checkout'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.AppRole.CUSTOMER, role_enum_1.AppRole.ADMIN),
    (0, common_1.Controller)('checkout'),
    __metadata("design:paramtypes", [cart_service_1.CartService,
        payments_service_1.PaymentsService])
], CheckoutController);
//# sourceMappingURL=checkout.controller.js.map