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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationErrorResponseDto = exports.ApiErrorResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ApiErrorResponseDto {
    statusCode;
    timestamp;
    path;
    method;
    message;
}
exports.ApiErrorResponseDto = ApiErrorResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 401 }),
    __metadata("design:type", Number)
], ApiErrorResponseDto.prototype, "statusCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-08T14:20:00.000Z' }),
    __metadata("design:type", String)
], ApiErrorResponseDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '/auth/login' }),
    __metadata("design:type", String)
], ApiErrorResponseDto.prototype, "path", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'POST' }),
    __metadata("design:type", String)
], ApiErrorResponseDto.prototype, "method", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Invalid email or password.',
        description: 'Human-readable error message or messages.',
        oneOf: [
            { type: 'string' },
            {
                type: 'array',
                items: { type: 'string' },
            },
        ],
    }),
    __metadata("design:type", Object)
], ApiErrorResponseDto.prototype, "message", void 0);
class ValidationErrorResponseDto extends ApiErrorResponseDto {
}
exports.ValidationErrorResponseDto = ValidationErrorResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['email must be an email', 'password should not be empty'],
        type: [String],
    }),
    __metadata("design:type", Array)
], ValidationErrorResponseDto.prototype, "message", void 0);
//# sourceMappingURL=api-error-response.dto.js.map