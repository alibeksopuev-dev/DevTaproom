import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header/Header';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import { useUIStore } from '@/lib/store';
import { useMenuByCategory } from '@/lib/useMenu';
import { Loader2 } from 'lucide-react';

export function CategoryView() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { language, searchQuery } = useUIStore();

  // Fetch data from Supabase
  const { category, items, isLoading, error } = useMenuByCategory(categoryId ?? '');

  // Filter by search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    return items.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.subcategory?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  // Group filtered products by subcategory
  const filteredGroupedProducts = useMemo(() => {
    const groups: Record<string, typeof filteredProducts> = {};

    filteredProducts.forEach((product) => {
      const key = product.subcategory || 'main';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(product);
    });

    return groups;
  }, [filteredProducts]);

  const getCategoryName = () => {
    if (!category) return '';
    switch (language) {
      case 'vi':
        return category.nameVi;
      case 'ja':
        return category.nameJa;
      default:
        return category.name;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load menu: {error}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-gray-600">Category not found</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Category Title */}
        <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide mb-4">
          {getCategoryName()}
        </h2>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar />
        </div>

        {/* Products */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {searchQuery
                ? `No results found for "${searchQuery}"`
                : 'No products in this category'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(filteredGroupedProducts).map(([subcategory, products]) => (
              <div key={subcategory}>
                {subcategory !== 'main' && (
                  <h3 className="text-lg font-semibold text-gray-700 uppercase tracking-wide mb-4 border-b border-gray-200 pb-2">
                    {subcategory}
                  </h3>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      language={language}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
