import { useState } from "react";
import "./Login.css";
import logo from "../assets/Logo.jpg";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    //e.preventDefault();
    
    //alert(`Logging in with: ${email}`);
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
            type="email"
            placeholder="Email"
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