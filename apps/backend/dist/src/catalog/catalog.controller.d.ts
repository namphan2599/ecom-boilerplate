import { CatalogService } from './catalog.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class CatalogController {
    private readonly catalogService;
    constructor(catalogService: CatalogService);
    listProducts(): Promise<{
        items: import("./catalog.service").CatalogProductView[];
        total: number;
    }>;
    getProductBySlug(slug: string): Promise<import("./catalog.service").CatalogProductView>;
    listCategories(): Promise<{
        id: string;
        name: string;
        slug: string;
    }[]>;
    listTags(): Promise<{
        id: string;
        name: string;
        slug: string;
    }[]>;
    createProduct(input: CreateProductDto): Promise<import("./catalog.service").CatalogProductView>;
    uploadProductImage(id: string, file: {
        originalname: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
    }): Promise<import("./catalog.service").CatalogProductView>;
    deleteProductImage(id: string): Promise<import("./catalog.service").CatalogProductView>;
    updateProduct(id: string, input: UpdateProductDto): Promise<import("./catalog.service").CatalogProductView>;
}
