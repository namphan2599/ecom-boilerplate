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
exports.StripeWebhookController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_error_response_dto_1 = require("../common/http/api-error-response.dto");
const payments_service_1 = require("./payments.service");
let StripeWebhookController = class StripeWebhookController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async handleStripeWebhook(signature, req) {
        if (!signature) {
            throw new common_1.BadRequestException('Missing `stripe-signature` header.');
        }
        const payload = req.rawBody ?? req.body;
        const event = this.paymentsService.parseAndVerifyWebhook({
            signature,
            payload,
        });
        await this.paymentsService.handleWebhookEvent(event);
        return {
            received: true,
            type: event.type,
        };
    }
};
exports.StripeWebhookController = StripeWebhookController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Receive Stripe webhook events' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Confirms webhook receipt after signature and payload validation.',
        schema: {
            example: {
                received: true,
                type: 'checkout.session.completed',
            },
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'The Stripe signature header or payload was invalid.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    __param(0, (0, common_1.Headers)('stripe-signature')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StripeWebhookController.prototype, "handleStripeWebhook", null);
exports.StripeWebhookController = StripeWebhookController = __decorate([
    (0, swagger_1.ApiTags)('payments'),
    (0, common_1.Controller)('webhooks/stripe'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], StripeWebhookController);
//# sourceMappingURL=stripe-webhook.controller.js.map