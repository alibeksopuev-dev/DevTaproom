export type Language = 'en' | 'vi' | 'ja' | 'ko';

export interface Translation {
  // Header
  appTitle: string;

  // Categories
  categories: {
    beers: string;
    snacks: string;
    drinks: string;
    wines: string;
    bottles: string;
  };

  // Common UI
  addToCart: string;
  viewCart: string;
  cart: string;
  search: string;
  searchPlaceholder: string;
  back: string;
  close: string;
  added: string;

  // Cart
  yourCart: string;
  emptyCart: string;
  emptyCartMessage: string;
  browseMenu: string;
  orderNotes: string;
  orderNotesPlaceholder: string;
  subtotal: string;
  total: string;
  sendOrder: string;
  itemsInCart: string;

  // Product details
  priceLabel: string;
  quantity: string;
  remove: string;
  selectSize: string;
  size: string;

  // WhatsApp message
  newOrder: string;
  notes: string;

  // Footer
  established: string;
  reviewsOn: string;
  newsOn: string;
  footerMessage: string;
  wifiNetwork: string;
  wifiPassword: string;
  copied: string;
}
