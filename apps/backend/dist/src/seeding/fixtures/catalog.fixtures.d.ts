import { ProductStatus } from '@prisma/client';
export type SeedProfileLike = 'minimal' | 'demo';
export interface SeedCategoryFixture {
    name: string;
    slug: string;
    description?: string;
}
export interface SeedTagFixture {
    name: string;
    slug: string;
}
export interface SeedProductPriceFixture {
    currencyCode: string;
    amount: number;
    compareAtAmount?: number | null;
}
export interface SeedProductVariantFixture {
    sku: string;
    title: string;
    attributes: Record<string, string>;
    inventoryOnHand: number;
    inventoryReserved?: number;
    isActive?: boolean;
    prices: SeedProductPriceFixture[];
}
export interface SeedProductFixture {
    name: string;
    slug: string;
    description?: string;
    status: ProductStatus;
    isFeatured?: boolean;
    category: SeedCategoryFixture;
    tags: SeedTagFixture[];
    imageUrl?: string | null;
    variants: SeedProductVariantFixture[];
}
export declare function getSeedProducts(profile?: SeedProfileLike): SeedProductFixture[];
