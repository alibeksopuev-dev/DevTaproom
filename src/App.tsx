import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react"
import { Home } from '@/pages/Home';
import { CategoryView } from '@/pages/CategoryView';
import { Cart } from '@/pages/Cart';
import { RLSTest } from '@/pages/RLSTest';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:categoryId" element={<CategoryView />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/rls-test" element={<RLSTest />} />
      </Routes>
      <Analytics />
    </Router>
  );
}

export default App;
