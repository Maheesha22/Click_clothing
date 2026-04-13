import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import HomePage from "./Pages/home";
import Cart from "./Pages/cart";
import CheckoutPage from "./Pages/checkout";
import ContactUs from "./Pages/Contactus";
import LoginPage from "./Pages/login";
import RegisterPage from "./Pages/register";
import ForgotPage from "./Pages/forgot";
import Dashboard from "./Pages/admin_dashboard1";
import Trousers from './Pages/Trousers';
import Sarong from "./Pages/sarong";

function App() {

  const handleForgotSuccess = () => {
    // optional: you can add message logic later
  };

  return (
    <BrowserRouter>

      <Routes>

        {/* 🌐 MAIN PAGES */}
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/Contactus" element={<ContactUs />} />

        {/* 🔐 AUTH PAGES (FIXED) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot" element={<ForgotPage onSuccess={handleForgotSuccess} />} />

        {/* 🧑‍💼 DASHBOARD */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* 👕 PRODUCT PAGES */}
        <Route path="/trousers" element={<Trousers />} />
        <Route path="/sarong" element={<Sarong />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
