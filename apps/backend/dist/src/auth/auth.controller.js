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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_error_response_dto_1 = require("../common/http/api-error-response.dto");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const google_auth_guard_1 = require("./guards/google-auth.guard");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const local_auth_guard_1 = require("./guards/local-auth.guard");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    login(req) {
        return this.authService.issueToken(req.user);
    }
    googleLogin() {
    }
    googleCallback(req) {
        return this.authService.issueToken(req.user);
    }
    profile(req) {
        return req.user;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.UseGuards)(local_auth_guard_1.LocalAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Log in with email and password' }),
    (0, swagger_1.ApiBody)({
        type: login_dto_1.LoginDto,
        description: 'Local login credentials for an admin or customer user.',
        examples: {
            customer: {
                summary: 'Customer login',
                value: {
                    email: 'customer@aura.local',
                    password: 'Customer123!',
                },
            },
        },
    }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Returns a JWT access token and authenticated user profile.',
        schema: {
            example: {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                tokenType: 'Bearer',
                expiresIn: '15m',
                user: {
                    userId: 'customer-local',
                    email: 'customer@aura.local',
                    role: 'CUSTOMER',
                    displayName: 'Aura Customer',
                    provider: 'local',
                },
            },
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Validation failed for the login request body.',
        type: api_error_response_dto_1.ValidationErrorResponseDto,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'The submitted email/password combination is invalid.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('google'),
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Start Google OAuth login' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "googleLogin", null);
__decorate([
    (0, common_1.Get)('google/callback'),
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Google OAuth callback' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], AuthController.prototype, "googleCallback", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get the authenticated user profile' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the authenticated user profile from the JWT context.',
        schema: {
            example: {
                userId: 'admin-local',
                email: 'admin@aura.local',
                role: 'ADMIN',
                displayName: 'Aura Admin',
                provider: 'local',
            },
        },
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'A valid bearer token is required to access the profile.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], AuthController.prototype, "profile", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map