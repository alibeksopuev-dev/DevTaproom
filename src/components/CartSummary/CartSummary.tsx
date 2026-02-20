import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, MessageCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { Language } from '@/types/i18n';
import { useCartStore } from '@/lib/store';
import { useAuthStore } from '@/lib/authStore';
import { getTranslation } from '@/lib/i18n/translations';
import { formatPrice } from '@/lib/utils';
import { sendToWhatsApp } from '@/lib/whatsapp';
import { useCreateOrderMutation } from '@/entities/orders/api';
import { ORGANIZATION_ID } from '@/lib/constants';

interface CartSummaryProps {
  language: Language;
}

export function CartSummary({ language }: CartSummaryProps) {
  const navigate = useNavigate();
  const { items, orderNotes, setOrderNotes, getTotal, clearCart } = useCartStore();
  const { user, discount } = useAuthStore();
  const t = getTranslation(language);
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [tableNumber, setTableNumber] = useState('');

  const subtotal = getTotal();
  const discountAmount = discount ? Math.round(subtotal * discount.discount_percent / 100) : 0;
  const total = subtotal - discountAmount;

  const handlePayWithVietQR = async () => {
    try {
      const orderItems = items.map((item) => {
        let itemPrice = item.product.price;
        if (item.selectedSize && item.product.prices && item.product.prices.length > 0) {
          const sizePrice = item.product.prices.find(p => p.size === item.selectedSize);
          if (sizePrice) itemPrice = sizePrice.price;
        }
        return {
          menu_item_id: item.product.id,
          item_name: item.product.name,
          size: item.selectedSize || undefined,
          quantity: item.quantity,
          unit_price: itemPrice,
          total_price: itemPrice * item.quantity,
        };
      });

      const result = await createOrder({
        organization_id: ORGANIZATION_ID,
        user_id: user?.id,
        total_amount: total,
        discount_percent: discount?.discount_percent || 0,
        discount_amount: discountAmount,
        notes: orderNotes || undefined,
        table_number: tableNumber || undefined,
        payment_method: 'vietqr',
        items: orderItems,
      }).unwrap();

      clearCart();
      navigate(`/order/${result.id}`);
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  const handleWhatsApp = () => {
    sendToWhatsApp(items, orderNotes, language, clearCart);
  };

  return (
    <Card className="p-6 space-y-4">
      {/* Order Notes */}
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

      {/* Table Number */}
      <div>
        <label htmlFor="table-number" className="block text-sm font-medium text-gray-700 mb-2">
          {t.tableNumber}
        </label>
        <input
          id="table-number"
          type="text"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          placeholder={t.tableNumberPlaceholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Total */}
      <div className="border-t border-gray-200 pt-4">
        {/* Discount info */}
        {discount ? (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-sm">{t.subtotal}</span>
              <span className="text-sm line-through">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-green-600">
              <span className="text-sm font-medium flex items-center gap-1">
                {discount.discount_percent}% {t.discount}
                {discount.label && <span className="text-xs text-green-500">({discount.label})</span>}
              </span>
              <span className="text-sm font-medium">-{formatPrice(discountAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">{t.total}</span>
              <span className="text-2xl font-bold text-gray-900">{formatPrice(total)}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-gray-900">
              {t.total}
            </span>
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(subtotal)}
            </span>
          </div>
        )}

        {/* Sign-in hint for anonymous users */}
        {!user && (
          <p className="text-xs text-gray-400 text-center mb-3">
            {t.signInForDiscounts}
          </p>
        )}

        {/* Payment Options */}
        <div className="space-y-3">
          <Button
            onClick={handlePayWithVietQR}
            disabled={isLoading || items.length === 0}
            className="w-full min-h-[52px] text-base font-semibold bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <QrCode className="mr-2 h-5 w-5" />
            )}
            {t.payWithVietQR}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t.orSendViaWhatsApp}</span>
            </div>
          </div>

          <Button
            onClick={handleWhatsApp}
            variant="outline"
            disabled={items.length === 0}
            className="w-full min-h-[48px] text-base"
            size="lg"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            {t.sendOrder}
          </Button>
        </div>
      </div>
    </Card>
  );
}
