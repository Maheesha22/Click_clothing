import React, { useEffect, useMemo, useRef, useState } from 'react';
import API from '../services/api';
import './ChatWidget.css';

const ChatWidget = ({ open = false, onClose }) => {
  const [messages, setMessages] = useState([
    { sender: 'bot', message: 'Hello! I can help with shirts, sizes, colors, prices, and order status.', createdAt: new Date().toISOString() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  const user = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const createSession = async () => {
      try {
        const response = await API.post('/chatbot/sessions', { sessionName: `Chat ${new Date().toLocaleTimeString()}` });
        if (response.data.success) {
          setSessionId(response.data.data?.id || null);
        }
      } catch (err) {
        console.error('Error creating chatbot session:', err);
      }
    };

    createSession();
  }, [open, user]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    setError(null);
    setLoading(true);
    setMessages((prev) => [...prev, { sender: 'user', message: userText, createdAt: new Date().toISOString() }]);
    setInputValue('');

    try {
      const response = await API.post('/chatbot/chat', {
        message: userText,
        sessionId
      });

      if (response.data.success) {
        setMessages((prev) => [...prev, { sender: 'bot', message: response.data.data.reply, createdAt: new Date().toISOString() }]);
        setSessionId(response.data.data.sessionId || sessionId);
      } else {
        setError(response.data.message || 'Chatbot failed to answer.');
      }
    } catch (err) {
      console.error('Chatbot error:', err);
      setError('Unable to send message.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  if (!open) return null;

  return (
    <div className="chat-widget-panel">
      <div className="chat-widget-header">
        <div>
          <strong>Store Assistant</strong>
          <div className="chat-widget-subtitle">Ask about shirts, prices, sizes, colors, and orders</div>
        </div>
        <button type="button" className="chat-widget-close" onClick={onClose} aria-label="Close chat">
          ×
        </button>
      </div>

      <div className="chat-widget-messages">
        {messages.map((msg, index) => (
          <div key={`${msg.sender}-${index}`} className={`chat-widget-message ${msg.sender}`}>
            <div className="chat-widget-bubble">{msg.message}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chat-widget-input-group">
        <textarea
          className="chat-widget-input"
          rows="2"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about shirts or order status..."
        />
        <button type="button" className="chat-widget-send" onClick={handleSend} disabled={loading}>
          {loading ? '...' : 'Send'}
        </button>
      </div>
      {error && <div className="chat-widget-error">{error}</div>}
    </div>
  );
};

export default ChatWidget;
