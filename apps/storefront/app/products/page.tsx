import { getCatalogProducts, getCategories } from '@/lib/product';
import { toProductCard } from '@/lib/mappers';
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