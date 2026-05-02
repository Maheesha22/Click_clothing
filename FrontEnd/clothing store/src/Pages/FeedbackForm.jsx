import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../Components/header";
import Footer from "../Components/footer";
import API from "../services/api";
import "./FeedbackForm.css";

const MAX_CHARS = 1000;

const FeedbackForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);

  // Load existing feedbacks
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await API.get('/feedbacks/public');
      setFeedbacks(response.data);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!message.trim()) {
      setError("Please write your feedback.");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      await API.post('/feedbacks', { name, email, message });
      setSuccessMsg("Thank you! Your feedback has been submitted.");
      setName("");
      setEmail("");
      setMessage("");
      fetchFeedbacks();
      
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <Header />
      <div className="feedback-page-container">
        <div className="feedback-wrapper">
          {/* LEFT SIDE - FORM */}
          <div className="feedback-form-panel">
            <h1 className="feedback-title">Share Your Feedback</h1>
            <p className="feedback-subtitle">We value your opinion. Tell us about your experience.</p>
            
            {successMsg && (
              <div className="feedback-success-msg">
                ✓ {successMsg}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="feedback-input-group">
                <label>YOUR NAME </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="feedback-input-group">
                <label>EMAIL ADDRESS </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="feedback-input-group">
                <label>YOUR FEEDBACK </label>
                <textarea
                  rows="5"
                  placeholder="Tell us what you think..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div className="feedback-char-count">
                  {message.length} / {MAX_CHARS}
                </div>
              </div>
              
              {error && <div className="feedback-error-msg">⚠ {error}</div>}
              
              <div className="feedback-button-group">
                <button 
                  type="button" 
                  className="feedback-btn-reset"
                  onClick={() => { setName(""); setEmail(""); setMessage(""); }}
                >
                  Reset
                </button>
                <button 
                  type="submit" 
                  className="feedback-btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback →"}
                </button>
              </div>
            </form>
          </div>
          
          {/* RIGHT SIDE - RECENT FEEDBACK */}
          <div className="feedback-reviews-panel">
            <h3 className="reviews-title">Recent Feedback</h3>
            <p className="reviews-subtitle">What our customers are saying</p>
            
            <div className="feedback-reviews-list">
              {feedbacks.length === 0 ? (
                <div className="no-reviews">
                  <p>No feedback yet.</p>
                  <p>Be the first to share!</p>
                </div>
              ) : (
                feedbacks.slice(0, 10).map((fb) => (
                  <div key={fb.id} className="feedback-review-card">
                    <div className="feedback-review-header">
                      <div className="feedback-review-avatar">
                        {getInitials(fb.name)}
                      </div>
                      <div className="feedback-review-info">
                        <span className="feedback-review-name">{fb.name}</span>
                        <span className="feedback-review-date">
                          {new Date(fb.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="feedback-review-message">{fb.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FeedbackForm;
