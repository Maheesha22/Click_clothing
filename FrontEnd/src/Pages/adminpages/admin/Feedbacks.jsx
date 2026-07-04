import { useState, useEffect } from 'react';
import API from '../../../services/api';

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await API.get('/feedbacks/all');
      if (response.data.success) {
        setFeedbacks(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    try {
      const response = await API.delete(`/feedbacks/${id}`);
      if (response.data.success) {
        setFeedbacks(feedbacks.filter(fb => fb.id !== id));
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  const totalFeedbacks = feedbacks.length;

  return (
    <div className="view">
      {/* Header */}
      <div className="ph">
        <div>
          <h1 className="ph-title">
            Customer Feedbacks <span className="ph-badge">{totalFeedbacks} total</span>
          </h1>
          <p className="ph-sub">View and manage all customer feedback submissions.</p>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="rv-empty" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading feedbacks…</div>
        ) : feedbacks.length === 0 ? (
          <div className="rv-empty" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>No feedbacks found</div>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl" style={{ minWidth: 1000 }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User Name</th>
                  <th>Email Address</th>
                  <th>Message</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.slice(0, 10).map(fb => (
                  <tr key={fb.id}>
                    <td>
                      <span className="cell-id">FB-{fb.id}</span>
                    </td>
                    <td>
                      <span className="cell-nm">{fb.name}</span>
                    </td>
                    <td>
                      <span className="cell-sub">{fb.email}</span>
                    </td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'normal', wordWrap: 'break-word' }}>
                      <p className="rv-comment" style={{ fontSize: '13px', margin: 0 }}>
                        {fb.message}
                      </p>
                    </td>
                    <td>
                      <div className="rv-date">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    {/* <td>
                      <button
                        onClick={() => handleDelete(fb.id)}
                        style={{
                          background: '#fee2e2',
                          color: '#ef4444',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        Delete
                      </button>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
