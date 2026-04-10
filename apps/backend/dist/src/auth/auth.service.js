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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcryptjs_1 = require("bcryptjs");
const prisma_service_1 = require("../prisma/prisma.service");
const role_enum_1 = require("../common/auth/role.enum");
const users_fixtures_1 = require("../seeding/fixtures/users.fixtures");
let AuthService = class AuthService {
    jwtService;
    prisma;
    fallbackUsers = users_fixtures_1.SEED_LOCAL_USERS;
    constructor(jwtService, prisma) {
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    async validateLocalUser(email, password) {
        const normalizedEmail = email.trim().toLowerCase();
        if (this.prisma.isReady()) {
            const user = await this.prisma.user.findUnique({
                where: { email: normalizedEmail },
            });
            if (user?.passwordHash && user.isActive) {
                const isPasswordValid = await (0, bcryptjs_1.compare)(password, user.passwordHash);
                if (isPasswordValid) {
                    return {
                        userId: user.id,
                        email: user.email,
                        role: user.role,
                        displayName: [user.firstName, user.lastName].filter(Boolean).join(' ') ||
                            user.email,
                        provider: 'local',
                    };
                }
            }
        }
        const user = this.fallbackUsers.find((candidate) => candidate.email.toLowerCase() === normalizedEmail &&
            candidate.password === password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        return {
            userId: user.id,
            email: user.email,
            role: user.role,
            displayName: user.displayName,
            provider: 'local',
        };
    }
    issueToken(user) {
        const accessToken = this.jwtService.sign({
            sub: user.userId,
            email: user.email,
            role: user.role,
        });
        return {
            accessToken,
            tokenType: 'Bearer',
            expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
            user,
        };
    }
    createGoogleUser(profile) {
        const email = profile.emails?.[0]?.value ?? `google-${profile.id}@aura.local`;
        return {
            userId: `google:${profile.id}`,
            email,
            role: role_enum_1.AppRole.CUSTOMER,
            displayName: profile.displayName ?? email,
            provider: 'google',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map