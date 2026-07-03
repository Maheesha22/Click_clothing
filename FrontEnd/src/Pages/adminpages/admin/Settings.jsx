/**
 * SETTINGS PAGE
 * With notification toggles
 */

import { useState, useEffect } from 'react';
import API from '../../../services/api';

export default function Settings({ toast }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    new_order_alerts: true,
    low_stock_alerts: true,
    payment_failures: true,
    weekly_reports: true,
    customer_signups: false
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await API.get('/notifications/settings');
      if (res.data.success) {
        setSettings(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      if (toast) toast('❌', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    
    try {
      setSaving(true);
      await API.put('/notifications/settings', newSettings);
      if (toast) toast('✅', 'Settings updated!');
    } catch (error) {
      if (toast) toast('❌', 'Failed to update settings');
      loadSettings();
    } finally {
      setSaving(false);
    }
  };

  const handleStoreSave = (e) => {
    e.preventDefault();
    if (toast) toast('✅', 'Store settings saved!');
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Configure your store preferences</p>
      </div>

      <div className="settings-grid">
        {/* Store Information */}
        <div className="settings-card">
          <h2>🏪 Store Information</h2>
          <form onSubmit={handleStoreSave}>
            <div className="form-group">
              <label>Store Name</label>
              <input defaultValue="Click Clothing Store" />
            </div>
            <div className="form-group">
              <label>Contact Email</label>
              <input defaultValue="admin@clickclothing.com" />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input defaultValue="+94 76 7972434" />
            </div>
            <div className="form-group">
              <label>Currency</label>
              <select>
                <option>LKR (Rs)</option>
                <option>USD ($)</option>
              </select>
            </div>
            <button type="submit" className="save-btn">Save Changes</button>
          </form>
        </div>

        {/* Notification Settings */}
        <div className="settings-card">
          <h2>🔔 Notification Settings</h2>
          
          {loading ? (
            <div className="loading-state">Loading settings...</div>
          ) : (
            <div className="notification-list">
              {[
                { key: 'new_order_alerts', label: 'New Order Alerts', desc: 'Notify for every new order' },
                { key: 'low_stock_alerts', label: 'Low Stock Alerts', desc: 'Alert when below threshold' },
                { key: 'payment_failures', label: 'Payment Failures', desc: 'Alert on failed transactions' },
                { key: 'weekly_reports', label: 'Weekly Reports', desc: 'Auto email every Monday' },
                { key: 'customer_signups', label: 'Customer Sign-ups', desc: 'Notify on new registrations' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="notification-item">
                  <div>
                    <div className="notif-label">{label}</div>
                    <div className="notif-desc">{desc}</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings[key] || false}
                      onChange={() => toggleSetting(key)}
                      disabled={saving}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .settings-page {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .settings-header {
          margin-bottom: 30px;
        }

        .settings-header h1 {
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 5px 0;
          color: #111;
        }

        .settings-header p {
          color: #666;
          font-size: 16px;
          margin: 0;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .settings-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          border: 1px solid #eee;
        }

        .settings-card h2 {
          font-size: 18px;
          margin: 0 0 20px 0;
          color: #111;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #555;
          margin-bottom: 4px;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px 12px;
          border: 1.5px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          box-sizing: border-box;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #111;
        }

        .save-btn {
          background: #111;
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 8px;
          transition: background 0.2s;
        }

        .save-btn:hover {
          background: #333;
        }

        .loading-state {
          text-align: center;
          padding: 40px 20px;
          color: #999;
        }

        .notification-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .notification-item:last-child {
          border-bottom: none;
        }

        .notif-label {
          font-size: 14px;
          font-weight: 600;
          color: #111;
        }

        .notif-desc {
          font-size: 12px;
          color: #999;
          margin-top: 2px;
        }

        .toggle-switch {
          position: relative;
          width: 48px;
          height: 26px;
          flex-shrink: 0;
          cursor: pointer;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #ccc;
          border-radius: 26px;
          transition: 0.3s;
        }

        .toggle-slider:before {
          content: "";
          position: absolute;
          height: 20px;
          width: 20px;
          left: 3px;
          bottom: 3px;
          background: white ;
          border-radius: 50%;
          transition: 0.3s;
        }

        .toggle-switch input:checked + .toggle-slider {
          background: #111;
        }

        .toggle-switch input:checked + .toggle-slider:before {
          transform: translateX(22px);
        }

        .toggle-switch input:disabled + .toggle-slider {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
