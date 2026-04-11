import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from "./Pages/home";
import Cart from "./Pages/cart";
import CheckoutPage from "./Pages/checkout";
import LoginPage from "./Pages/login";
import RegisterPage from "./Pages/register";
import ForgotPage from "./Pages/forgot";
import Dashboard from "./Pages/admin_dashboard1";
import Trousers from './Pages/Trousers';
import Sarong from "./Pages/sarong";
import Shirts from "./Pages/Shirts"; /* add Shirts page */

function App() {
  const [page, setPage] = useState("home");
  const [recoveryMsg, setRecoveryMsg] = useState("");

  // ✅ Navigate with history support
  const navigate = (newPage) => {
    window.history.pushState({ page: newPage }, "", window.location.pathname);
    setPage(newPage);
  };

  // ✅ Listen for profile icon window event
  useEffect(() => {
    const handler = (e) => navigate(e.detail);
    window.addEventListener("navigate", handler);
    return () => window.removeEventListener("navigate", handler);
  }, []);

  // ✅ Listen for browser back/forward button
  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state && e.state.page) {
        setPage(e.state.page);
      } else {
        setPage("home");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleForgotSuccess = () => {
    setRecoveryMsg("We've sent you an email with a link to update your password.");
    navigate("login");
  };

  return (
    <BrowserRouter>
      {page === "dashboard" && <Dashboard />}
      {page === "register"  && <RegisterPage onNavigate={navigate} />}
      {page === "forgot"    && <ForgotPage onNavigate={navigate} onSuccess={handleForgotSuccess} />}
      {page === "login"     && <LoginPage onLogin={() => navigate("dashboard")} onNavigate={navigate} recoveryMsg={recoveryMsg} />}
      {page === "trousers"  && <Trousers />}
      {page === "sarong"    && <Sarong />}
      {page === "shirts"    && <Shirts />}  {/* add Shirts page */}
      {page === "home"      &&
        <Routes>
          <Route path="/"         element={<HomePage />} />
          <Route path="/cart"     element={<Cart />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      }
    </BrowserRouter>
  );
}

export default App;