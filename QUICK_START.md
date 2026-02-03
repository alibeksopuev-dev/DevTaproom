# Quick Start Guide - Taproom 81

Get the app running in 2 minutes.

## ⚡ Instant Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173

## 🎯 First Tasks

### 1. Add Your First Product (30 seconds)

Open `src/data/products.ts`, add to the end of `PRODUCTS` array:

```typescript
{
  id: 'my-test-beer',
  name: 'Test Beer',
  description: 'A test beer for learning',
  price: 75,
  category: 'beers',
  metadata: {
    beer: {
      ibu: 30,
      abv: 5.5,
      size033ml: 65,
      size050ml: 85
    }
  }
}
```

Save → Refresh browser → See your beer in "craft beer (on tap)" category

### 2. Add New UI Text (60 seconds)

**Step 1:** Open `src/types/i18n.ts`, add to `Translation` interface:
```typescript
myNewText: string;
```

**Step 2:** Open `src/lib/i18n/translations.ts`, add to each language:
```typescript
const en: Translation = {
  // ... existing
  myNewText: 'Hello World'
};

const vi: Translation = {
  // ... existing
  myNewText: 'Xin chào'
};

const ja: Translation = {
  // ... existing
  myNewText: 'こんにちは'
};
```

**Step 3:** Use in any component:
```typescript
const language = useUIStore(state => state.language);
const t = getTranslation(language);
return <div>{t.myNewText}</div>;
```

### 3. Test the Cart (10 seconds)

1. Click "craft beer (on tap)"
2. Click "+" on any beer
3. Click cart icon (top right)
4. See your item
5. Click "Send Order via WhatsApp"

## 📚 Key Files (Read These First)

1. **README.md** - Overview and architecture
2. **AI_DEVELOPMENT_GUIDE.md** - Patterns and examples
3. **TROUBLESHOOTING.md** - Fix common issues

## 🔥 Common Commands

```bash
npm run dev          # Development (http://localhost:5173)
npm run build        # Production build
npm run preview      # Test production build locally
npm run lint         # Check code quality
```

## 🎨 Project at a Glance

```
What it does: Bar menu with cart and WhatsApp ordering
How it works: React SPA with Zustand state, no backend
Data: Hardcoded in src/data/products.ts
State: Zustand stores (cart, UI) with localStorage
Styles: Tailwind CSS + shadcn/ui components
Routing: React Router (/, /category/:id, /cart)
Languages: EN, VI, JA (switch in top-right)
```

## 🗂️ File Structure (Simplified)

```
src/
├── data/products.ts        ← Add products here
├── lib/
│   ├── store.ts           ← State management
│   └── i18n/translations.ts ← Add translations here
├── types/                 ← TypeScript definitions
├── components/            ← React components
├── pages/                 ← Page components
└── App.tsx               ← Routing setup
```

## 🎯 What to Edit for...

| Task | File to Edit |
|------|--------------|
| Add product | `src/data/products.ts` |
| Add category | `src/data/products.ts` + `src/types/menu.ts` + translations |
| Add UI text | `src/lib/i18n/translations.ts` + `src/types/i18n.ts` |
| Change colors | `tailwind.config.ts` |
| Change WhatsApp # | `src/lib/whatsapp.ts` (currently +84328797611) |
| Add page | Create in `src/pages/`, add route in `src/App.tsx` |
| Fix cart | `src/lib/store.ts` (useCartStore) |
| Fix styling | Component file or `tailwind.config.ts` |

## 🐛 Quick Debug

**Products not showing?**
```bash
# Check browser console for errors
# Check category ID matches
# Check search isn't filtering them out
```

**Cart not working?**
```javascript
// In browser console:
localStorage.removeItem('taproom-cart')
// Refresh page
```

**Translations broken?**
```bash
# Check all three languages have the key
# Check no typos in key name
```

## 🚀 Deploy to Vercel

1. Push code to GitHub
2. Go to vercel.com
3. Import repository
4. Deploy (auto-detects Vite)

Done! Your app is live.

## 💡 Pro Tips

1. **Use existing patterns** - Copy from similar components
2. **Import with `@/`** - Never use relative paths (`../../../`)
3. **Mobile first** - Test on small screen (375px)
4. **Check README** - Has all the answers
5. **Run build** - Catches TypeScript errors: `npm run build`

## 🎓 Learning Path

**Beginner:**
1. Add a product → See it appear
2. Edit translations → See text change
3. Change colors in `tailwind.config.ts`

**Intermediate:**
4. Create new component
5. Add new page with route
6. Modify cart logic

**Advanced:**
7. Add new state to Zustand
8. Create CVA style variants
9. Add new category type

## 🆘 Need Help?

1. Check **TROUBLESHOOTING.md**
2. Read **AI_DEVELOPMENT_GUIDE.md**
3. Search browser console errors
4. Check git history for similar changes

## ✅ Verification

**Your setup is working if:**
- ✅ Dev server starts without errors
- ✅ Home page shows 5 category buttons
- ✅ Can add items to cart
- ✅ Can switch languages (EN/VI/JA)
- ✅ Cart persists after refresh
- ✅ `npm run build` completes successfully

**Test all features:**
```bash
# Run production build
npm run build

# Test it locally
npm run preview

# Visit http://localhost:4173
# Test on mobile viewport (DevTools)
```

---

**You're ready!** Start by reading `README.md` for full context, then dive into the code.

**Most important:** Follow existing patterns. When in doubt, copy similar code and modify it.
