import React from 'react';
import { useOutletContext } from 'react-router-dom';

const Settings = () => {
  const { storedUser, isLoggedIn } = useOutletContext();

  return (
    <div className="settings-section">
      <h2 className="section-title">Settings</h2>
      <div className="settings-content">
        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '14px', color: '#888' }}>
          {isLoggedIn
            ? `Manage your account settings, ${storedUser.firstName}.`
            : 'Please login to manage your settings.'}
        </p>
      </div>
    </div>
  );
};

export default Settings;
