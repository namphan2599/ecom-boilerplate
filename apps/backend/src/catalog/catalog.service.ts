import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { getSeedProducts } from '../seeding/fixtures/catalog.fixtures';
import { StorageService } from '../storage/storage.service';
import { CreateProductDto, ProductVariantDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const productInclude = {
  category: true,
  tags: true,
  variants: {
    include: {
      prices: true,
    },
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
} satisfies Prisma.ProductInclude;

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

export interface CatalogProductView {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  status: ProductStatus;
  imageUrl?: string | null;
  imageKey?: string | null;
  isFeatured: boolean;
  category: { id: string; name: string; slug: string } | null;
  tags: Array<{ id: string; name: string; slug: string }>;
  variants: Array<{
    id: string;
    sku: string;
    title: string;
    attributes: Record<string, string>;
    inventoryOnHand: number;
    inventoryReserved: number;
    isActive: boolean;
    prices: Array<{
      currencyCode: string;
      amount: number;
      compareAtAmount?: number | null;
    }>;
  }>;
}

export interface CatalogVariantSnapshot {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  attributes: Record<string, string>;
  currencyCode: string;
  unitPrice: number;
  compareAtAmount?: number | null;
  inventoryOnHand: number;
  inventoryReserved: number;
}

export interface ProductImageFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class CatalogService {
  private readonly fallbackProducts = new Map<string, CatalogProductView>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {
    for (const fixture of getSeedProducts('demo')) {
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

  async listProducts(): Promise<{
    items: CatalogProductView[];
    total: number;
  }> {
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

  async getProductBySlug(slug: string): Promise<CatalogProductView> {
    if (this.prisma.isReady()) {
      const product = await this.prisma.product.findUnique({
        where: { slug },
        include: productInclude,
      });

      if (!product) {
        throw new NotFoundException(
          `Product with slug \`${slug}\` was not found.`,
        );
      }

      return this.toView(product);
    }

    const product = [...this.fallbackProducts.values()].find(
      (item) => item.slug === slug,
    );

    if (!product) {
      throw new NotFoundException(
        `Product with slug \`${slug}\` was not found.`,
      );
    }

    return product;
  }

  async listCategories(): Promise<
    Array<{ id: string; name: string; slug: string }>
  > {
    if (this.prisma.isReady()) {
      return this.prisma.category.findMany({
        orderBy: { name: 'asc' },
      });
    }

    const categories = new Map<
      string,
      { id: string; name: string; slug: string }
    >();
    for (const product of this.fallbackProducts.values()) {
      if (product.category) {
        categories.set(product.category.slug, product.category);
      }
    }

    return [...categories.values()];
  }

  async listTags(): Promise<Array<{ id: string; name: string; slug: string }>> {
    if (this.prisma.isReady()) {
      return this.prisma.tag.findMany({
        orderBy: { name: 'asc' },
      });
    }

    const tags = new Map<string, { id: string; name: string; slug: string }>();
    for (const product of this.fallbackProducts.values()) {
      for (const tag of product.tags) {
        tags.set(tag.slug, tag);
      }
    }

    return [...tags.values()];
  }

  async createProduct(input: CreateProductDto): Promise<CatalogProductView> {
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

  async uploadProductImage(
    id: string,
    file: ProductImageFile,
  ): Promise<CatalogProductView> {
    const existing = await this.getProductByIdForWrite(id);

    if (existing.status === ProductStatus.ARCHIVED) {
      throw new BadRequestException(
        'Archived products cannot accept media uploads.',
      );
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
        throw new NotFoundException(`Product with id \`${id}\` was not found.`);
      }

      const updated: CatalogProductView = {
        ...fallbackProduct,
        imageUrl: uploaded.url,
        imageKey: uploaded.key,
      };

      this.fallbackProducts.set(id, updated);

      if (previousKey && previousKey !== uploaded.key) {
        await this.tryDeleteObject(bucket, previousKey);
      }

      return updated;
    } catch (error) {
      await this.tryDeleteObject(bucket, uploaded.key);
      throw error;
    }
  }

  async deleteProductImage(id: string): Promise<CatalogProductView> {
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
      throw new NotFoundException(`Product with id \`${id}\` was not found.`);
    }

    const updated: CatalogProductView = {
      ...fallbackProduct,
      imageUrl: null,
      imageKey: null,
    };

    this.fallbackProducts.set(id, updated);
    return updated;
  }

  async resolveVariantSnapshot(
    sku: string,
    currencyCode: string,
  ): Promise<CatalogVariantSnapshot> {
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
        throw new NotFoundException(
          `Variant with SKU \`${sku}\` was not found.`,
        );
      }

      const price = this.selectPrice(variant.prices, normalizedCurrency);

      return {
        productId: variant.productId,
        variantId: variant.id,
        productName: variant.product.name,
        variantName: variant.title,
        sku: variant.sku,
        attributes: variant.attributes as Record<string, string>,
        currencyCode: price.currencyCode,
        unitPrice: Number(price.amount),
        compareAtAmount:
          price.compareAtAmount !== null && price.compareAtAmount !== undefined
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

    throw new NotFoundException(`Variant with SKU \`${sku}\` was not found.`);
  }

  async updateProduct(
    id: string,
    input: UpdateProductDto,
  ): Promise<CatalogProductView> {
    if (this.prisma.isReady()) {
      const existing = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(`Product with id \`${id}\` was not found.`);
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
      throw new NotFoundException(`Product with id \`${id}\` was not found.`);
    }

    const updated: CatalogProductView = {
      ...existing,
      name: input.name ?? existing.name,
      slug: input.slug ?? existing.slug,
      description: input.description ?? existing.description,
      status: input.status ?? existing.status,
      imageUrl: input.imageUrl ?? existing.imageUrl,
      imageKey: existing.imageKey,
      isFeatured: input.isFeatured ?? existing.isFeatured,
      category:
        input.category === undefined
          ? existing.category
          : input.category
            ? {
                id: existing.category?.id ?? randomUUID(),
                name: input.category.name,
                slug: input.category.slug,
              }
            : null,
      tags:
        input.tags === undefined
          ? existing.tags
          : input.tags.map((tag) => ({
              id: randomUUID(),
              name: tag.name,
              slug: tag.slug,
            })),
      variants:
        input.variants === undefined
          ? existing.variants
          : input.variants.map((variant) =>
              this.createFallbackVariant(variant),
            ),
    };

    this.fallbackProducts.set(id, updated);
    return updated;
  }

  private buildCreateInput(input: CreateProductDto): Prisma.ProductCreateInput {
    return {
      name: input.name,
      slug: input.slug,
      description: input.description,
      status: input.status ?? ProductStatus.DRAFT,
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
              amount: new Prisma.Decimal(price.amount),
              compareAtAmount:
                price.compareAtAmount !== undefined
                  ? new Prisma.Decimal(price.compareAtAmount)
                  : undefined,
            })),
          },
        })),
      },
    };
  }

  private buildUpdateInput(input: UpdateProductDto): Prisma.ProductUpdateInput {
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
                  amount: new Prisma.Decimal(price.amount),
                  compareAtAmount:
                    price.compareAtAmount !== undefined
                      ? new Prisma.Decimal(price.compareAtAmount)
                      : undefined,
                })),
              },
            })),
          }
        : undefined,
    };
  }

  private selectPrice<T extends { currencyCode: string }>(
    prices: T[],
    currencyCode: string,
  ): T {
    const normalizedCurrency = currencyCode.toUpperCase();
    const price =
      prices.find(
        (candidate) =>
          candidate.currencyCode.toUpperCase() === normalizedCurrency,
      ) ??
      prices.find(
        (candidate) => candidate.currencyCode.toUpperCase() === 'USD',
      ) ??
      prices[0];

    if (!price) {
      throw new NotFoundException(
        `No catalog price exists for currency \`${normalizedCurrency}\`.`,
      );
    }

    return price;
  }

  private toView(product: ProductWithRelations): CatalogProductView {
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
        attributes: variant.attributes as Record<string, string>,
        inventoryOnHand: variant.inventoryOnHand,
        inventoryReserved: variant.inventoryReserved,
        isActive: variant.isActive,
        prices: variant.prices.map((price) => ({
          currencyCode: price.currencyCode,
          amount: Number(price.amount),
          compareAtAmount:
            price.compareAtAmount !== null
              ? Number(price.compareAtAmount)
              : null,
        })),
      })),
    };
  }

  private createFallbackProduct(input: CreateProductDto): CatalogProductView {
    return {
      id: randomUUID(),
      name: input.name,
      slug: input.slug,
      description: input.description,
      status: input.status ?? ProductStatus.DRAFT,
      imageUrl: input.imageUrl,
      imageKey: null,
      isFeatured: input.isFeatured ?? false,
      category: input.category
        ? {
            id: randomUUID(),
            name: input.category.name,
            slug: input.category.slug,
          }
        : null,
      tags: (input.tags ?? []).map((tag) => ({
        id: randomUUID(),
        name: tag.name,
        slug: tag.slug,
      })),
      variants: input.variants.map((variant) =>
        this.createFallbackVariant(variant),
      ),
    };
  }

  private createFallbackVariant(
    variant: ProductVariantDto,
  ): CatalogProductView['variants'][number] {
    return {
      id: randomUUID(),
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

  private async getProductByIdForWrite(
    id: string,
  ): Promise<CatalogProductView> {
    if (this.prisma.isReady()) {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: productInclude,
      });

      if (!product) {
        throw new NotFoundException(`Product with id \`${id}\` was not found.`);
      }

      return this.toView(product);
    }

    const fallbackProduct = this.fallbackProducts.get(id);
    if (!fallbackProduct) {
      throw new NotFoundException(`Product with id \`${id}\` was not found.`);
    }

    return fallbackProduct;
  }

  private resolveImageExtension(file: ProductImageFile): string {
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
        throw new BadRequestException(
          'Only JPEG, PNG, and WebP product images are supported.',
        );
    }
  }

  private buildProductImageKey(productId: string, extension: string): string {
    return `products/${productId}/hero-${Date.now()}-${randomUUID().slice(0, 8)}${extension}`;
  }

  private async tryDeleteObject(bucket: string, key: string): Promise<void> {
    try {
      await this.storage.deleteObject({ bucket, key });
    } catch {
      // Ignore cleanup failures to keep the primary request outcome stable.
    }
  }
}
