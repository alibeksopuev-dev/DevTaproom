# Taproom 81 - Bar Menu Application

A mobile-first React SPA for browsing a bar menu and ordering via WhatsApp. Built with React, TypeScript, Vite, Tailwind CSS, shadcn/ui, and Zustand.

## 🏗️ Project Architecture

### Tech Stack
- **React 18** with TypeScript (strict mode)
- **Vite 6** - Build tool and dev server
- **React Router** - Client-side routing
- **Zustand** - State management (cart, UI state)
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Pre-built accessible components
- **CVA** (class-variance-authority) - Component style variants
- **lucide-react** - Icon library
- **LocalStorage** - Cart and language persistence

### Key Features
- 📱 Mobile-first responsive design
- 🌍 Multi-language support (English, Vietnamese, Japanese)
- 🛒 Shopping cart with persistence
- 💬 WhatsApp order integration (+84328797611)
- 🔍 Real-time product search
- 🍺 Beer size selection (0.33L and 0.50L options)
- 🎨 Clean, minimal UI with generous whitespace

## 📁 Project Structure

```
src/
├── components/              # React components
│   ├── ui/                 # shadcn/ui components (button, input, card, badge, textarea)
│   ├── Header/             # App header with language switcher, cart icon
│   ├── SearchBar/          # Search input component
│   ├── CategoryButton/     # Category selection buttons with CVA styles
│   ├── ProductCard/        # Product display cards with CVA styles
│   ├── CartItem/           # Individual cart item with quantity controls
│   ├── CartSummary/        # Order summary and WhatsApp button
│   └── LanguageSwitcher/   # Language toggle (EN/VI/JA)
│
├── pages/                  # Route components
│   ├── Home.tsx           # Main page with category buttons
│   ├── CategoryView.tsx   # Product listing for a category
│   └── Cart.tsx           # Shopping cart and checkout
│
├── lib/                    # Utilities and logic
│   ├── utils.ts           # cn() utility (clsx + tailwind-merge)
│   ├── store.ts           # Zustand stores (cart, UI state)
│   ├── whatsapp.ts        # WhatsApp message generation
│   └── i18n/
│       └── translations.ts # Translation objects (en, vi, ja)
│
├── data/                   # Static data
│   └── products.ts        # All menu items and categories
│
├── types/                  # TypeScript types
│   ├── menu.ts            # Product, Category, CartItem types
│   └── i18n.ts            # Language, Translation types
│
├── App.tsx                # React Router setup
├── main.tsx              # App entry point
└── index.css             # Global styles and Tailwind directives
```

## 🎯 Core Concepts

### State Management (Zustand)

#### Cart Store (`useCartStore`)
Located in: `src/lib/store.ts`
- `items: CartItem[]` - Products in cart
- `orderNotes: string` - Customer notes
- `addItem(product, selectedSize?)` - Add product to cart with optional size
- `removeItem(productId, selectedSize?)` - Remove from cart
- `updateQuantity(id, qty, selectedSize?)` - Update item quantity
- `setOrderNotes(notes)` - Set order notes
- `clearCart()` - Empty the cart
- `getTotal()` - Calculate total price (accounts for beer sizes)
- `getItemCount()` - Count total items

#### UI Store (`useUIStore`)
Located in: `src/lib/store.ts`
- `language: Language` - Current language (en/vi/ja)
- `searchQuery: string` - Search input value
- `setLanguage(lang)` - Change language
- `setSearchQuery(query)` - Update search

### Styling Philosophy

**CVA Pattern** - Component styles separated from JSX

Example: `src/components/CategoryButton/category-button.styles.ts`

Benefits:
- No inline className hell
- Reusable style variants
- Component-based approach
- Easy to maintain

### Routing

- `/` → Home page (category selection)
- `/category/:categoryId` → Category products view
- `/cart` → Shopping cart and checkout

### Data Structure

#### Products (`src/data/products.ts`)
- `CATEGORIES`: Array of category definitions
- `PRODUCTS`: Array of all menu items

Product structure:
- `id`: Unique identifier
- `name`: Product name
- `description`: Product description
- `price`: Number (in thousands VND)
- `category`: CategoryId (beers/snacks/drinks/wines/bottles)
- `subcategory?`: Optional grouping
- `metadata?`: Beer specs (with size033ml/size050ml prices) or wine info

CartItem structure:
- `product`: Product object
- `quantity`: Number of items
- `selectedSize?`: BeerSize ('0.33' | '0.50') - for beers with size options

#### Categories
- `id`: CategoryId
- `name`: English name
- `nameVi`: Vietnamese name
- `nameJa`: Japanese name
- `icon`: Emoji icon
- `order`: Display order

### Translations

Location: `src/lib/i18n/translations.ts`

Usage in components:
```typescript
import { getTranslation } from '@/lib/i18n/translations';
import { useUIStore } from '@/lib/store';

const language = useUIStore(state => state.language);
const t = getTranslation(language);
// Use: t.addToCart, t.cart, t.total, etc.
```

## 🛠️ Common Development Tasks

### Adding a New Product

Edit `src/data/products.ts` and add to PRODUCTS array

### Adding a New Category

1. Update `CategoryId` type in `src/types/menu.ts`
2. Add to `CATEGORIES` in `src/data/products.ts`
3. Update translations in `src/lib/i18n/translations.ts`

### Adding New UI Text

1. Add to Translation interface in `src/types/i18n.ts`
2. Add to all language objects in `src/lib/i18n/translations.ts` (en, vi, ja)

### Creating a New Component

Structure:
```
src/components/YourComponent/
├── YourComponent.tsx
└── your-component.styles.ts  (if needed)
```

Always use:
- `cn()` utility for className merging
- `useUIStore` for language/search
- `getTranslation()` for text
- shadcn/ui components where possible
- `@/` path aliases

## 🐛 Debugging Tips

### Common Issues

**Products not showing**
- Check category ID matches
- Verify product in PRODUCTS array
- Check search filter

**Translations not updating**
- Language persisted in localStorage (`taproom-ui`)
- Clear localStorage if needed
- Ensure all Translation objects have the key

**Cart not persisting**
- Stored as `taproom-cart` in localStorage
- Check browser console for errors
- Verify Zustand persist middleware

**Build errors**
- Run `npm run build`
- Check all imports use `@/` alias
- Remove unused imports

**Styling issues**
- Verify Tailwind classes are valid
- Check `tailwind.config.ts`
- Test `cn()` utility

### Key Files for Debugging

| Issue | File to Check |
|-------|---------------|
| Products | `src/data/products.ts` |
| Translations | `src/lib/i18n/translations.ts` |
| Cart | `src/lib/store.ts` |
| Routing | `src/App.tsx` |
| Styles | `src/index.css`, `tailwind.config.ts` |
| WhatsApp | `src/lib/whatsapp.ts` |

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repo
2. Auto-detects Vite
3. Deploys on push

Files: `vercel.json` (SPA routing config)

### Commands
```bash
npm run dev      # Development
npm run build    # Production build
npm run preview  # Preview build
npm run lint     # Lint code
```

## 📝 Code Style

1. TypeScript strict mode
2. Functional components only
3. Zustand for state
4. CVA for complex styles
5. shadcn/ui components
6. Mobile-first design
7. `@/` path aliases
8. Single responsibility
9. All text via translations
10. 44px min touch targets

## 🎨 Design Tokens

Colors (in `tailwind.config.ts`):
- Background: #FAFAFA
- Foreground: #1A1A1A
- Muted: #F5F5F5
- Border: #E5E5E5

Typography:
- System fonts
- Line height: 1.6
- Large bold headings
- Gray italic descriptions

## 📞 WhatsApp Integration

Phone: **+84328797611** (Vietnam)

Change in: `src/lib/whatsapp.ts`

Message format includes:
- Product names and quantities
- Individual prices
- Total
- Customer notes

## 🌟 Future Ideas

- Product images
- Stock status
- Favorites
- Order history
- Admin panel
- Backend API
- Multiple size prices
- Table selection
- Discount codes

---

**For AI Assistants:**
- Check "Key Files for Debugging" table when fixing issues
- Follow established patterns (CVA, Zustand, translations)
- Maintain mobile-first design
- Test multiple screen sizes
- Keep TypeScript strict
- Components should be focused and reusable
- All user text goes through translation system
- Use shadcn/ui components
- No time estimates in responses
