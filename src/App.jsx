import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io("http://127.0.0.1:5000", {
  transports: ["websocket"],
});

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    socket.on('bot_response', (data) => {
      setMessages(prev => [...prev, { sender: 'SpendWise', text: data }]);
    });

    return () => {
      socket.off('bot_response');
    };
  }, []);

  const sendMessage = () => {
    if (input.trim() !== '') {
      socket.emit('user_message', input);
      setMessages(prev => [...prev, { sender: 'Me', text: input }]);
      setInput('');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>💬 Chatbot</h1>
      <div style={{ marginBottom: '10px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.sender === 'Me' ? 'right' : 'left' }}>
            <b>{msg.sender}:</b> {msg.text}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;