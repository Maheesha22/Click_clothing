import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from "./Pages/home";
import Cart from "./Pages/cart";
import CheckoutPage from "./Pages/checkout";
import ContactUs from "./Pages/Contactus";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<HomePage />} />
        <Route path="/cart"     element={<Cart />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/Contactus" element={<ContactUs />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
