import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import "./login.css";
import logo from "../assets/Logo.jpg";
import Header from "../Components/header";
import Footer from "../Components/footer";

const GOOGLE_CLIENT_ID = "991033244443-aie1ulhbfsskjq7bdlonnnf8kfhg01hb.apps.googleusercontent.com";

export default function LoginPage() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const recoveryMsg = location.state?.recoveryMsg || "";

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "admin1" && password === "1234") {
      setError("");
      navigate("/dashboard");
    } else {
      setError("Invalid username or password. Please try again.");
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    // Google login succeeded — navigate to dashboard
    console.log("Google login success:", credentialResponse);
    navigate("/dashboard");
  };

  const handleGoogleError = () => {
    setError("Google sign-in failed. Please try again.");
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Header />
      <div className="page">
        <div className="logo-container">
          <img src={logo} alt="Logo" />
        </div>

        <div className="card">
          <h1 className="title">Welcome Back</h1>

          {recoveryMsg && <p className="recovery-msg">{recoveryMsg}</p>}

          <div className="input-group">
            <label className="input-label">USERNAME*</label>
            <input className="input-field" type="text" placeholder="Enter your username"
              value={email} onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin(e)} />
          </div>

          <div className="input-group">
            <label className="input-label">PASSWORD*</label>
            <input className="input-field" type="password" placeholder="Enter your password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin(e)} />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="login-btn" onClick={handleLogin}>Login</button>

          {/* Divider */}
          <div className="divider">
            <span>or</span>
          </div>

          {/* Google Login Button */}
          <div className="google-btn-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              width="368"
              text="signin_with"
              shape="rectangular"
              theme="outline"
            />
          </div>

          <p className="forgot-password">
            <Link to="/forgot">Forgot your password?</Link>
          </p>

          <p className="register-text">
            Don't have an account ?{" "}
            <Link to="/register">Sign Up</Link>
          </p>
        </div>
      </div>
      <Footer />
    </GoogleOAuthProvider>
  );
}
