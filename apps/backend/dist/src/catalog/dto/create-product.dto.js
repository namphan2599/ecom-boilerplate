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
exports.CreateProductDto = exports.ProductVariantDto = exports.VariantPriceDto = exports.CatalogTagDto = exports.CatalogCategoryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CatalogCategoryDto {
    name;
    slug;
}
exports.CatalogCategoryDto = CatalogCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Apparel' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CatalogCategoryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'apparel' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CatalogCategoryDto.prototype, "slug", void 0);
class CatalogTagDto {
    name;
    slug;
}
exports.CatalogTagDto = CatalogTagDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Featured' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CatalogTagDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'featured' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CatalogTagDto.prototype, "slug", void 0);
class VariantPriceDto {
    currencyCode;
    amount;
    compareAtAmount;
}
exports.VariantPriceDto = VariantPriceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USD' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VariantPriceDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 29.99 }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], VariantPriceDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 39.99 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], VariantPriceDto.prototype, "compareAtAmount", void 0);
class ProductVariantDto {
    sku;
    title;
    attributes;
    prices;
    inventoryOnHand;
    inventoryReserved;
    isActive;
}
exports.ProductVariantDto = ProductVariantDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TEE-BLK-M' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductVariantDto.prototype, "sku", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Black / Medium' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductVariantDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: { color: 'black', size: 'M' } }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ProductVariantDto.prototype, "attributes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [VariantPriceDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => VariantPriceDto),
    __metadata("design:type", Array)
], ProductVariantDto.prototype, "prices", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ProductVariantDto.prototype, "inventoryOnHand", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 0, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ProductVariantDto.prototype, "inventoryReserved", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProductVariantDto.prototype, "isActive", void 0);
class CreateProductDto {
    name;
    slug;
    description;
    status;
    imageUrl;
    isFeatured;
    category;
    tags;
    variants;
}
exports.CreateProductDto = CreateProductDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Aura Everyday Tee' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'aura-everyday-tee' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Soft cotton tee for daily wear.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.ProductStatus, default: client_1.ProductStatus.DRAFT }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ProductStatus),
    __metadata("design:type", String)
], CreateProductDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://example.com/images/tee.jpg' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false, default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateProductDto.prototype, "isFeatured", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CatalogCategoryDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CatalogCategoryDto),
    __metadata("design:type", CatalogCategoryDto)
], CreateProductDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [CatalogTagDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CatalogTagDto),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ProductVariantDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ProductVariantDto),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "variants", void 0);
//# sourceMappingURL=create-product.dto.js.map