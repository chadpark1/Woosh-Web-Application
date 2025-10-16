import { useState } from "react";
import "./App.css"; 

function App() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm Woosh assistant 🚀 How can I help you today?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    const botMsg = { role: "bot", text: "🤖 (Pretend I'm answering from AI...)" };
    setMessages([...messages, userMsg, botMsg]);
    setInput("");
  };

  return (
    <div className="chat-container">
      <header className="chat-header">💬 Woosh Chatbot (UI Prototype)</header>

      <div className="chat-body">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.text}
          </div>
        ))}
      </div>

      <footer className="chat-footer">
        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button className="chat-button" onClick={handleSend}>
          Send
        </button>
      </footer>
    </div>
  );
}

export default App;
