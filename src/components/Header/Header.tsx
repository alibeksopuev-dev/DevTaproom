import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LanguageSwitcher } from '@/components/LanguageSwitcher/LanguageSwitcher';
import { useCartStore } from '@/lib/store';
import logo from '@/assets/eightyone.png';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const itemCount = useCartStore((state) => state.getItemCount());

  const isHome = location.pathname === '/';

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Back Button or Logo */}
          <div className="flex items-center min-w-[44px]">
            {!isHome ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="min-h-[44px] min-w-[44px]"
              >
                <ArrowLeft size={20} />
              </Button>
            ) : (
              <div className="w-[44px]" />
            )}
          </div>

          {/* Center: Title */}
          <Link to="/" className="flex-1 text-center">
            <div className="flex justify-center">
              <img src={logo} alt="81 Taproom" className="h-8 w-40 object-contain" />
            </div>
          </Link>

          {/* Right: Language Switcher and Cart */}
          <div className="flex items-center">
            <LanguageSwitcher />

            <Link to="/cart">
              <Button
                variant="ghost"
                size="sm"
                className="relative min-h-[44px] min-w-[44px]"
              >
                <ShoppingCart size={20} fill={itemCount > 0 ? 'currentColor' : 'none'} />
                {itemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 px-1.5 text-xs"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
