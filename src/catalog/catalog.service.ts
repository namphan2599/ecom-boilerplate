import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus} from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
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

@Injectable()
export class CatalogService {
  private readonly fallbackProducts = new Map<string, CatalogProductView>();

  constructor(private readonly prisma: PrismaService) {
    const seeded = this.createFallbackProduct({
      name: 'Aura Signature Hoodie',
      slug: 'aura-signature-hoodie',
      description: 'Heavyweight everyday hoodie with multi-currency pricing.',
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      category: {
        name: 'Apparel',
        slug: 'apparel',
      },
      tags: [
        { name: 'Featured', slug: 'featured' },
        { name: 'Outerwear', slug: 'outerwear' },
      ],
      variants: [
        {
          sku: 'HOODIE-BLK-M',
          title: 'Black / Medium',
          attributes: { color: 'black', size: 'M' },
          prices: [
            { currencyCode: 'USD', amount: 79.99, compareAtAmount: 89.99 },
            { currencyCode: 'EUR', amount: 74.99 },
          ],
          inventoryOnHand: 24,
          inventoryReserved: 0,
          isActive: true,
        },
      ],
    });

    this.fallbackProducts.set(seeded.id, seeded);
  }

  async listProducts(): Promise<{ items: CatalogProductView[]; total: number }> {
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
      throw new NotFoundException(`Product with slug \`${slug}\` was not found.`);
    }

    return product;
  }

  async listCategories(): Promise<Array<{ id: string; name: string; slug: string }>> {
    if (this.prisma.isReady()) {
      return this.prisma.category.findMany({
        orderBy: { name: 'asc' },
      });
    }

    const categories = new Map<string, { id: string; name: string; slug: string }>();
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
          : input.variants.map((variant) => this.createFallbackVariant(variant)),
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

  private toView(product: ProductWithRelations): CatalogProductView {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      status: product.status,
      imageUrl: product.imageUrl,
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
            price.compareAtAmount !== null ? Number(price.compareAtAmount) : null,
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
      variants: input.variants.map((variant) => this.createFallbackVariant(variant)),
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
}
