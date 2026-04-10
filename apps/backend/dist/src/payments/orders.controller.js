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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_error_response_dto_1 = require("../common/http/api-error-response.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const role_enum_1 = require("../common/auth/role.enum");
const roles_decorator_1 = require("../common/auth/roles.decorator");
const roles_guard_1 = require("../common/auth/roles.guard");
const update_order_status_dto_1 = require("./dto/update-order-status.dto");
const payments_service_1 = require("./payments.service");
let OrdersController = class OrdersController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    getMyOrders(req) {
        return this.paymentsService.listOrdersForUser(req.user.userId);
    }
    getAllOrdersForAdmin() {
        return this.paymentsService.listAllOrders();
    }
    updateOrderStatus(orderNumber, input) {
        return this.paymentsService.updateOrderStatus(orderNumber, input.status);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Get)('me'),
    (0, roles_decorator_1.Roles)(role_enum_1.AppRole.CUSTOMER, role_enum_1.AppRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get order history for the authenticated customer' }),
    (0, swagger_1.ApiOkResponse)({
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
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'A valid bearer token is required to view order history.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getMyOrders", null);
__decorate([
    (0, common_1.Get)('admin'),
    (0, roles_decorator_1.Roles)(role_enum_1.AppRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all orders for admin fulfillment view' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Returns all known orders.' }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'A valid admin bearer token is required.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    (0, swagger_1.ApiForbiddenResponse)({
        description: 'Only admins can access the fulfillment queue.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getAllOrdersForAdmin", null);
__decorate([
    (0, common_1.Patch)('admin/:orderNumber/status'),
    (0, roles_decorator_1.Roles)(role_enum_1.AppRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update order status as an admin user' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Returns the updated order snapshot.' }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'The requested status transition is invalid.',
        type: api_error_response_dto_1.ValidationErrorResponseDto,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'A valid admin bearer token is required.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    (0, swagger_1.ApiForbiddenResponse)({
        description: 'Only admins can update order statuses.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'The requested order number does not exist.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    __param(0, (0, common_1.Param)('orderNumber')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_order_status_dto_1.UpdateOrderStatusDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "updateOrderStatus", null);
exports.OrdersController = OrdersController = __decorate([
    (0, swagger_1.ApiTags)('orders'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map