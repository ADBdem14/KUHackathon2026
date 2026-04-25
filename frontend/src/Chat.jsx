import { useState } from "react";
import { useEffect } from "react";
import "./Chat.css";

export default function Chat({ activeChat }) {
  const [messages, setMessages] = useState(() => {
    if (activeChat) {
      return [
        {
          text: `You are now connected: ${activeChat.a} 🤝 ${activeChat.b}`, 
          sender: "ai",
        },
        {
          text: `Common skills: ${activeChat.common.join(", ")}`,
          sender: "ai",
        },
      ];
    }
    return [{ text: "Select a match to start chatting 🤖", sender: "ai"}];
  });

  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);

    setInput("");

    // 🔥 Fake AI response (replace later with backend)
    setTimeout(() => {
      const aiReply = {
        text: "I can help you find collaborators based on your skills!",
        sender: "ai",
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 700);
  };

  useEffect(() => {
    if (activeChat) {
      setMessages([
        {
          text: `Connected: ${activeChat.a} 🤝 ${activeChat.b}`,
          sender: "ai",
        },
        {
          text: `Try introducing yourself`,
          sender: "ai",
        },
      ]);
    }
  }, [activeChat])

  return (
    <div className="chat-container">
      <h2>💬 AI Chat</h2>

      {activeChat && (
        <p className="chat-header">
          Chatting: {activeChat.a} 🤝 {activeChat.b}
        </p>
      )}

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}