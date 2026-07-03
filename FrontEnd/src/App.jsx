import React from 'react';
import { createBrowserRouter, RouterProvider, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';

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

  const RootLayout = () => (
    <>
      <RedirectHandler />
      <Outlet />
    </>
  );

  const router = createBrowserRouter([
    {
      path: '/',
      element: <RootLayout />,
      children: [
        { path: '/', element: <HomePage /> },
        { path: '/Category', element: <HomePage /> },
        { path: '/cart', element: <Cart /> },
        { path: '/checkout', element: <CheckoutPage /> },
        { path: '/order/confirmation', element: <OrderConfirmationPage /> },
        { path: '/upload-slip', element: <UploadSlipPage /> },
        { path: '/Contactus', element: <ContactUs /> },
        { path: '/feedback', element: <FeedbackForm /> },
        { path: '/faq', element: <FAQPage /> },
        { path: '/about', element: <AboutUs /> },
        { path: '/login', element: <LoginPage /> },
        { path: '/register', element: <RegisterPage /> },
        { path: '/forgot', element: <ForgotPage onSuccess={handleForgotSuccess} /> },
        { path: '/dashboard', element: <Dashboard /> },
        {
          path: '/user',
          element: <UserPage />,
          children: [
            { index: true, element: <OrderHistory /> },
            { path: 'wishlist', element: <Wishlist /> },
            { path: 'orders', element: <OrderHistory /> },
            { path: 'reviews', element: <Reviews /> },
            { path: 'recently-viewed', element: <RecentlyViewed /> }
          ]
        },
        { path: '/category/:category', element: <ProductPage /> },
        { path: '/trousers', element: <Trousers /> },
        { path: '/shirts', element: <Shirts /> },
        { path: '/formal-shirts', element: <FormalShirtsPage /> },
        { path: '/tshirts', element: <TShirtsPage /> },
        { path: '/shorts', element: <ShortsPage /> }
      ]
    }
  ], { future: { v7_startTransition: true, v7_relativeSplatPath: true } });

  return <RouterProvider router={router} />;
}

export default App;
