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
exports.CatalogService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const node_crypto_1 = require("node:crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const catalog_fixtures_1 = require("../seeding/fixtures/catalog.fixtures");
const storage_service_1 = require("../storage/storage.service");
const productInclude = {
    category: true,
    tags: true,
    variants: {
        include: {
            prices: true,
        },
        orderBy: {
            createdAt: 'asc',
        },
    },
};
let CatalogService = class CatalogService {
    prisma;
    storage;
    fallbackProducts = new Map();
    constructor(prisma, storage) {
        this.prisma = prisma;
        this.storage = storage;
        for (const fixture of (0, catalog_fixtures_1.getSeedProducts)('demo')) {
            const seeded = this.createFallbackProduct({
                name: fixture.name,
                slug: fixture.slug,
                description: fixture.description,
                status: fixture.status,
                imageUrl: fixture.imageUrl ?? undefined,
                isFeatured: fixture.isFeatured ?? false,
                category: {
                    name: fixture.category.name,
                    slug: fixture.category.slug,
                },
                tags: fixture.tags.map((tag) => ({
                    name: tag.name,
                    slug: tag.slug,
                })),
                variants: fixture.variants.map((variant) => ({
                    sku: variant.sku,
                    title: variant.title,
                    attributes: variant.attributes,
                    prices: variant.prices.map((price) => ({
                        currencyCode: price.currencyCode,
                        amount: price.amount,
                        compareAtAmount: price.compareAtAmount ?? undefined,
                    })),
                    inventoryOnHand: variant.inventoryOnHand,
                    inventoryReserved: variant.inventoryReserved ?? 0,
                    isActive: variant.isActive ?? true,
                })),
            });
            this.fallbackProducts.set(seeded.id, seeded);
        }
    }
    async listProducts() {
        if (this.prisma.isReady()) {
            const products = await this.prisma.product.findMany({
                include: productInclude,
                orderBy: {
                    createdAt: 'desc',
                },
            });
            const items = products.map((product) => this.toView(product));
            return {
                items,
                total: items.length,
            };
        }
        const items = [...this.fallbackProducts.values()];
        return {
            items,
            total: items.length,
        };
    }
    async getProductBySlug(slug) {
        if (this.prisma.isReady()) {
            const product = await this.prisma.product.findUnique({
                where: { slug },
                include: productInclude,
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product with slug \`${slug}\` was not found.`);
            }
            return this.toView(product);
        }
        const product = [...this.fallbackProducts.values()].find((item) => item.slug === slug);
        if (!product) {
            throw new common_1.NotFoundException(`Product with slug \`${slug}\` was not found.`);
        }
        return product;
    }
    async listCategories() {
        if (this.prisma.isReady()) {
            return this.prisma.category.findMany({
                orderBy: { name: 'asc' },
            });
        }
        const categories = new Map();
        for (const product of this.fallbackProducts.values()) {
            if (product.category) {
                categories.set(product.category.slug, product.category);
            }
        }
        return [...categories.values()];
    }
    async listTags() {
        if (this.prisma.isReady()) {
            return this.prisma.tag.findMany({
                orderBy: { name: 'asc' },
            });
        }
        const tags = new Map();
        for (const product of this.fallbackProducts.values()) {
            for (const tag of product.tags) {
                tags.set(tag.slug, tag);
            }
        }
        return [...tags.values()];
    }
    async createProduct(input) {
        if (this.prisma.isReady()) {
            const created = await this.prisma.product.create({
                data: this.buildCreateInput(input),
                include: productInclude,
            });
            return this.toView(created);
        }
        const product = this.createFallbackProduct(input);
        this.fallbackProducts.set(product.id, product);
        return product;
    }
    async uploadProductImage(id, file) {
        const existing = await this.getProductByIdForWrite(id);
        if (existing.status === client_1.ProductStatus.ARCHIVED) {
            throw new common_1.BadRequestException('Archived products cannot accept media uploads.');
        }
        const extension = this.resolveImageExtension(file);
        const previousKey = existing.imageKey ?? null;
        const bucket = this.storage.getDefaultBucket();
        const uploaded = await this.storage.uploadObject({
            bucket,
            key: this.buildProductImageKey(id, extension),
            body: file.buffer,
            contentType: file.mimetype,
            contentLength: file.size,
        });
        try {
            if (this.prisma.isReady()) {
                const updated = await this.prisma.product.update({
                    where: { id },
                    data: {
                        imageUrl: uploaded.url,
                        imageKey: uploaded.key,
                    },
                    include: productInclude,
                });
                if (previousKey && previousKey !== uploaded.key) {
                    await this.tryDeleteObject(bucket, previousKey);
                }
                return this.toView(updated);
            }
            const fallbackProduct = this.fallbackProducts.get(id);
            if (!fallbackProduct) {
                throw new common_1.NotFoundException(`Product with id \`${id}\` was not found.`);
            }
            const updated = {
                ...fallbackProduct,
                imageUrl: uploaded.url,
                imageKey: uploaded.key,
            };
            this.fallbackProducts.set(id, updated);
            if (previousKey && previousKey !== uploaded.key) {
                await this.tryDeleteObject(bucket, previousKey);
            }
            return updated;
        }
        catch (error) {
            await this.tryDeleteObject(bucket, uploaded.key);
            throw error;
        }
    }
    async deleteProductImage(id) {
        const existing = await this.getProductByIdForWrite(id);
        const bucket = this.storage.getDefaultBucket();
        if (existing.imageKey) {
            await this.tryDeleteObject(bucket, existing.imageKey);
        }
        if (this.prisma.isReady()) {
            const updated = await this.prisma.product.update({
                where: { id },
                data: {
                    imageUrl: null,
                    imageKey: null,
                },
                include: productInclude,
            });
            return this.toView(updated);
        }
        const fallbackProduct = this.fallbackProducts.get(id);
        if (!fallbackProduct) {
            throw new common_1.NotFoundException(`Product with id \`${id}\` was not found.`);
        }
        const updated = {
            ...fallbackProduct,
            imageUrl: null,
            imageKey: null,
        };
        this.fallbackProducts.set(id, updated);
        return updated;
    }
    async resolveVariantSnapshot(sku, currencyCode) {
        const normalizedCurrency = currencyCode.toUpperCase();
        if (this.prisma.isReady()) {
            const variant = await this.prisma.productVariant.findUnique({
                where: { sku },
                include: {
                    product: true,
                    prices: true,
                },
            });
            if (!variant) {
                throw new common_1.NotFoundException(`Variant with SKU \`${sku}\` was not found.`);
            }
            const price = this.selectPrice(variant.prices, normalizedCurrency);
            return {
                productId: variant.productId,
                variantId: variant.id,
                productName: variant.product.name,
                variantName: variant.title,
                sku: variant.sku,
                attributes: variant.attributes,
                currencyCode: price.currencyCode,
                unitPrice: Number(price.amount),
                compareAtAmount: price.compareAtAmount !== null && price.compareAtAmount !== undefined
                    ? Number(price.compareAtAmount)
                    : null,
                inventoryOnHand: variant.inventoryOnHand,
                inventoryReserved: variant.inventoryReserved,
            };
        }
        for (const product of this.fallbackProducts.values()) {
            const variant = product.variants.find((item) => item.sku === sku);
            if (!variant) {
                continue;
            }
            const price = this.selectPrice(variant.prices, normalizedCurrency);
            return {
                productId: product.id,
                variantId: variant.id,
                productName: product.name,
                variantName: variant.title,
                sku: variant.sku,
                attributes: variant.attributes,
                currencyCode: price.currencyCode,
                unitPrice: price.amount,
                compareAtAmount: price.compareAtAmount ?? null,
                inventoryOnHand: variant.inventoryOnHand,
                inventoryReserved: variant.inventoryReserved,
            };
        }
        throw new common_1.NotFoundException(`Variant with SKU \`${sku}\` was not found.`);
    }
    async updateProduct(id, input) {
        if (this.prisma.isReady()) {
            const existing = await this.prisma.product.findUnique({
                where: { id },
            });
            if (!existing) {
                throw new common_1.NotFoundException(`Product with id \`${id}\` was not found.`);
            }
            const updated = await this.prisma.product.update({
                where: { id },
                data: this.buildUpdateInput(input),
                include: productInclude,
            });
            return this.toView(updated);
        }
        const existing = this.fallbackProducts.get(id);
        if (!existing) {
            throw new common_1.NotFoundException(`Product with id \`${id}\` was not found.`);
        }
        const updated = {
            ...existing,
            name: input.name ?? existing.name,
            slug: input.slug ?? existing.slug,
            description: input.description ?? existing.description,
            status: input.status ?? existing.status,
            imageUrl: input.imageUrl ?? existing.imageUrl,
            imageKey: existing.imageKey,
            isFeatured: input.isFeatured ?? existing.isFeatured,
            category: input.category === undefined
                ? existing.category
                : input.category
                    ? {
                        id: existing.category?.id ?? (0, node_crypto_1.randomUUID)(),
                        name: input.category.name,
                        slug: input.category.slug,
                    }
                    : null,
            tags: input.tags === undefined
                ? existing.tags
                : input.tags.map((tag) => ({
                    id: (0, node_crypto_1.randomUUID)(),
                    name: tag.name,
                    slug: tag.slug,
                })),
            variants: input.variants === undefined
                ? existing.variants
                : input.variants.map((variant) => this.createFallbackVariant(variant)),
        };
        this.fallbackProducts.set(id, updated);
        return updated;
    }
    buildCreateInput(input) {
        return {
            name: input.name,
            slug: input.slug,
            description: input.description,
            status: input.status ?? client_1.ProductStatus.DRAFT,
            imageUrl: input.imageUrl,
            isFeatured: input.isFeatured ?? false,
            category: input.category
                ? {
                    connectOrCreate: {
                        where: { slug: input.category.slug },
                        create: {
                            name: input.category.name,
                            slug: input.category.slug,
                        },
                    },
                }
                : undefined,
            tags: input.tags?.length
                ? {
                    connectOrCreate: input.tags.map((tag) => ({
                        where: { slug: tag.slug },
                        create: {
                            name: tag.name,
                            slug: tag.slug,
                        },
                    })),
                }
                : undefined,
            variants: {
                create: input.variants.map((variant) => ({
                    sku: variant.sku,
                    title: variant.title,
                    attributes: variant.attributes,
                    inventoryOnHand: variant.inventoryOnHand ?? 0,
                    inventoryReserved: variant.inventoryReserved ?? 0,
                    isActive: variant.isActive ?? true,
                    prices: {
                        create: variant.prices.map((price) => ({
                            currencyCode: price.currencyCode.toUpperCase(),
                            amount: new client_1.Prisma.Decimal(price.amount),
                            compareAtAmount: price.compareAtAmount !== undefined
                                ? new client_1.Prisma.Decimal(price.compareAtAmount)
                                : undefined,
                        })),
                    },
                })),
            },
        };
    }
    buildUpdateInput(input) {
        return {
            name: input.name,
            slug: input.slug,
            description: input.description,
            status: input.status,
            imageUrl: input.imageUrl,
            isFeatured: input.isFeatured,
            category: input.category
                ? {
                    connectOrCreate: {
                        where: { slug: input.category.slug },
                        create: {
                            name: input.category.name,
                            slug: input.category.slug,
                        },
                    },
                }
                : undefined,
            tags: input.tags
                ? {
                    set: [],
                    connectOrCreate: input.tags.map((tag) => ({
                        where: { slug: tag.slug },
                        create: {
                            name: tag.name,
                            slug: tag.slug,
                        },
                    })),
                }
                : undefined,
            variants: input.variants
                ? {
                    deleteMany: {},
                    create: input.variants.map((variant) => ({
                        sku: variant.sku,
                        title: variant.title,
                        attributes: variant.attributes,
                        inventoryOnHand: variant.inventoryOnHand ?? 0,
                        inventoryReserved: variant.inventoryReserved ?? 0,
                        isActive: variant.isActive ?? true,
                        prices: {
                            create: variant.prices.map((price) => ({
                                currencyCode: price.currencyCode.toUpperCase(),
                                amount: new client_1.Prisma.Decimal(price.amount),
                                compareAtAmount: price.compareAtAmount !== undefined
                                    ? new client_1.Prisma.Decimal(price.compareAtAmount)
                                    : undefined,
                            })),
                        },
                    })),
                }
                : undefined,
        };
    }
    selectPrice(prices, currencyCode) {
        const normalizedCurrency = currencyCode.toUpperCase();
        const price = prices.find((candidate) => candidate.currencyCode.toUpperCase() === normalizedCurrency) ??
            prices.find((candidate) => candidate.currencyCode.toUpperCase() === 'USD') ??
            prices[0];
        if (!price) {
            throw new common_1.NotFoundException(`No catalog price exists for currency \`${normalizedCurrency}\`.`);
        }
        return price;
    }
    toView(product) {
        return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            status: product.status,
            imageUrl: product.imageUrl,
            imageKey: product.imageKey,
            isFeatured: product.isFeatured,
            category: product.category
                ? {
                    id: product.category.id,
                    name: product.category.name,
                    slug: product.category.slug,
                }
                : null,
            tags: product.tags.map((tag) => ({
                id: tag.id,
                name: tag.name,
                slug: tag.slug,
            })),
            variants: product.variants.map((variant) => ({
                id: variant.id,
                sku: variant.sku,
                title: variant.title,
                attributes: variant.attributes,
                inventoryOnHand: variant.inventoryOnHand,
                inventoryReserved: variant.inventoryReserved,
                isActive: variant.isActive,
                prices: variant.prices.map((price) => ({
                    currencyCode: price.currencyCode,
                    amount: Number(price.amount),
                    compareAtAmount: price.compareAtAmount !== null
                        ? Number(price.compareAtAmount)
                        : null,
                })),
            })),
        };
    }
    createFallbackProduct(input) {
        return {
            id: (0, node_crypto_1.randomUUID)(),
            name: input.name,
            slug: input.slug,
            description: input.description,
            status: input.status ?? client_1.ProductStatus.DRAFT,
            imageUrl: input.imageUrl,
            imageKey: null,
            isFeatured: input.isFeatured ?? false,
            category: input.category
                ? {
                    id: (0, node_crypto_1.randomUUID)(),
                    name: input.category.name,
                    slug: input.category.slug,
                }
                : null,
            tags: (input.tags ?? []).map((tag) => ({
                id: (0, node_crypto_1.randomUUID)(),
                name: tag.name,
                slug: tag.slug,
            })),
            variants: input.variants.map((variant) => this.createFallbackVariant(variant)),
        };
    }
    createFallbackVariant(variant) {
        return {
            id: (0, node_crypto_1.randomUUID)(),
            sku: variant.sku,
            title: variant.title,
            attributes: variant.attributes,
            inventoryOnHand: variant.inventoryOnHand ?? 0,
            inventoryReserved: variant.inventoryReserved ?? 0,
            isActive: variant.isActive ?? true,
            prices: variant.prices.map((price) => ({
                currencyCode: price.currencyCode.toUpperCase(),
                amount: price.amount,
                compareAtAmount: price.compareAtAmount ?? null,
            })),
        };
    }
    async getProductByIdForWrite(id) {
        if (this.prisma.isReady()) {
            const product = await this.prisma.product.findUnique({
                where: { id },
                include: productInclude,
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product with id \`${id}\` was not found.`);
            }
            return this.toView(product);
        }
        const fallbackProduct = this.fallbackProducts.get(id);
        if (!fallbackProduct) {
            throw new common_1.NotFoundException(`Product with id \`${id}\` was not found.`);
        }
        return fallbackProduct;
    }
    resolveImageExtension(file) {
        const normalizedMimeType = file.mimetype.toLowerCase();
        switch (normalizedMimeType) {
            case 'image/jpeg':
            case 'image/jpg':
                return '.jpg';
            case 'image/png':
                return '.png';
            case 'image/webp':
                return '.webp';
            default:
                throw new common_1.BadRequestException('Only JPEG, PNG, and WebP product images are supported.');
        }
    }
    buildProductImageKey(productId, extension) {
        return `products/${productId}/hero-${Date.now()}-${(0, node_crypto_1.randomUUID)().slice(0, 8)}${extension}`;
    }
    async tryDeleteObject(bucket, key) {
        try {
            await this.storage.deleteObject({ bucket, key });
        }
        catch {
        }
    }
};
exports.CatalogService = CatalogService;
exports.CatalogService = CatalogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService])
], CatalogService);
//# sourceMappingURL=catalog.service.js.map