import { useState } from "react";
import "./register.css";

export default function RegisterPage({ onNavigate }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [error, setError]         = useState("");

  const handleSignUp = (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    alert("Account created successfully!");
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h1 className="register-title">WELCOME !</h1>

        <div className="register-input-group">
          <label className="register-label">FIRST NAME*</label>
          <input className="register-input" type="text" placeholder="Enter your first name"
            value={firstName} onChange={(e) => setFirstName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSignUp(e)} />
        </div>

        <div className="register-input-group">
          <label className="register-label">LAST NAME*</label>
          <input className="register-input" type="text" placeholder="Enter your last name"
            value={lastName} onChange={(e) => setLastName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSignUp(e)} />
        </div>

        <div className="register-input-group">
          <label className="register-label">EMAIL*</label>
          <input className="register-input" type="email" placeholder="Enter your email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSignUp(e)} />
        </div>

        <div className="register-input-group">
          <label className="register-label">PASSWORD*</label>
          <input className="register-input" type="password" placeholder="Enter your password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSignUp(e)} />
        </div>

        <div className="register-input-group">
          <label className="register-label">CONFIRM PASSWORD*</label>
          <input className="register-input" type="password" placeholder="Confirm your password"
            value={confirm} onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSignUp(e)} />
        </div>

        {error && <p className="register-error">{error}</p>}

        <button className="register-btn" onClick={handleSignUp}>CREATE ACCOUNT</button>

        <p className="register-signin-text">
          Already have an account ?{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate("login"); }}>
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}