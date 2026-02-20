import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react"
import { Home } from '@/pages/Home';
import { CategoryView } from '@/pages/CategoryView';
import { Cart } from '@/pages/Cart';
import { OrderConfirmation } from '@/pages/OrderConfirmation';
import { useAuthStore } from '@/lib/authStore';

function App() {
  // Initialize auth listener (handles OAuth redirect callback)
  useEffect(() => {
    const cleanup = useAuthStore.getState().initialize();
    return cleanup;
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:categoryId" element={<CategoryView />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order/:orderId" element={<OrderConfirmation />} />
      </Routes>
      <Analytics />
    </Router>
  );
}

export default App;
