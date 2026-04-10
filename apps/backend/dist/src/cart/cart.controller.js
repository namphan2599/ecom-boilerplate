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
exports.CartController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_error_response_dto_1 = require("../common/http/api-error-response.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const role_enum_1 = require("../common/auth/role.enum");
const roles_decorator_1 = require("../common/auth/roles.decorator");
const roles_guard_1 = require("../common/auth/roles.guard");
const cart_service_1 = require("./cart.service");
const add_cart_item_dto_1 = require("./dto/add-cart-item.dto");
const update_cart_item_dto_1 = require("./dto/update-cart-item.dto");
let CartController = class CartController {
    cartService;
    constructor(cartService) {
        this.cartService = cartService;
    }
    getCart(req) {
        return this.cartService.getCartForUser(req.user);
    }
    addItem(req, input) {
        return this.cartService.addItem(req.user, input);
    }
    updateItem(req, sku, input) {
        return this.cartService.updateItem(req.user, sku, input);
    }
    removeItem(req, sku) {
        return this.cartService.removeItem(req.user, sku);
    }
};
exports.CartController = CartController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get the authenticated user cart' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the persistent cart snapshot.',
        schema: {
            example: {
                userId: 'customer-local',
                items: [
                    {
                        sku: 'HOODIE-BLK-M',
                        productName: 'Aura Signature Hoodie',
                        quantity: 2,
                        currencyCode: 'USD',
                        unitPrice: 79.99,
                        lineTotal: 159.98,
                    },
                ],
                summary: {
                    currencyCode: 'USD',
                    itemCount: 2,
                    distinctItems: 1,
                    subtotal: 159.98,
                },
                persistence: 'memory',
            },
        },
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'A valid bearer token is required to access the cart.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "getCart", null);
__decorate([
    (0, common_1.Post)('items'),
    (0, swagger_1.ApiOperation)({ summary: 'Add an item to the authenticated user cart' }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Adds an item and returns the cart snapshot.',
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'The cart item payload failed validation.',
        type: api_error_response_dto_1.ValidationErrorResponseDto,
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'The requested SKU was not found in the catalog.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'A valid bearer token is required to modify the cart.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, add_cart_item_dto_1.AddCartItemDto]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "addItem", null);
__decorate([
    (0, common_1.Patch)('items/:sku'),
    (0, swagger_1.ApiOperation)({ summary: 'Update the quantity for a cart item' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('sku')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_cart_item_dto_1.UpdateCartItemDto]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)('items/:sku'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove an item from the cart' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('sku')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "removeItem", null);
exports.CartController = CartController = __decorate([
    (0, swagger_1.ApiTags)('cart'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.AppRole.CUSTOMER, role_enum_1.AppRole.ADMIN),
    (0, common_1.Controller)('cart'),
    __metadata("design:paramtypes", [cart_service_1.CartService])
], CartController);
//# sourceMappingURL=cart.controller.js.map