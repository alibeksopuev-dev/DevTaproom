import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { Language } from '@/types/i18n';
import { useCartStore } from '@/lib/store';
import { getTranslation } from '@/lib/i18n/translations';
import { sendToWhatsApp } from '@/lib/whatsapp';
import { formatPrice } from '@/lib/utils';

interface CartSummaryProps {
  language: Language;
}

export function CartSummary({ language }: CartSummaryProps) {
  const { items, orderNotes, setOrderNotes, getTotal, clearCart } = useCartStore();
  const t = getTranslation(language);

  const total = getTotal();

  const handleSendOrder = () => {
    if (items.length === 0) return;
    sendToWhatsApp(items, orderNotes, language, clearCart);
  };

  return (
    <Card className="p-6 space-y-4">
      <div>
        <label
          htmlFor="order-notes"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {t.orderNotes}
        </label>
        <Textarea
          id="order-notes"
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
          placeholder={t.orderNotesPlaceholder}
          className="min-h-[80px] resize-none"
        />
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-6">
          <span className="text-lg font-semibold text-gray-900">
            {t.total}
          </span>
          <span className="text-2xl font-bold text-gray-900">
            {formatPrice(total)}
          </span>
        </div>

        <Button
          onClick={handleSendOrder}
          disabled={items.length === 0}
          className="w-full min-h-[52px] text-base font-semibold"
          size="lg"
        >
          {t.sendOrder}
        </Button>
      </div>
    </Card>
  );
}
