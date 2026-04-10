import { ProductStatus } from '@prisma/client';
export declare class CatalogCategoryDto {
    name: string;
    slug: string;
}
export declare class CatalogTagDto {
    name: string;
    slug: string;
}
export declare class VariantPriceDto {
    currencyCode: string;
    amount: number;
    compareAtAmount?: number;
}
export declare class ProductVariantDto {
    sku: string;
    title: string;
    attributes: Record<string, string>;
    prices: VariantPriceDto[];
    inventoryOnHand?: number;
    inventoryReserved?: number;
    isActive?: boolean;
}
export declare class CreateProductDto {
    name: string;
    slug: string;
    description?: string;
    status?: ProductStatus;
    imageUrl?: string;
    isFeatured?: boolean;
    category?: CatalogCategoryDto;
    tags?: CatalogTagDto[];
    variants: ProductVariantDto[];
}
