import React, { useEffect, useMemo, useRef, useState } from 'react';
import API, { apiUrl, authHeaders } from '../services/api';
import './Chatbot.css';

const EMPTY_SESSION = { id: null, sessionName: 'New chat' };

const Chatbot = () => {
  const [session, setSession] = useState(EMPTY_SESSION);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
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
    fetchSessions();
  }, []);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchSessions = async () => {
    if (!user || !user.id) return;
    try {
      const response = await API.get(`/chatbot/sessions/user/${user.id}`);
      if (response.data.success) {
        setSessions(response.data.data || []);
        if (response.data.data && response.data.data.length > 0) {
          loadSession(response.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error loading chatbot sessions:', err);
    }
  };

  const loadSession = async (sessionData) => {
    setSession(sessionData);
    try {
      const response = await API.get(`/chatbot/sessions/${sessionData.id}/messages`);
      if (response.data.success) {
        setMessages(response.data.data || []);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Error loading session messages:', err);
      setMessages([]);
    }
  };

  const createSession = async () => {
    try {
      const response = await API.post('/chatbot/sessions', { sessionName: `Chat ${new Date().toLocaleTimeString()}` });
      if (response.data.success) {
        setSession(response.data.data);
        setMessages([]);
        fetchSessions();
      }
    } catch (err) {
      console.error('Error creating session:', err);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    setError(null);
    setLoading(true);

    const userText = inputValue.trim();
    setMessages((prev) => [...prev, { role: 'user', sender: 'user', message: userText, createdAt: new Date().toISOString() }]);
    setInputValue('');

    try {
      const response = await API.post('/chatbot/chat', {
        message: userText,
        sessionId: session?.id
      });

      if (response.data.success) {
        const botMessage = { role: 'assistant', sender: 'bot', message: response.data.data.reply, createdAt: new Date().toISOString() };
        setSession((prev) => ({ ...prev, id: response.data.data.sessionId }));
        setMessages((prev) => [...prev, botMessage]);
        fetchSessions();
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

  const handleSessionSelect = (sessionData) => {
    loadSession(sessionData);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatbot-page">
      <div className="chatbot-shell">
        <aside className="chatbot-sidebar">
          <div className="chatbot-sidebar-header">
            <h2>Chat Sessions</h2>
            <button className="chatbot-new-session" onClick={createSession}>New</button>
          </div>
          <div className="chatbot-sessions">
            {sessions.length === 0 && <div className="chatbot-empty">No chat sessions yet.</div>}
            {sessions.map((sessionData) => (
              <button
                key={sessionData.id}
                className={`chatbot-session-item ${sessionData.id === session.id ? 'active' : ''}`}
                onClick={() => handleSessionSelect(sessionData)}
              >
                <div>
                  <strong>{sessionData.sessionName || `Chat ${sessionData.id}`}</strong>
                  <div className="chatbot-session-meta">{new Date(sessionData.updatedAt).toLocaleString()}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="chatbot-main">
          <div className="chatbot-header">
            <div>
              <h1>{session.sessionName || 'New chat'}</h1>
              <p>{session.id ? `Session ID: ${session.id}` : 'Start a new chat with the shop assistant.'}</p>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={`${msg.sender}-${idx}`} className={`chatbot-message ${msg.sender}`}>
                <div className="chatbot-message-bubble">
                  <div className="chatbot-avatar">{msg.sender === 'bot' ? '🤖' : '🧍'}</div>
                  <div className="chatbot-message-text">{msg.message}</div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="chatbot-input-group">
            <textarea
              className="chatbot-input"
              rows="2"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question here..."
            />
            <button className="chatbot-send-btn" onClick={handleSend} disabled={loading}>
              {loading ? 'Sending…' : 'Send'}
            </button>
          </div>
          {error && <div className="chatbot-error">{error}</div>}
        </section>
      </div>
    </div>
  );
};

export default Chatbot;
