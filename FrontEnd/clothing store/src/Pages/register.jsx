import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./register.css";
import logo from "../assets/Logo.jpg";
import Header from "../Components/header";
import Footer from "../Components/footer";
import API from "../services/api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  const handleSignUp = async (e) => {
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
    setLoading(true);

    try {
      const registerResponse = await API.post('/users/register', {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password
      });
      
      console.log("Registration success:", registerResponse.data);
      
      const loginResponse = await API.post('/users/login', {
        email: email,
        password: password
      });
      
      console.log("Auto-login success:", loginResponse.data);
      
      localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
      
      if (loginResponse.data.user.isAdmin) {
        navigate("/dashboard");
      } else {
        navigate("/user");
      }
      
    } catch (err) {
      console.error("Registration error:", err.response?.data);
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="register-page">
        <div className="register-logo-container">
          <img src={logo} alt="Logo" />
        </div>
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

          <button className="register-btn" onClick={handleSignUp} disabled={loading}>
            {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
          </button>

          <p className="register-signin-text">
            Already have an account ?{" "}
            <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
