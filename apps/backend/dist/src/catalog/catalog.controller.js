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
exports.CatalogController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const api_error_response_dto_1 = require("../common/http/api-error-response.dto");
const roles_decorator_1 = require("../common/auth/roles.decorator");
const role_enum_1 = require("../common/auth/role.enum");
const roles_guard_1 = require("../common/auth/roles.guard");
const catalog_service_1 = require("./catalog.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const PRODUCT_IMAGE_MAX_BYTES = Number(process.env.PRODUCT_MEDIA_MAX_BYTES ?? 5_242_880);
let CatalogController = class CatalogController {
    catalogService;
    constructor(catalogService) {
        this.catalogService = catalogService;
    }
    listProducts() {
        return this.catalogService.listProducts();
    }
    getProductBySlug(slug) {
        return this.catalogService.getProductBySlug(slug);
    }
    listCategories() {
        return this.catalogService.listCategories();
    }
    listTags() {
        return this.catalogService.listTags();
    }
    createProduct(input) {
        return this.catalogService.createProduct(input);
    }
    uploadProductImage(id, file) {
        if (!file) {
            throw new common_1.BadRequestException('A product image file is required.');
        }
        return this.catalogService.uploadProductImage(id, file);
    }
    deleteProductImage(id) {
        return this.catalogService.deleteProductImage(id);
    }
    updateProduct(id, input) {
        return this.catalogService.updateProduct(id, input);
    }
};
exports.CatalogController = CatalogController;
__decorate([
    (0, common_1.Get)('products'),
    (0, swagger_1.ApiOperation)({ summary: 'List published catalog products' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the current catalog listing.',
        schema: {
            example: {
                items: [
                    {
                        id: 'prod_hoodie',
                        name: 'Aura Signature Hoodie',
                        slug: 'aura-signature-hoodie',
                        status: 'ACTIVE',
                        isFeatured: true,
                        category: { id: 'cat_apparel', name: 'Apparel', slug: 'apparel' },
                        tags: [{ id: 'tag_featured', name: 'Featured', slug: 'featured' }],
                        variants: [
                            {
                                id: 'var_hoodie',
                                sku: 'HOODIE-BLK-M',
                                title: 'Black / Medium',
                                attributes: { color: 'black', size: 'M' },
                                inventoryOnHand: 24,
                                inventoryReserved: 0,
                                isActive: true,
                                prices: [
                                    {
                                        currencyCode: 'USD',
                                        amount: 79.99,
                                        compareAtAmount: 89.99,
                                    },
                                ],
                            },
                        ],
                    },
                ],
                total: 1,
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "listProducts", null);
__decorate([
    (0, common_1.Get)('products/:slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a product by slug' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Returns the matching catalog product.' }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'No product was found for the requested slug.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "getProductBySlug", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'List product categories' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "listCategories", null);
__decorate([
    (0, common_1.Get)('tags'),
    (0, swagger_1.ApiOperation)({ summary: 'List product tags' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "listTags", null);
__decorate([
    (0, common_1.Post)('admin/products'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.AppRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a product as an admin' }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Creates a catalog product with variants.',
        schema: {
            example: {
                id: 'prod_new',
                name: 'Aura Everyday Tee',
                slug: 'aura-everyday-tee',
                status: 'ACTIVE',
                variants: [{ sku: 'TEE-BLK-M', title: 'Black / Medium' }],
            },
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Validation failed for the product payload.',
        type: api_error_response_dto_1.ValidationErrorResponseDto,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'A valid admin bearer token is required.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    (0, swagger_1.ApiForbiddenResponse)({
        description: 'Only admin users can create catalog products.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Post)('admin/products/:id/image'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: {
            fileSize: PRODUCT_IMAGE_MAX_BYTES,
        },
    })),
    (0, roles_decorator_1.Roles)(role_enum_1.AppRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['file'],
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload or replace a product hero image as an admin',
    }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Stores a product hero image and returns the updated product payload.',
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'The upload is missing, invalid, or not one of JPEG/PNG/WebP.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'A valid admin bearer token is required.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    (0, swagger_1.ApiForbiddenResponse)({
        description: 'Only admin users can upload product media.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'The requested product id does not exist.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "uploadProductImage", null);
__decorate([
    (0, common_1.Delete)('admin/products/:id/image'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.AppRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a product hero image as an admin' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Clears the product image metadata and removes the stored object reference.',
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'A valid admin bearer token is required.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    (0, swagger_1.ApiForbiddenResponse)({
        description: 'Only admin users can delete product media.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'The requested product id does not exist.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "deleteProductImage", null);
__decorate([
    (0, common_1.Patch)('admin/products/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.AppRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update a product as an admin' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Returns the updated catalog product.' }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Validation failed for the update payload.',
        type: api_error_response_dto_1.ValidationErrorResponseDto,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'A valid admin bearer token is required.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    (0, swagger_1.ApiForbiddenResponse)({
        description: 'Only admin users can update catalog products.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'The requested product id does not exist.',
        type: api_error_response_dto_1.ApiErrorResponseDto,
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "updateProduct", null);
exports.CatalogController = CatalogController = __decorate([
    (0, swagger_1.ApiTags)('catalog'),
    (0, common_1.Controller)('catalog'),
    __metadata("design:paramtypes", [catalog_service_1.CatalogService])
], CatalogController);
//# sourceMappingURL=catalog.controller.js.map