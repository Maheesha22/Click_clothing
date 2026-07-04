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
import ComparisonPage from './Pages/ComparisonPage';
import ChatbotPage from './Pages/Chatbot';
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
import ChatLauncher from './Components/ChatLauncher';

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

  const RootLayout = () => (
    <ComparisonProvider>
      <>
        <CompareBar />
        <RedirectHandler />
        <Outlet />
        <ChatLauncher floating />
      </>
    </ComparisonProvider>
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
        { path: '/comparison', element: <ProtectedRoute><ComparisonPage /></ProtectedRoute> },
        { path: '/order/confirmation', element: <OrderConfirmationPage /> },
        { path: '/upload-slip', element: <UploadSlipPage /> },
        { path: '/Contactus', element: <ContactUs /> },
        { path: '/feedback', element: <FeedbackForm /> },
        { path: '/faq', element: <FAQPage /> },
        { path: '/about', element: <AboutUs /> },
        { path: '/chat', element: <ChatbotPage /> },
        { path: '/login', element: <LoginPage /> },
        { path: '/register', element: <RegisterPage /> },
        { path: '/forgot', element: <ForgotPage onSuccess={handleForgotSuccess} /> },
        { path: '/dashboard', element: <Dashboard /> },
        { path: '/smart-size/:productId?', element: <SmartSizePage /> },
        { path: '/product/:productId', element: <ProductPage /> },
        {
          path: '/user',
          element: <UserPage />,
          children: [
            { index: true, element: <Navigate to="/user/orders" replace /> },
            { path: 'wishlist', element: <Wishlist /> },
            { path: 'orders', element: <OrderHistory /> },
            { path: 'comparisons', element: <ProtectedRoute><MyComparisons /></ProtectedRoute> },
            { path: 'settings', element: <Settings /> },
            { path: 'reviews', element: <Reviews /> },
            { path: 'recently-viewed', element: <ProtectedRoute><RecentlyViewed /></ProtectedRoute> },
            { path: 'size-history', element: <SizeHistory /> }
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