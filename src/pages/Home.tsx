import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header/Header';
import { CategoryButton } from '@/components/CategoryButton/CategoryButton';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import { useUIStore } from '@/lib/store';
import { getTranslation } from '@/lib/i18n/translations';
import { Wifi, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetCategoriesQuery, useGetMenuItemsQuery } from '@/entities/menuItems/api';
import { toFrontendCategory, toFrontendProduct } from '@/lib/useMenu';

export function Home() {
  const { language } = useUIStore();
  const t = getTranslation(language);
  const [copied, setCopied] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Search state
  const searchQuery = searchParams.get('search') || '';
  const [inputValue, setInputValue] = useState(searchQuery);

  // Sync input with URL (for back navigation)
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
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [inputValue, setSearchParams, searchParams, searchQuery]);

  // Fetch Categories
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useGetCategoriesQuery();

  // Fetch Menu Items (only if searching)
  const isSearching = !!searchQuery;
  const {
    data: searchResultsData,
    isLoading: searchLoading,
    error: searchError
  } = useGetMenuItemsQuery({
    limit: 50,
    offset: 0,
    filters: {
      name: searchQuery,
      is_disabled: false
    }
  }, {
    skip: !isSearching
  });

  const copyWifiPassword = () => {
    navigator.clipboard.writeText('asanaki81');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Transform and sort categories
  const sortedCategories = useMemo(() =>
    (categoriesData || [])
      .map((cat, idx) => toFrontendCategory(cat, idx))
      .sort((a, b) => a.order - b.order),
    [categoriesData]
  );

  // Transform search results
  const searchResults = useMemo(() => {
    if (!searchResultsData?.items) return [];
    return searchResultsData.items.map(item => {
      const categorySlug = item.category?.slug ?? 'unknown';
      return toFrontendProduct(item, categorySlug);
    });
  }, [searchResultsData]);

  const error = categoriesError || searchError;

  if (error) {
    const errorMessage = 'status' in error ? `Error ${error.status}: ${JSON.stringify((error as any).data)}` : error.message;

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load menu: {errorMessage}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            value={inputValue}
            onChange={setInputValue}
            placeholder={t.searchPlaceholder}
          />
        </div>

        {isSearching ? (
          /* Search Results */
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {searchLoading ? 'Searching...' : `${searchResults.length} ${searchResults.length === 1 ? 'result' : 'results'}`}
            </h2>

            {searchLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid gap-4">
                {searchResults.map((product) => (
                  <ProductCard key={product.id} product={product} language={language} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        ) : (
          /* Categories Grid */
          categoriesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="flex flex-col border-t border-[#C9C6C6] mb-4">
              {sortedCategories.map((category) => (
                <CategoryButton
                  key={category.id}
                  category={category}
                  language={language}
                />
              ))}
            </div>
          )
        )}

        <div className="flex flex-col items-center gap-2 mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100/80 px-4 py-3 rounded-xl border border-gray-200/50 max-w-fit">
            <Wifi size={16} className="text-gray-500" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="font-medium">{t.wifiNetwork}</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-mono text-xs">{t.wifiPassword}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs gap-1.5 hover:bg-white"
                  onClick={copyWifiPassword}
                >
                  {copied ? (
                    <>
                      <Check size={12} className="text-green-600" />
                      <span className="text-green-600 font-medium">{t.copied}</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} className="text-gray-400" />
                      <span className="text-gray-500 group-hover:text-gray-900">Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-4 border-t border-gray-200 pt-2">
          <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-12 text-gray-600">

            <div className="flex-1 space-y-2">
              <p className="text-xs text-gray-800">
                {t.footerMessage}
              </p>
              <div className="text-xs flex flex-wrap items-center gap-x-1">
                <span>{t.reviewsOn}</span>
                <a
                  href="https://maps.app.goo.gl/W4c2ypuTR89VKKps7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium hover:text-gray-900"
                >
                  Google Maps
                </a>
                <span className="mx-1">/</span>
                <span>{t.newsOn}</span>
                <a
                  href="https://www.instagram.com/81.taproom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium hover:text-gray-900"
                >
                  Instagram
                </a>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <p className="text-xs text-gray-400">
              81 Taproom — 23 Mai Thúc Lân, Đà Nẵng, Việt Nam
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
