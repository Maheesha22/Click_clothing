import React, { useState } from 'react';
import Header from '../Components/header';
import Footer from '../Components/footer';
import './ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    comment: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // Clear message when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Set loading state
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Send data to backend
      const response = await fetch('http://localhost:3000/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Success
        setMessage({ 
          type: 'success', 
          text: 'Thank you for contacting us! We will get back to you soon.' 
        });
        // Reset form
        setFormData({
          name: '',
          phone: '',
          email: '',
          comment: ''
        });
      } else {
        // Error from server
        setMessage({ 
          type: 'error', 
          text: data.message || 'Something went wrong. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage({ 
        type: 'error', 
        text: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="contact-us-container">
        <div className="contact-content">
          <div className="contact-form-section">
            <h2>Contact Us</h2>
            
            {/* Display success/error message */}
            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="form-group">
                <label>Phone number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Enter your email address"
                />
              </div>
              
              <div className="form-group">
                <label>Comment *</label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  rows="4"
                  required
                  disabled={loading}
                  placeholder="Please write your message here..."
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Submit'}
              </button>
            </form>
          </div>
          
          <div className="contact-info-section">
            <div className="contact-details">
              <div className="contact-item">
                <div className="icon-wrapper">
                  <svg className="contact-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.01 15.38C18.78 15.38 17.59 15.18 16.48 14.82C16.13 14.7 15.74 14.79 15.47 15.06L13.9 17.03C11.07 15.68 8.42 13.13 7.01 10.2L8.96 8.54C9.23 8.26 9.31 7.87 9.2 7.52C8.83 6.41 8.64 5.22 8.64 3.99C8.64 3.45 8.19 3 7.65 3H4.19C3.65 3 3 3.24 3 3.99C3 13.28 10.73 21 20.01 21C20.72 21 21 20.37 21 19.82V16.37C21 15.83 20.55 15.38 20.01 15.38Z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="contact-text">
                  <p>Call Us: 0767508349 (Main Branch)</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="icon-wrapper">
                  <svg className="contact-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="contact-text">
                  <a href="mailto:clickmall@gmail.com">clickmall@gmail.com</a>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="icon-wrapper">
                  <svg className="contact-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="contact-text">
                  <p>Click Super Mall<br />
                  SLTB Bus Stand,<br />
                  U 100,<br />
                  Avissawella</p><br />
                </div>
              </div>
              
              <div className="contact-item">
                <div className="icon-wrapper">
                  <svg className="contact-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="contact-text">
                  <p><strong>Opening Hours:</strong><br />
                  Everyday : 9:00AM - 7:00PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="map-section">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.4914145522002!2d80.2101400745413!3d6.951212618046192!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae3a9371d2dde55%3A0x7155b541a32f1484!2sClick%20Super%20Mall!5e0!3m2!1sen!2slk!4v1775800885201!5m2!1sen!2slk"
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Click Super Mall Awissawella Location"
          ></iframe>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactUs;