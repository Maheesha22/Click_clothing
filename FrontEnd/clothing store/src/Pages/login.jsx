import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import "./login.css";
import logo from "../assets/Logo.jpg";
import Header from "../Components/header";
import Footer from "../Components/footer";
import API from "../services/api";

const GOOGLE_CLIENT_ID = "991033244443-aie1ulhbfsskjq7bdlonnnf8kfhg01hb.apps.googleusercontent.com";

export default function LoginPage() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const recoveryMsg = location.state?.recoveryMsg || "";

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // Regular login with email/password
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await API.post('/users/login', {
        email: email,
        password: password
      });

      console.log("Login success:", response.data);
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect based on isAdmin
      if (response.data.user.isAdmin) {
        navigate("/dashboard");
      } else {
        navigate("/user");
      }
      
    } catch (err) {
      console.error("Login error:", err.response?.data);
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Google Login
  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("Google login success:", credentialResponse);
    setLoading(true);
    setError("");

    try {
      // Decode the Google credential to get user info
      const response = await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + credentialResponse.credential);
      const userInfo = await response.json();
      
      console.log("Google user info:", userInfo);
      
      // Send to your backend
      const backendResponse = await API.post('/users/google-login', {
        email: userInfo.email,
        firstName: userInfo.given_name || "",
        lastName: userInfo.family_name || "",
        googleId: userInfo.sub
      });
      
      console.log("Backend response:", backendResponse.data);
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(backendResponse.data.user));
      
      // Redirect based on isAdmin
      if (backendResponse.data.user.isAdmin) {
        navigate("/dashboard");
      } else {
        navigate("/user");
      }
      
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
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

        <div className="login-card">
          <h1 className="title">Welcome Back</h1>

          {recoveryMsg && <p className="recovery-msg">{recoveryMsg}</p>}

          <div className="input-group">
            <label className="input-label">EMAIL*</label>
            <input className="input-field" type="email" placeholder="Enter your email"
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

          <button className="login-btn" onClick={handleLogin} disabled={loading}>
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>

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
