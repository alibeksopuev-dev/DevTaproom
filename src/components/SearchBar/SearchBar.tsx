import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/lib/store';
import { getTranslation } from '@/lib/i18n/translations';

export function SearchBar() {
  const { language, searchQuery, setSearchQuery } = useUIStore();
  const t = getTranslation(language);

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <Search size={18} className="text-gray-400" />
      </div>

      <Input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t.searchPlaceholder}
        className="pl-10 pr-10 h-12 text-base"
      />

      {searchQuery && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
        >
          <X size={18} />
        </Button>
      )}
    </div>
  );
}
