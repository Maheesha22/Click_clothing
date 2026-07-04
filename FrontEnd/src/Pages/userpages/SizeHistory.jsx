import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/header';
import Footer from '../../Components/footer';
import { getSizeRecommendations, deleteSizeRecommendation } from '../../services/sizeRecommendationService';

const SizeHistory = () => {
  const storedUser = JSON.parse(sessionStorage.getItem('user') || 'null');
  const isLoggedIn = !!(storedUser?.email);
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    if (!isLoggedIn || !storedUser?.id) {
      setLoading(false);
      return;
    }

    getSizeRecommendations(storedUser.id)
      .then((res) => {
        setHistory(res.data);
        setError('');
      })
      .catch((err) => {
        console.error('Error loading size history:', err);
        setError(!err.response
          ? '⚠️ Cannot connect to server. Make sure the backend is running.'
          : '⚠️ Could not load size recommendation history.');
      })
      .finally(() => setLoading(false));
  }, [isLoggedIn, storedUser?.id]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleDelete = async (id) => {
    try {
      await deleteSizeRecommendation(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      showToast('Deleted recommendation');
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Could not delete recommendation', 'error');
    }
  };

  return (
    <>
      <Header />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', minHeight: '60vh' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: "'Jost', sans-serif", fontSize: '14px', 
            fontWeight: '500', color: '#888', padding: '0',
            marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px',
            textTransform: 'uppercase', letterSpacing: '0.5px'
          }}
        >
          <span style={{ fontSize: '18px' }}>←</span> Back
        </button>
    <div className="size-history-page">
      <div className="size-history-header">
        <h2 className="section-title">Size Recommendation History</h2>
        <p className="section-subtitle">
          Your saved size suggestions are stored here for easy reuse and comparison.
        </p>
      </div>

      {!isLoggedIn ? (
        <div className="empty-state-card">
          <p>Please log in to view your size recommendation history.</p>
          <a href="/login" className="action-link">Login now</a>
        </div>
      ) : loading ? (
        <div className="empty-state-card">Loading your size history...</div>
      ) : error ? (
        <div className="empty-state-card" style={{ color: '#b33939' }}>{error}</div>
      ) : history.length === 0 ? (
        <div className="empty-state-card">
          <p>No size recommendations yet.</p>
          <p>Use the Smart Size tool on a product page to create your first recommendation.</p>
        </div>
      ) : (
        <div className="size-history-grid">
          {history.map((item) => (
            <div key={item.id} className="size-history-card">
              <div className="size-history-content">
                <div>
                  <h3>{item.productName || 'General Recommendation'}</h3>
                  <p className="history-meta">{item.bodyType} build • {item.recommendedSize}</p>
                </div>
                <div className="history-actions">
                  <span className="history-size">{item.recommendedSize}</span>
                  <button className="history-delete" onClick={() => handleDelete(item.id)}>
                    Delete
                  </button>
                </div>
              </div>
              <div className="size-history-details">
                <span>Chest estimate: {item.chestEstimate ? `${item.chestEstimate} in` : '–'}</span>
                <span>Confidence: {item.confidence ? `${Math.round(item.confidence * 100)}%` : '–'}</span>
                <span>{new Date(item.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast.show && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <style>{`
        .size-history-page { padding: 1.5rem; }
        .size-history-header { margin-bottom: 1.5rem; }
        .size-history-header .section-title { margin-bottom: 0.35rem; font-size: 1.85rem; }
        .section-subtitle { color: #555; max-width: 36rem; line-height: 1.6; }
        .empty-state-card { padding: 2rem; border: 1px solid #e7e7e7; border-radius: 18px; background: #fff; color: #444; }
        .action-link { display: inline-block; margin-top: 0.85rem; color: #111; text-decoration: underline; }
        .size-history-grid { display: grid; gap: 1rem; }
        .size-history-card { padding: 1.2rem; border: 1px solid #e7e7e7; border-radius: 18px; background: #fff; }
        .size-history-content { display: flex; justify-content: space-between; gap: 1rem; align-items: center; }
        .size-history-content h3 { margin: 0; font-size: 1.1rem; }
        .history-meta { color: #666; font-size: 0.95rem; margin-top: 0.35rem; }
        .history-actions { display: flex; gap: 0.75rem; align-items: center; }
        .history-size { font-size: 1rem; font-weight: 700; }
        .history-delete { border: 1px solid #ddd; background: #fff; padding: 0.55rem 0.8rem; border-radius: 12px; cursor: pointer; color: #b33939; }
        .size-history-details { margin-top: 1rem; display: grid; gap: 0.4rem; color: #555; font-size: 0.95rem; }
        .toast { position: fixed; bottom: 24px; right: 24px; background: #111; color: #fff; padding: 0.95rem 1.2rem; border-radius: 14px; box-shadow: 0 12px 30px rgba(0,0,0,0.16); }
      `}</style>
    </div>
    </div>
    <Footer />
    </>
  );
};

export default SizeHistory;
