import type {
  CatalogPriceView,
  CatalogProductView,
  ProductCardModel,
} from './types';

function selectPrice(prices: CatalogPriceView[], preferredCurrency = 'USD'): CatalogPriceView {
  return (
    prices.find((price) => price.currencyCode.toUpperCase() === preferredCurrency.toUpperCase()) ??
    prices[0] ??
    { currencyCode: preferredCurrency, amount: 0, compareAtAmount: null }
  );
}

export function getPrimaryPrice(
  product: CatalogProductView,
  preferredCurrency = 'USD',
): CatalogPriceView {
  const firstActiveVariant = product.variants.find((variant) => variant.isActive) ?? product.variants[0];
  return selectPrice(firstActiveVariant?.prices ?? [], preferredCurrency);
}

export function toProductCard(
  product: CatalogProductView,
  preferredCurrency = 'USD',
): ProductCardModel {
  const primaryPrice = getPrimaryPrice(product, preferredCurrency);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description ?? 'Aura catalog product',
    imageUrl: product.imageUrl,
    categoryLabel: product.category?.name ?? 'Aura catalog',
    tagLabels: product.tags.map((tag) => tag.name),
    priceAmount: primaryPrice.amount,
    priceCurrencyCode: primaryPrice.currencyCode,
    compareAtAmount: primaryPrice.compareAtAmount ?? null,
    variantCount: product.variants.length,
    featured: product.isFeatured,
  };
}

export function filterProducts(
  products: CatalogProductView[],
  searchText?: string,
  categorySlug?: string,
): CatalogProductView[] {
  const normalizedQuery = searchText?.trim().toLowerCase();

  return products.filter((product) => {
    const matchesQuery =
      !normalizedQuery ||
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.description?.toLowerCase().includes(normalizedQuery) ||
      product.tags.some((tag) => tag.name.toLowerCase().includes(normalizedQuery));

    const matchesCategory =
      !categorySlug || product.category?.slug.toLowerCase() === categorySlug.toLowerCase();

    return matchesQuery && matchesCategory;
  });
}
