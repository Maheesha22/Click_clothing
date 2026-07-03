import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./forgot.css"; // Reuse forgot styles for layout
import "./ResetPassword.css";
import logo from "../assets/Logo.jpg";
import Header from "../Components/header";
import Footer from "../Components/footer";
import API from "../services/api";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/forgot");
    }
  }, [email, navigate]);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!otp || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await API.post("/users/reset-password", {
        email,
        otp,
        newPassword: password
      });
      navigate("/login", {
        state: { recoveryMsg: response.data.message || "Password successfully reset! You can now log in." }
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. The OTP might be expired or invalid.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) return null;

  return (
    <>
      <Header />
      <div className="forgot-page">
        <div className="forgot-logo-container">
          <img src={logo} alt="Logo" />
        </div>
        <div className="forgot-card reset-card">
          <h1 className="forgot-title">Set New Password</h1>
          
          <p style={{ textAlign: "center", marginBottom: "20px", fontSize: "14px", color: "#555" }}>
            {location.state?.recoveryMsg || `Please enter the 6-digit OTP sent to ${email}`}
          </p>

          <div className="forgot-input-group">
            <label className="forgot-label">6-DIGIT OTP</label>
            <input 
              className="forgot-input" 
              type="text" 
              placeholder="e.g. 123456"
              value={otp} 
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
            />
          </div>
          
          <div className="forgot-input-group">
            <label className="forgot-label">NEW PASSWORD</label>
            <input 
              className="forgot-input" 
              type="password" 
              placeholder="Enter new password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="forgot-input-group">
            <label className="forgot-label">CONFIRM PASSWORD</label>
            <input 
              className="forgot-input" 
              type="password" 
              placeholder="Confirm new password"
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleReset(e)} 
            />
          </div>

          {error && <p className="forgot-error">{error}</p>}

          <button className="forgot-btn" onClick={handleReset} disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
