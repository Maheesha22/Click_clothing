import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from "./Pages/home";
import Cart from "./Pages/cart";
import CheckoutPage from "./Pages/checkout";
import ContactUs from "./Pages/Contactus";
import LoginPage from "./Pages/login";
import RegisterPage from "./Pages/register";
import ForgotPage from "./Pages/forgot";
import Dashboard from "./Pages/Admindashboard";
import UserPage from "./Pages/user";
import Trousers from './Pages/Trousers';
import Shirts from "./Pages/shirts";
import FormalShirtsPage from "./Pages/formal-shirts";
import TShirtsPage from "./Pages/tshirts";
import ShortsPage from "./Pages/shorts";
import FeedbackForm from "./Pages/FeedbackForm";
import FAQPage from "./Pages/FAQ";

// User sub-pages
import Wishlist from "./Pages/userpages/Wishlist";
import OrderHistory from "./Pages/userpages/OrderHistory";
import Settings from "./Pages/userpages/Settings";

function App() {
  const handleForgotSuccess = () => {};

  return (
    <BrowserRouter>
      <Routes>
        {/*MAIN PAGES */}
        <Route path="/" element={<HomePage />} />
          <Route path="/Category" element={<HomePage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/Contactus" element={<ContactUs />} />
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="/faq" element={<FAQPage />} />


        {/*Login pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot" element={<ForgotPage onSuccess={handleForgotSuccess} />} />

        {/*Admin */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* User — nested routes */}
        <Route path="/user" element={<UserPage />}>
          <Route index element={<Navigate to="wishlist" replace />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/*PRODUCT PAGES */}
        <Route path="/trousers" element={<Trousers />} />
        <Route path="/shirts" element={<Shirts />} />
        <Route path="/formal-shirts" element={<FormalShirtsPage />} />
        <Route path="/tshirts" element={<TShirtsPage />} />
        <Route path="/shorts" element={<ShortsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
