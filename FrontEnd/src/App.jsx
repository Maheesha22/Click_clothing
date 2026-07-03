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
import ComparisonPage from './Pages/ComparisonPage';
// User sub-pages
import Wishlist from "./Pages/userpages/Wishlist";
import OrderHistory from "./Pages/userpages/OrderHistory";
import Settings from "./Pages/userpages/Settings";
import Reviews from "./Pages/userpages/Reviews";
import RecentlyViewed from "./Pages/userpages/RecentlyViewed";
import SizeHistory from "./Pages/userpages/SizeHistory";
import SmartSizePage from "./Pages/SmartSizePage";
import MyComparisons from "./Pages/userpages/MyComparisons";

// Context & Components
import { ComparisonProvider } from './context/ComparisonContext';
import CompareBar from './Components/CompareBar';

// Gate for routes that require a logged-in user
const ProtectedRoute = ({ children }) => {
  const storedUser = JSON.parse(sessionStorage.getItem('user') || 'null');
  const isLoggedIn = !!(storedUser?.email);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

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
    <ComparisonProvider>
      <BrowserRouter>
        <CompareBar />
        <RedirectHandler />
        <Routes>
          {/*MAIN PAGES */}
          <Route path="/" element={<HomePage />} />
          <Route path="/Category" element={<HomePage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/comparison" element={<ProtectedRoute><ComparisonPage /></ProtectedRoute>} />
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
            <Route index element={<Navigate to="/" replace />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="orders" element={<OrderHistory />} />
            <Route path="comparisons" element={<ProtectedRoute><MyComparisons /></ProtectedRoute>} />
            <Route path="settings" element={<Settings />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="recently-viewed" element={<ProtectedRoute><RecentlyViewed /></ProtectedRoute>} />
            <Route path="size-history" element={<SizeHistory />} />
          </Route>

          <Route path="/smart-size/:productId?" element={<SmartSizePage />} />

          {/*PRODUCT PAGES */}
          <Route path="/product/:productId" element={<ProductPage />} />
          <Route path="/category/:category" element={<ProductPage />} />
          <Route path="/trousers" element={<Trousers />} />
          <Route path="/shirts" element={<Shirts />} />
          <Route path="/formal-shirts" element={<FormalShirtsPage />} />
          <Route path="/tshirts" element={<TShirtsPage />} />
          <Route path="/shorts" element={<ShortsPage />} />
        </Routes>
      </BrowserRouter>
    </ComparisonProvider>
  );
}

export default App;