import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

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
import Sarong from "./Pages/sarong";
import Shirts from "./Pages/shirts";
import FeedbackForm from "./Pages/FeedbackForm";

function App() {
  const handleForgotSuccess = () => {
    // optional: you can add message logic later
  };

  return (
    <BrowserRouter>
      <Routes>
        {/*MAIN PAGES */}
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/Contactus" element={<ContactUs />} />
        <Route path="/feedback" element={<FeedbackForm />} /> 

        {/*Login pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot" element={<ForgotPage onSuccess={handleForgotSuccess} />} />

        {/*Admin & User */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/user" element={<UserPage />} />

        {/*PRODUCT PAGES */}
        <Route path="/trousers" element={<Trousers />} />
        <Route path="/sarong" element={<Sarong />} />
        <Route path="/shirts" element={<Shirts />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
