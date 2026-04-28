import { getCatalogProducts, getCategories } from '@/lib/aura/client';
import { toProductCard } from '@/lib/aura/mappers';
import { ProductList } from '@/components/catalog/product-list';

export default async function ProductsPage() {
  const [{ items }, categories] = await Promise.all([
    getCatalogProducts(),
    getCategories(),
  ]);

  return (
    <ProductList
      products={items.map((item) => toProductCard(item))}
      categories={categories}
    />
  );
}