import { ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export interface CatalogProductView {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    status: ProductStatus;
    imageUrl?: string | null;
    imageKey?: string | null;
    isFeatured: boolean;
    category: {
        id: string;
        name: string;
        slug: string;
    } | null;
    tags: Array<{
        id: string;
        name: string;
        slug: string;
    }>;
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
export declare class CatalogService {
    private readonly prisma;
    private readonly storage;
    private readonly fallbackProducts;
    constructor(prisma: PrismaService, storage: StorageService);
    listProducts(): Promise<{
        items: CatalogProductView[];
        total: number;
    }>;
    getProductBySlug(slug: string): Promise<CatalogProductView>;
    listCategories(): Promise<Array<{
        id: string;
        name: string;
        slug: string;
    }>>;
    listTags(): Promise<Array<{
        id: string;
        name: string;
        slug: string;
    }>>;
    createProduct(input: CreateProductDto): Promise<CatalogProductView>;
    uploadProductImage(id: string, file: ProductImageFile): Promise<CatalogProductView>;
    deleteProductImage(id: string): Promise<CatalogProductView>;
    resolveVariantSnapshot(sku: string, currencyCode: string): Promise<CatalogVariantSnapshot>;
    updateProduct(id: string, input: UpdateProductDto): Promise<CatalogProductView>;
    private buildCreateInput;
    private buildUpdateInput;
    private selectPrice;
    private toView;
    private createFallbackProduct;
    private createFallbackVariant;
    private getProductByIdForWrite;
    private resolveImageExtension;
    private buildProductImageKey;
    private tryDeleteObject;
}
