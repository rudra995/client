import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import './chatbot.css';

// Add Poppins font from Google Fonts
const FontImport = () => {
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);
  
  return null;
};

const socket = io("https://server-vueq.onrender.com", {
  transports: ["websocket"],
});

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { text: "Hi there! I'm SpendWise, your personal finance assistant. How can I help you today?", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    socket.on('bot_response', (data) => {
      setIsTyping(false);
      setMessages((prevMessages) => [...prevMessages, { text: data, isUser: false }]);
    });

    socket.on('typing', () => {
      setIsTyping(true);
    });

    return () => {
      socket.off('bot_response');
      socket.off('typing');
    };
  }, []);

  const handleSendMessage = () => {
    if (input.trim() === '') return;

    socket.emit('user_message', input);

    setMessages((prevMessages) => [
      ...prevMessages,
      { text: input, isUser: true }
    ]);

    setInput('');
    setIsTyping(true);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  return (
    <div className="chatbot-card">
      <FontImport />
      <div className="chatbot-header">
        <h2>SpendWise</h2>
      </div>
      <div className="chatbot-content">
        <div className="chatbot-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chatbot-message ${msg.isUser ? 'user-message' : 'bot-message'}`}
            >
              {msg.text}
            </div>
          ))}
          {isTyping && (
            <div className="chatbot-message bot-message typing-indicator">
              <span></span><span></span><span></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="chatbot-input-area">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask SpendWise about your finances..."
          />
          <button onClick={handleSendMessage}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}