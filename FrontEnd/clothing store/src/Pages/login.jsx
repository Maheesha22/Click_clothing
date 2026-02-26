import { useState } from "react";
import "./login.css";
import logo from "../assets/Logo.jpg";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === "admin1" && password === "1234") {
      setError("");
      onLogin(); // ✅ redirect to dashboard
    } else {
      setError("Invalid username or password. Please try again.");
    }
  };

  return (
    <div className="page">

      {/* Logo — desktop only, hidden on mobile */}
      <div className="logo-container">
        <img src={logo} alt="Logo" />
      </div>

      {/* Card — border on desktop, transparent on mobile */}
      <div className="card">
        <h1 className="title">Welcome Back</h1>

        <div className="input-group">
          <input
            className="input-field"
            type="text"
            placeholder="Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* ✅ Show error message if wrong credentials */}
        {error && (
          <p style={{ color: 'red', fontSize: 13, marginBottom: 8, textAlign: 'center' }}>
            {error}
          </p>
        )}

        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>

        <p className="register-text">
          Don't have an account ?{" "}
          <a href="/register">Register Here</a>
        </p>
      </div>

    </div>
  );
}