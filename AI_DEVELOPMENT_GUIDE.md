# AI Development Guide - Taproom 81

**Quick reference for AI assistants working on this codebase**

## 🎯 Project Overview

Mobile-first bar menu React app. Customers browse products, add to cart, send orders via WhatsApp.

**Tech:** React 18 + TypeScript + Vite + Tailwind + shadcn/ui + Zustand + React Router

**No backend** - All data hardcoded in `src/data/products.ts`

## 📐 Architecture Pattern

```
Data Layer (products.ts)
    ↓
State Layer (Zustand stores in store.ts)
    ↓
Component Layer (React components)
    ↓
UI Layer (shadcn/ui + Tailwind)
```

## 🗂️ Critical Files (Memorize These)

| File | Purpose | When to Edit |
|------|---------|--------------|
| `src/data/products.ts` | All menu items | Adding/editing products |
| `src/lib/store.ts` | State management | Cart/UI state logic |
| `src/lib/i18n/translations.ts` | All UI text | New text/translations |
| `src/types/menu.ts` | Product types | New product fields |
| `src/types/i18n.ts` | Translation types | New UI text keys |
| `src/lib/whatsapp.ts` | Order messaging | WhatsApp integration |
| `src/App.tsx` | Routing | New pages/routes |
| `tailwind.config.ts` | Design tokens | Colors/spacing |

## 🔧 Common Tasks (Step by Step)

### Task: Add a New Product

1. Open `src/data/products.ts`
2. Find the `PRODUCTS` array
3. Add new object:
```typescript
{
  id: 'unique-kebab-case-id',
  name: 'Product Name',
  description: 'Description here',
  price: 120,  // thousands VND (120k)
  category: 'beers',  // or snacks/drinks/wines/bottles
  subcategory: 'OPTIONAL_GROUP_NAME'  // optional
}
```
4. For beers, add metadata:
```typescript
metadata: {
  beer: {
    ibu: 45,
    abv: 6.5,
    size033ml: 65,
    size050ml: 95
  }
}
```
5. For wines, add metadata:
```typescript
metadata: {
  wine: {
    region: 'Bordeaux',
    country: 'France',
    grapeVariety: 'Merlot',
    style: 'Bold, full-bodied'
  }
}
```

### Task: Add New UI Text

1. Open `src/types/i18n.ts`
2. Add key to `Translation` interface:
```typescript
export interface Translation {
  // ... existing
  yourNewKey: string;
}
```
3. Open `src/lib/i18n/translations.ts`
4. Add to ALL three language objects (en, vi, ja):
```typescript
const en: Translation = {
  // ... existing
  yourNewKey: 'English text here'
};

const vi: Translation = {
  // ... existing
  yourNewKey: 'Vietnamese text here'
};

const ja: Translation = {
  // ... existing
  yourNewKey: 'Japanese text here'
};
```

### Task: Fix a Bug

1. **Identify the domain:**
   - Products not showing? → `src/data/products.ts`
   - Cart issue? → `src/lib/store.ts` (useCartStore)
   - Translation missing? → `src/lib/i18n/translations.ts`
   - Routing broken? → `src/App.tsx`
   - Styling wrong? → Component file or `tailwind.config.ts`

2. **Read the relevant file** (don't guess)

3. **Make minimal changes** (don't refactor unless asked)

4. **Test with:** `npm run build` (catches TypeScript errors)

### Task: Add a New Component

1. Create directory: `src/components/ComponentName/`

2. Create `ComponentName.tsx`:
```typescript
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/store';
import { getTranslation } from '@/lib/i18n/translations';

export function ComponentName() {
  const language = useUIStore(state => state.language);
  const t = getTranslation(language);

  return (
    <div className={cn("p-4")}>
      {/* Your JSX */}
    </div>
  );
}
```

3. If complex styling, create `component-name.styles.ts`:
```typescript
import { cva } from "class-variance-authority"

export const componentVariants = cva(
  "base classes",
  {
    variants: {
      variant: {
        default: "...",
        active: "..."
      }
    }
  }
)
```

4. Use shadcn/ui components:
```typescript
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
// etc.
```

## 🚨 Critical Rules

### DO:
✅ Use `@/` imports (not relative paths)
✅ Use Zustand for state
✅ Use translations for all user text
✅ Use shadcn/ui components
✅ Keep components focused (one job)
✅ Mobile-first (test on small screens)
✅ Make touch targets 44px minimum
✅ Run `npm run build` to verify changes
✅ Follow existing code patterns
✅ Keep CVA styles in separate files

### DON'T:
❌ Use relative imports (`../../../`)
❌ Add new state management (use Zustand)
❌ Hardcode English text (use translations)
❌ Create custom UI components (use shadcn)
❌ Make components do multiple things
❌ Assume desktop screen size
❌ Create tiny touch targets
❌ Skip TypeScript errors
❌ Deviate from patterns
❌ Mix styles with JSX logic

## 🧩 Code Patterns (Copy These)

### Pattern: Using Translations
```typescript
import { useUIStore } from '@/lib/store';
import { getTranslation } from '@/lib/i18n/translations';

const language = useUIStore(state => state.language);
const t = getTranslation(language);

// Use: t.addToCart, t.cart, t.total
```

### Pattern: Using Cart Store
```typescript
import { useCartStore } from '@/lib/store';

const { items, addItem, removeItem, getTotal } = useCartStore();

// Add to cart:
addItem(product);

// Get total:
const total = getTotal();
```

### Pattern: Conditional Styling with cn()
```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes-always-applied",
  condition && "conditional-classes",
  anotherCondition ? "if-true" : "if-false"
)} />
```

### Pattern: Product Card
```typescript
<Card>
  <CardHeader>
    <CardTitle>{product.name}</CardTitle>
    <CardDescription>{product.description}</CardDescription>
  </CardHeader>
  <CardContent>
    <Badge>{product.price}k</Badge>
  </CardContent>
  <CardFooter>
    <Button onClick={() => addItem(product)}>
      <Plus className="mr-2 h-4 w-4" />
      {t.addToCart}
    </Button>
  </CardFooter>
</Card>
```

### Pattern: Search Filtering
```typescript
const searchQuery = useUIStore(state => state.searchQuery);

const filteredProducts = PRODUCTS.filter(product => {
  if (!searchQuery) return true;
  const query = searchQuery.toLowerCase();
  return (
    product.name.toLowerCase().includes(query) ||
    product.description.toLowerCase().includes(query)
  );
});
```

## 🔍 Debugging Checklist

**When user reports a bug:**

1. [ ] Read the error message completely
2. [ ] Identify which domain (see Critical Files table)
3. [ ] Read the relevant file(s)
4. [ ] Check browser console for errors
5. [ ] Check localStorage if state-related
6. [ ] Run `npm run build` to catch TypeScript issues
7. [ ] Test on mobile viewport (not just desktop)
8. [ ] Verify translations exist in all languages
9. [ ] Check network tab if data not loading
10. [ ] Look for typos in IDs/keys

**Common gotchas:**
- Category IDs must match exactly (case-sensitive)
- Product IDs must be unique
- All Translation keys need en/vi/ja versions
- Price is in thousands (120 = 120k VND)
- LocalStorage keys: `taproom-cart`, `taproom-ui`
- Phone number: +84328797611 (hardcoded in whatsapp.ts)

## 📦 Dependencies

**Don't install these** (already included):
- react, react-dom
- react-router-dom
- zustand
- tailwindcss
- class-variance-authority
- lucide-react
- clsx, tailwind-merge
- shadcn/ui (via components/ui/)

**If you need:**
- Icons → Use lucide-react (already installed)
- State → Use Zustand stores
- UI components → Check shadcn/ui first
- Styling → Use Tailwind utilities

## 🎨 Design System

**Colors** (defined in tailwind.config.ts):
```
bg-background     #FAFAFA (off-white)
text-foreground   #1A1A1A (near-black)
bg-muted          #F5F5F5 (subtle background)
border-border     #E5E5E5 (borders)
bg-primary        #1A1A1A (buttons)
```

**Spacing** (use Tailwind utilities):
```
p-4, p-6         Standard padding
gap-4, gap-6     Grid gaps
space-y-4        Vertical spacing
```

**Typography**:
```
text-3xl font-bold        Headings
text-base                 Body text
text-sm text-muted        Descriptions
font-bold                 Prices
```

**Components** (use shadcn/ui):
```
Button, Card, Input, Badge, Textarea
CardHeader, CardTitle, CardDescription
CardContent, CardFooter
```

## 🌐 Multi-Language Support

**Current languages:** English (en), Vietnamese (vi), Japanese (ja)

**How it works:**
1. User selects language via LanguageSwitcher
2. Language stored in Zustand UI store
3. Language persisted to localStorage
4. Components use `getTranslation(language)` for text

**Adding new language:**
1. Update `Language` type in `src/types/i18n.ts`
2. Add new translation object in `src/lib/i18n/translations.ts`
3. Add to `translations` record
4. Update LanguageSwitcher component to include it

## 📱 Mobile-First Guidelines

**Always consider:**
- Touch targets: min 44x44px (use p-3 or larger)
- Font size: min 16px for inputs (prevents zoom on iOS)
- Viewport: Test at 375px width (iPhone SE)
- No horizontal scroll
- Readable without zooming
- Easy thumb reach for primary actions

**Responsive patterns:**
```typescript
// Mobile first, then desktop
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

// Hide on mobile, show on desktop
<div className="hidden md:block">

// Different sizes
<Button size="sm" className="md:size-default">
```

## 🔐 Security Notes

- **No authentication** - Public menu, no login
- **No PII stored** - Only cart and language in localStorage
- **WhatsApp number public** - +84328797611 is not sensitive
- **No XSS risk** - All data hardcoded, no user input stored permanently
- **No API keys** - Fully client-side

## 🚀 Performance Tips

**Already optimized:**
- Vite for fast builds
- Code splitting by route
- LocalStorage for instant load
- No external API calls

**Don't:**
- Add large dependencies
- Fetch remote data (no backend)
- Use complex state libraries
- Over-animate

## 📚 Quick Reference

**Imports you'll use most:**
```typescript
import { cn } from '@/lib/utils';
import { useCartStore, useUIStore } from '@/lib/store';
import { getTranslation } from '@/lib/i18n/translations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Minus, X, Search, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Product, CartItem, Category } from '@/types/menu';
import type { Language } from '@/types/i18n';
```

**Routes:**
```typescript
/                        → Home.tsx
/category/:categoryId    → CategoryView.tsx
/cart                    → Cart.tsx
```

**Stores:**
```typescript
useCartStore()  → items, orderNotes, addItem, removeItem, updateQuantity, setOrderNotes, clearCart, getTotal, getItemCount
useUIStore()    → language, searchQuery, setLanguage, setSearchQuery
```

---

**Remember:** When in doubt, check existing code for patterns. This codebase values consistency over cleverness.
