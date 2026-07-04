import React, { useState } from 'react';
import './ChatLauncher.css';
import ChatWidget from './ChatWidget';

const ChatLauncher = ({ title = 'Chat with assistant', icon = '💬', floating = false }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={`chat-launcher-button${floating ? ' chat-launcher-floating' : ''}`}
        title={title}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="chat-launcher-icon" aria-hidden="true">{icon}</span>
        <span className="chat-launcher-label">Chat</span>
      </button>
      <ChatWidget open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default ChatLauncher;
