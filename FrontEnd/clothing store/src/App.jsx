import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // ✅ CHANGE 1 — added React Router imports
import HomePage from "./Pages/home";
import Cart from "./Pages/cart";
import CheckoutPage from "./Pages/checkout"; // ✅ CHANGE 2 — added CheckoutPage import

function App() {
  // ✅ CHANGE 3 — replaced window.location.pathname with proper React Router
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<HomePage />} />
        <Route path="/cart"     element={<Cart />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
