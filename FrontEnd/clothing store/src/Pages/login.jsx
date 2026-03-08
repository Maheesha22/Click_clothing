import { useState } from "react";
import "./login.css";
import logo from "../assets/Logo.jpg";

export default function LoginPage({ onLogin, onNavigate, recoveryMsg }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === "admin1" && password === "1234") {
      setError("");
      onLogin();
    } else {
      setError("Invalid username or password. Please try again.");
    }
  };

  return (
    <div className="page">

      {/* Logo */}
      <div className="logo-container">
        <img src={logo} alt="Logo" />
      </div>

      {/* Card */}
      <div className="card">
        <h1 className="title">Welcome Back</h1>

        {/* ✅ Recovery success message */}
        {recoveryMsg && (
          <p className="recovery-msg">{recoveryMsg}</p>
        )}

        <div className="input-group">
          <label className="input-label">USERNAME*</label>
          <input
            className="input-field"
            type="text"
            placeholder="Enter your username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin(e)}
          />
        </div>

        <div className="input-group">
          <label className="input-label">PASSWORD*</label>
          <input
            className="input-field"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin(e)}
          />
        </div>

        {error && (
          <p className="login-error">{error}</p>
        )}

        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>

        <p className="forgot-password">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate("forgot"); }}>
            Forgot your password?
          </a>
        </p>

        <p className="register-text">
          Don't have an account ?{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate("register"); }}>
            Sign Up
          </a>
        </p>
      </div>

    </div>
  );
}
