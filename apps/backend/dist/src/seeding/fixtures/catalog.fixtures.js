"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeedProducts = getSeedProducts;
const client_1 = require("@prisma/client");
const DEMO_PRODUCTS = [
    {
        name: 'Aura Signature Hoodie',
        slug: 'aura-signature-hoodie',
        description: 'Heavyweight everyday hoodie with multi-currency pricing.',
        status: client_1.ProductStatus.ACTIVE,
        isFeatured: true,
        category: {
            name: 'Apparel',
            slug: 'apparel',
            description: 'Core apparel and wardrobe staples.',
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
                inventoryOnHand: 24,
                inventoryReserved: 0,
                isActive: true,
                prices: [
                    { currencyCode: 'USD', amount: 79.99, compareAtAmount: 89.99 },
                    { currencyCode: 'EUR', amount: 74.99 },
                ],
            },
        ],
    },
    {
        name: 'Aura Everyday Tee',
        slug: 'aura-everyday-tee',
        description: 'Soft cotton tee for daily wear.',
        status: client_1.ProductStatus.ACTIVE,
        isFeatured: true,
        category: {
            name: 'Apparel',
            slug: 'apparel',
            description: 'Core apparel and wardrobe staples.',
        },
        tags: [
            { name: 'Featured', slug: 'featured' },
            { name: 'Summer', slug: 'summer' },
        ],
        variants: [
            {
                sku: 'TEE-BLK-M',
                title: 'Black / Medium',
                attributes: { color: 'black', size: 'M' },
                inventoryOnHand: 48,
                inventoryReserved: 0,
                isActive: true,
                prices: [
                    { currencyCode: 'USD', amount: 29.99 },
                    { currencyCode: 'EUR', amount: 27.99 },
                ],
            },
        ],
    },
];
function getSeedProducts(profile = 'demo') {
    const selected = profile === 'minimal' ? DEMO_PRODUCTS.slice(0, 1) : DEMO_PRODUCTS;
    return selected.map((product) => ({
        ...product,
        category: { ...product.category },
        tags: product.tags.map((tag) => ({ ...tag })),
        variants: product.variants.map((variant) => ({
            ...variant,
            attributes: { ...variant.attributes },
            prices: variant.prices.map((price) => ({ ...price })),
        })),
    }));
}
//# sourceMappingURL=catalog.fixtures.js.map