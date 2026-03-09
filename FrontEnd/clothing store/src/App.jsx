import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from "./Pages/home";
import Cart from "./Pages/cart";
import CheckoutPage from "./Pages/checkout";
import LoginPage from "./Pages/login";
import RegisterPage from "./Pages/register";
import ForgotPage from "./Pages/forgot";
import Dashboard from "./Pages/admin_dashboard1";

function App() {
  const [page, setPage] = useState("home");
  const [recoveryMsg, setRecoveryMsg] = useState("");

  const handleForgotSuccess = () => {
    setRecoveryMsg("We've sent you an email with a link to update your password.");
    setPage("login");
  };

  if (page === "dashboard") return <Dashboard />;
  if (page === "register")  return <RegisterPage onNavigate={setPage} />;
  if (page === "forgot")    return <ForgotPage onNavigate={setPage} onSuccess={handleForgotSuccess} />;
  if (page === "login")     return <LoginPage onLogin={() => setPage("dashboard")} onNavigate={setPage} recoveryMsg={recoveryMsg} />;

  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ onNavigate added to HomePage */}
        <Route path="/"         element={<HomePage onNavigate={setPage} />} />
        <Route path="/cart"     element={<Cart />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
