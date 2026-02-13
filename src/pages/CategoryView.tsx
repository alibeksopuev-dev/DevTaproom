import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { Header } from '@/components/Header/Header';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import { useUIStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';
import { useGetCategoriesQuery, useGetMenuItemsQuery } from '@/entities/menuItems/api';
import { toFrontendCategory, toFrontendProduct } from '@/lib/useMenu';
import type { Product } from '@/types/menu';
import { getTranslation } from '@/lib/i18n/translations';

export function CategoryView() {
  const { categoryId: categorySlug } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { language } = useUIStore();
  const t = getTranslation(language);
  const [searchParams, setSearchParams] = useSearchParams();

  // Search state
  const searchQuery = searchParams.get('search') || '';
  const [inputValue, setInputValue] = useState(searchQuery);

  // Sync input with URL
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Debounce search update
  useEffect(() => {
    const handler = setTimeout(() => {
      if (inputValue !== searchQuery) {
        if (inputValue) {
          setSearchParams({ search: inputValue });
        } else {
          searchParams.delete('search');
          setSearchParams(searchParams);
        }
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [inputValue, setSearchParams, searchParams, searchQuery]);

  // 1. Fetch Categories to resolve slug -> id
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery();

  const { category, categoryId } = useMemo(() => {
    if (!categoriesData || !categorySlug) return { category: null, categoryId: null };
    const found = categoriesData.find(c => c.slug === categorySlug);
    return {
      category: found ? toFrontendCategory(found, 0) : null,
      categoryId: found?.id // Actual UUID
    };
  }, [categoriesData, categorySlug]);

  // 2. Fetch Items for this category
  const {
    data: menuItemsData,
    isLoading: itemsLoading,
    error: itemsError
  } = useGetMenuItemsQuery({
    limit: 100,
    offset: 0,
    filters: {
      category_id: categoryId ?? undefined, // Supabase ID
      is_disabled: false,
      name: searchQuery // Filter by name within category
    }
  }, {
    skip: !categoryId
  });

  // Transform items
  const products = useMemo(() => {
    if (!menuItemsData?.items || !categorySlug) return [];
    return menuItemsData.items.map(item => toFrontendProduct(item, categorySlug));
  }, [menuItemsData, categorySlug]);

  // Group by subcategory
  const groupedProducts = useMemo(() => {
    const groups: Record<string, Product[]> = {};
    products.forEach(product => {
      const key = product.subcategory || 'Main';
      if (!groups[key]) groups[key] = [];
      groups[key].push(product);
    });
    return groups;
  }, [products]);

  const isLoading = categoriesLoading || itemsLoading;
  const error = itemsError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-red-500">
            {!category ? 'Category not found' : 'Failed to load items'}
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide mb-4">
          {category.name}
        </h2>
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
              value={inputValue}
              onChange={setInputValue}
              placeholder={t.searchPlaceholder}
          />
        </div>

        <div className="space-y-8">
          {products.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {searchQuery ? (t as any).noResults || 'No results found' : 'No items in this category'}
              </p>
          ) : (
              Object.entries(groupedProducts).map(([subcategory, items]) => (
                  <div key={subcategory}>
                    {subcategory !== 'Main' && (
                        <h2 className="text-lg font-semibold text-gray-700 mb-3 px-1">
                          {subcategory}
                        </h2>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2">
                      {items.map((product) => (
                          <ProductCard key={product.id} product={product} language={language}/>
                      ))}
                    </div>
                  </div>
              ))
          )}
        </div>
      </main>
    </div>
  );
}
