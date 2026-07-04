import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./forgot.css";
import logo from "../assets/Logo.jpg";
import Header from "../Components/header";
import Footer from "../Components/footer";
import API from "../services/api";

export default function ForgotPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRecover = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      await API.post("/users/forgot-password", { email });
      navigate("/reset-password", {
        state: { email: email, recoveryMsg: "We've sent a 6-digit OTP to your email." }
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="forgot-page">
        <div className="forgot-logo-container">
          <img src={logo} alt="Logo" />
        </div>
        <div className="forgot-card">
          <h1 className="forgot-title">Recover Password</h1>

          <div className="forgot-input-group">
            <label className="forgot-label">EMAIL</label>
            <input className="forgot-input" type="email" placeholder="Enter your email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRecover(e)} />
          </div>

          {error && <p className="forgot-error">{error}</p>}

          <button className="forgot-btn" onClick={handleRecover} disabled={isLoading}>
            {isLoading ? "Sending..." : "Recover"}
          </button>

          <p className="forgot-back">
            <Link to="/login">← Back to Login</Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
