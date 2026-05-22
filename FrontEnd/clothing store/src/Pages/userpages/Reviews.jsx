import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import API from '../../services/api';
import './Reviews.css';

const Reviews = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { storedUser } = useOutletContext();
  
  const orderId = location.state?.orderId;
  const orderNumber = location.state?.orderNumber;

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!orderId) {
      fetchOrders();
    }
  }, [orderId]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/customer-orders/user/${storedUser?.id}`);
      if (response.data.success) {
        // Filter for delivered orders that could be reviewed
        const deliveredOrders = response.data.data.filter(o => o.status?.toLowerCase() === 'delivered');
        setOrders(deliveredOrders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a star rating');
      return;
    }
    
    if (!comment.trim()) {
      setError('Please provide a comment');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // still there is no end point 
      await API.post('/reviews', {
        userId: storedUser?.id,
        orderId: orderId,
        rating: rating,
        comment: comment,
        userName: `${storedUser?.firstName} ${storedUser?.lastName}`
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/user/orders');
      }, 3000);
    } catch (err) {
      console.error('Error submitting review:', err);
      // Fallback: If /reviews doesn't exist, try /feedbacks as a backup if that's what the user prefers
      try {
        await API.post('/feedbacks', {
          name: `${storedUser?.firstName} ${storedUser?.lastName}`,
          email: storedUser?.email,
          message: `Order #${orderNumber} Review (${rating} Stars): ${comment}`
        });
        setSuccess(true);
        setTimeout(() => {
          navigate('/user/orders');
        }, 3000);
      } catch (fallbackErr) {
        setError('Failed to submit review. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="review-container success-state">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>Thank You!</h2>
          <p>Your review for Order <strong>#{orderNumber}</strong> has been submitted successfully.</p>
          <p className="redirect-text">Redirecting you back to your orders...</p>
        </div>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="reviews-section">
        <h2 className="section-title">My Reviews</h2>
        <p className="review-subtitle">Select a delivered order to share your feedback.</p>
        
        {loading ? (
          <div className="loading-spinner">Loading orders...</div>
        ) : orders.length > 0 ? (
          <div className="reviewable-orders-list">
            {orders.map(order => (
              <div key={order.id} className="reviewable-order-card">
                <div className="order-main-info">
                  <span className="order-number">Order #{order.order_number}</span>
                  <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <button 
                  className="write-review-btn-small"
                  onClick={() => navigate('/user/reviews', { state: { orderId: order.id, orderNumber: order.order_number } })}
                >
                  Write Review
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-reviews-state">
            <p>You have no delivered orders to review yet.</p>
            <button className="shop-now-btn" onClick={() => navigate('/')}>Shop Now</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="reviews-section">
      <div className="review-header">
        <h2 className="section-title">Write a Review</h2>
        <p className="review-subtitle">Share your experience with Order #{orderNumber}</p>
      </div>

      <div className="review-form-card">
        <form onSubmit={handleSubmit}>
          <div className="rating-section">
            <label className="input-label">How would you rate your experience?</label>
            <div className="star-rating">
              {[...Array(5)].map((star, index) => {
                index += 1;
                return (
                  <button
                    type="button"
                    key={index}
                    className={index <= (hover || rating) ? "star-btn on" : "star-btn off"}
                    onClick={() => setRating(index)}
                    onMouseEnter={() => setHover(index)}
                    onMouseLeave={() => setHover(rating)}
                  >
                    <span className="star">&#9733;</span>
                  </button>
                );
              })}
            </div>
            {rating > 0 && (
              <span className="rating-text">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </span>
            )}
          </div>

          <div className="comment-section">
            <label className="input-label" htmlFor="comment">Your Feedback</label>
            <textarea
              id="comment"
              className="review-textarea"
              placeholder="What did you like or dislike? How was the quality and delivery?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="6"
            />
          </div>

          {error && <div className="review-error">{error}</div>}

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-review-btn" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Reviews;
