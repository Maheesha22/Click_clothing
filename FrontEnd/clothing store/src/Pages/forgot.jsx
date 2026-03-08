import { useState } from "react";
import "./forgot.css";

export default function ForgotPage({ onNavigate, onSuccess }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleRecover = (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    setError("");
    onSuccess(); // ✅ navigate to login with success message
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <h1 className="forgot-title">Recover Password</h1>

        <div className="forgot-input-group">
          <label className="forgot-label">EMAIL</label>
          <input
            className="forgot-input"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRecover(e)}
          />
        </div>

        {error && <p className="forgot-error">{error}</p>}

        <button className="forgot-btn" onClick={handleRecover}>Recover</button>

        <p className="forgot-back">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate("login"); }}>
            ← Back to Login
          </a>
        </p>
      </div>
    </div>
  );
}
