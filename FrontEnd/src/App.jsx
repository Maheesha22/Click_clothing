import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

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
import Shirts from "./Pages/Shirts";
import FormalShirtsPage from "./Pages/formal-shirts";
import TShirtsPage from "./Pages/tshirts";
import ShortsPage from "./Pages/shorts";
import FeedbackForm from "./Pages/FeedbackForm";
import FAQPage from "./Pages/FAQ";
import AboutUs from "./Pages/AboutUs";
import ProductPage from './Pages/ProductPage';
import OrderConfirmationPage from './Pages/OrderConfirmation';
import UploadSlipPage from './Pages/UploadSlip';
// User sub-pages
import Wishlist from "./Pages/userpages/Wishlist";
import OrderHistory from "./Pages/userpages/OrderHistory";

import Reviews from "./Pages/userpages/Reviews";  // ← ADD THIS
import RecentlyViewed from "./Pages/userpages/RecentlyViewed";  // ← ADD THIS

// Component to handle redirection after login (e.g., for Buy It Now)
const RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const user = sessionStorage.getItem('user');
    const pendingBuyNow = sessionStorage.getItem('pendingBuyNow');
    
    if (user && pendingBuyNow) {
      try {
        const data = JSON.parse(pendingBuyNow);
        sessionStorage.removeItem('pendingBuyNow');
        navigate('/checkout', { state: data });
      } catch (error) {
        console.error("Error parsing pendingBuyNow:", error);
        sessionStorage.removeItem('pendingBuyNow');
      }
    }
  }, [navigate, location.pathname]);
  
  return null;
};

function App() {
  const handleForgotSuccess = () => { };

  return (
    <BrowserRouter>
      <RedirectHandler />
      <Routes>
        {/*MAIN PAGES */}
        <Route path="/" element={<HomePage />} />
        <Route path="/Category" element={<HomePage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order/confirmation" element={<OrderConfirmationPage />} />
        <Route path="/upload-slip" element={<UploadSlipPage />} />
        <Route path="/Contactus" element={<ContactUs />} />
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/about" element={<AboutUs />} />

        {/*Login pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot" element={<ForgotPage onSuccess={handleForgotSuccess} />} />

        {/*Admin */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* User — nested routes */}
        <Route path="/user" element={<UserPage />}>
          <Route index element={<OrderHistory />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="orders" element={<OrderHistory />} />

          <Route path="reviews" element={<Reviews />} />  {/* ← ADD THIS */}
          <Route path="recently-viewed" element={<RecentlyViewed />} />  {/* ← ADD THIS */}
        </Route>

        {/*PRODUCT PAGES */}
        <Route path="/category/:category" element={<ProductPage />} />
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
