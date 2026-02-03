# Troubleshooting Guide - Taproom 81

Quick fixes for common issues.

## 🚨 Build Errors

### Error: "Cannot find module '@/...'"
**Cause:** Path alias not configured
**Fix:** Check `tsconfig.json` and `vite.config.ts` have `@/*` alias set

### Error: "Property does not exist on type..."
**Cause:** TypeScript type mismatch
**Fix:** 
1. Check type definitions in `src/types/`
2. Run `npm run build` to see full error
3. Add missing property to interface

### Error: "Unused imports"
**Cause:** Strict mode catches unused code
**Fix:** Remove the unused import

## 🐛 Runtime Issues

### Products not displaying
**Check:**
1. Is product in `PRODUCTS` array? (`src/data/products.ts`)
2. Does `category` field match a valid CategoryId?
3. Is search filtering it out?
4. Check browser console for errors

**Quick test:**
```typescript
// In browser console:
JSON.parse(localStorage.getItem('taproom-ui'))
// Check searchQuery value
```

### Cart not working
**Check:**
1. Browser console for localStorage errors
2. LocalStorage quota not exceeded
3. Zustand store initialized

**Quick fix:**
```javascript
// Clear cart in browser console:
localStorage.removeItem('taproom-cart')
// Refresh page
```

### Translations missing
**Check:**
1. Key exists in `Translation` interface (`src/types/i18n.ts`)
2. Key exists in ALL language objects (en, vi, ja)
3. No typos in key name

**Quick test:**
```typescript
// In browser console:
import { translations } from './src/lib/i18n/translations'
translations.en.yourKey  // Should exist
translations.vi.yourKey  // Should exist
translations.ja.yourKey  // Should exist
```

### Language not changing
**Check:**
1. LanguageSwitcher component called correctly
2. LocalStorage persisting language
3. Components using `getTranslation(language)`

**Quick fix:**
```javascript
// Force language in browser console:
const store = JSON.parse(localStorage.getItem('taproom-ui'))
store.state.language = 'en'  // or 'vi' or 'ja'
localStorage.setItem('taproom-ui', JSON.stringify(store))
// Refresh page
```

### WhatsApp not opening
**Check:**
1. Phone number correct: +84328797611
2. Cart has items
3. Browser allows window.open()
4. Test URL format: `https://wa.me/84328797611?text=Test`

**Quick fix:**
```javascript
// Test WhatsApp directly in console:
window.open('https://wa.me/84328797611?text=Test', '_blank')
```

## 🎨 Styling Issues

### Tailwind classes not applying
**Check:**
1. Class name is valid Tailwind utility
2. `tailwind.config.ts` includes the path
3. `@tailwind` directives in `index.css`
4. Dev server restarted after config change

**Quick fix:**
```bash
# Restart dev server
npm run dev
```

### shadcn component not found
**Check:**
1. Component installed: `ls src/components/ui/`
2. Import path correct: `@/components/ui/component-name`
3. Component exported from file

**Quick fix:**
```bash
# Reinstall component
npx shadcn@latest add button  # or other component name
```

### CVA styles not applying
**Check:**
1. CVA imported: `import { cva } from "class-variance-authority"`
2. Variant called correctly: `variants({ variant: 'default' })`
3. Classes merged with `cn()`: `cn(variants({ variant }))`

## 🔧 Development Issues

### Dev server won't start
**Try:**
```bash
# Kill any process on port 5173
lsof -ti:5173 | xargs kill -9

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Start dev server
npm run dev
```

### Hot reload not working
**Try:**
1. Save the file again
2. Restart dev server
3. Clear browser cache
4. Check file is in `src/` directory

### Build takes forever
**Check:**
1. Node version (should be 20+)
2. Disk space available
3. No infinite loops in code

## 📱 Mobile Issues

### App not responsive
**Check:**
1. Viewport meta tag in `index.html`
2. Using `md:` breakpoints for desktop styles
3. Testing in browser DevTools mobile view

### Touch targets too small
**Fix:** Use larger padding classes (`p-3`, `p-4` instead of `p-1`, `p-2`)

### Text too small
**Fix:** Minimum `text-base` (16px) for readability

## 🗄️ Data Issues

### Products in wrong order
**Check:**
1. Array order in `PRODUCTS`
2. Category `order` field in `CATEGORIES`
3. Sort function in component

### Product metadata not showing
**Check:**
1. Metadata structure matches type definition
2. Component checks for metadata existence
3. No typos in metadata keys (ibu, abv, etc.)

### Search not finding products
**Check:**
1. Search query stored in UI store
2. Filter logic includes both name and description
3. Case-insensitive comparison used

## 🔌 Integration Issues

### WhatsApp message wrong format
**Check:**
1. `generateWhatsAppMessage()` in `src/lib/whatsapp.ts`
2. Translation keys exist for message parts
3. URL encoding correct

**Test message:**
```typescript
import { generateWhatsAppMessage } from '@/lib/whatsapp';
console.log(generateWhatsAppMessage(cartItems, notes, 'en'));
```

## 💾 LocalStorage Issues

### Data not persisting
**Check:**
1. Browser supports localStorage
2. Not in incognito/private mode
3. Storage quota not exceeded
4. Zustand persist middleware configured

**Clear all data:**
```javascript
// In browser console:
localStorage.removeItem('taproom-cart')
localStorage.removeItem('taproom-ui')
// Refresh page
```

### Old data causing issues
**Quick fix:**
```javascript
// Clear and reset:
localStorage.clear()
// Refresh page
```

## 🚀 Deployment Issues

### Vercel build fails
**Check:**
1. `vercel.json` exists
2. Build command correct: `npm run build`
3. Output directory: `dist`
4. All TypeScript errors fixed

### Routes not working after deploy
**Check:**
1. `vercel.json` has SPA rewrite rule
2. Routes match React Router setup
3. No trailing slashes in routes

### Environment issues
**Check:**
1. Node version matches (20+)
2. Package-lock.json committed
3. All dependencies in package.json

## 🧪 Testing Tips

### Manual testing checklist
```bash
# Start fresh:
npm run build && npm run preview

# Test in order:
1. Home page loads
2. Click category → Products show
3. Search works
4. Add to cart
5. View cart
6. Update quantities
7. Add order notes
8. Send to WhatsApp
9. Change language
10. Refresh → Cart persists
```

### Browser console checks
```javascript
// Check cart:
JSON.parse(localStorage.getItem('taproom-cart'))

// Check UI state:
JSON.parse(localStorage.getItem('taproom-ui'))

// Test search:
// Set search query in SearchBar, check UI store

// Test translations:
// Change language, check text updates
```

## 📞 When All Else Fails

1. **Check browser console** - Errors tell you what's wrong
2. **Read the error completely** - Don't skim
3. **Google the exact error message** - Others have solved it
4. **Check git diff** - What changed recently?
5. **Restart everything** - Server, browser, computer
6. **Fresh install** - Delete node_modules, reinstall

## 🆘 Emergency Resets

### Nuclear option (start fresh):
```bash
# Backup first!
git stash

# Clean everything
rm -rf node_modules package-lock.json dist .vite

# Reinstall
npm install

# Rebuild
npm run build

# Test
npm run dev
```

### Reset user data:
```javascript
// In browser console:
localStorage.clear()
sessionStorage.clear()
// Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

---

**Still stuck?** Check the browser DevTools:
- Console tab → Errors
- Network tab → Failed requests
- Application tab → LocalStorage
- Elements tab → CSS issues
