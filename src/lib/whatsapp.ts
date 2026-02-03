import type { CartItem } from '@/types/menu';
import type { Language } from '@/types/i18n';
import { getTranslation } from './i18n/translations';
import { formatPrice } from './utils';

const WHATSAPP_PHONE = '+84367871781';

export function generateWhatsAppMessage(
  cartItems: CartItem[],
  orderNotes: string,
  language: Language
): string {
  const t = getTranslation(language);

  let message = `${t.newOrder}\n\n`;

  // Add items
  cartItems.forEach((item, index) => {
    const { product, quantity, selectedSize } = item;

    // Calculate item price based on selected size for beers
    let itemPrice = product.price;
    if (selectedSize && product.metadata?.beer) {
      const beerMeta = product.metadata.beer;
      if (selectedSize === '0.33' && beerMeta.size033ml) {
        itemPrice = beerMeta.size033ml;
      } else if (selectedSize === '0.50' && beerMeta.size050ml) {
        itemPrice = beerMeta.size050ml;
      }
    }

    const itemTotal = itemPrice * quantity;
    const sizeInfo = selectedSize ? ` (${selectedSize}L)` : '';
    message += `${index + 1}. ${product.name}${sizeInfo}\n`;
    message += `   ${quantity}x × ${formatPrice(itemPrice)} = ${formatPrice(itemTotal)}\n\n`;
  });

  // Add total
  const total = cartItems.reduce((sum, item) => {
    let itemPrice = item.product.price;
    if (item.selectedSize && item.product.metadata?.beer) {
      const beerMeta = item.product.metadata.beer;
      if (item.selectedSize === '0.33' && beerMeta.size033ml) {
        itemPrice = beerMeta.size033ml;
      } else if (item.selectedSize === '0.50' && beerMeta.size050ml) {
        itemPrice = beerMeta.size050ml;
      }
    }
    return sum + itemPrice * item.quantity;
  }, 0);
  message += `${t.total}: ${formatPrice(total)}\n`;

  // Add notes if present
  if (orderNotes.trim()) {
    message += `\n${t.notes}: ${orderNotes}\n`;
  }

  return message;
}

export function sendToWhatsApp(
  cartItems: CartItem[],
  orderNotes: string,
  language: Language,
  clearCart: () => void
): void {
  const message = generateWhatsAppMessage(cartItems, orderNotes, language);
  const encodedMessage = encodeURIComponent(message);

  // Remove + from phone number for WhatsApp API
  const phoneNumber = WHATSAPP_PHONE.replace('+', '');

  // Construct WhatsApp URL
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  // Open WhatsApp
  window.open(whatsappUrl, '_blank');

  // Clear cart after sending
  clearCart();
}
