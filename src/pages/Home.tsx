import { Header } from '@/components/Header/Header';
import { CategoryButton } from '@/components/CategoryButton/CategoryButton';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import { useUIStore } from '@/lib/store';
import { CATEGORIES, PRODUCTS } from '@/data/products';
import { getTranslation } from '@/lib/i18n/translations';
import { Wifi, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function Home() {
  const { language, searchQuery } = useUIStore();
  const t = getTranslation(language);
  const [copied, setCopied] = useState(false);

  const copyWifiPassword = () => {
    navigator.clipboard.writeText('asanaki81');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sortedCategories = [...CATEGORIES].sort((a, b) => a.order - b.order);

  // Filter products based on search query
  const filteredProducts = searchQuery.trim()
    ? PRODUCTS.filter((product) => {
      const query = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.descriptionVi?.toLowerCase().includes(query) ||
        product.descriptionJa?.toLowerCase().includes(query) ||
        product.descriptionKo?.toLowerCase().includes(query)
      );
    })
    : [];

  const showSearchResults = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar />
        </div>

        {showSearchResults ? (
          /* Search Results */
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'}
            </h2>
            {filteredProducts.length > 0 ? (
              <div className="grid gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} language={language} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found</p>
              </div>
            )}
          </div>
        ) : (
          /* Categories Grid */
          <div className="flex flex-col border-t border-[#C9C6C6] mb-4">
            {sortedCategories.map((category) => (
              <CategoryButton
                key={category.id}
                category={category}
                language={language}
              />
            ))}
          </div>
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
