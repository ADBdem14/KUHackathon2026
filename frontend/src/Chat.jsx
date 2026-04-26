import { useEffect, useState } from "react";
import "./Chat.css";

const starterPrompts = [
  "Who should lead the frontend build?",
  "What is the fastest MVP for judges?",
  "How do we divide roles for tonight?",
];

function getIntroMessages(activeChat) {
  if (!activeChat) {
    return [
      {
        id: 1,
        sender: "ai",
        text: "Run the matchmaker and select a pairing to start the fake AI discussion.",
      },
    ];
  }

  return [
    {
      id: 1,
      sender: "ai",
      text: `Connected ${activeChat.user.name} with ${activeChat.project.title}.`,
    },
    {
      id: 2,
      sender: "ai",
      text: `Shared skills: ${activeChat.common.join(", ") || "No direct overlap, but the pairing still has complementary value."}`,
    },
    {
      id: 3,
      sender: "ai",
      text: activeChat.summary,
    },
  ];
}

export default function Chat({ activeChat, onCommentGenerated }) {
  const [messages, setMessages] = useState(getIntroMessages(activeChat));
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setMessages(getIntroMessages(activeChat));
    setInput("");
  }, [activeChat]);

  const sendMessage = async (draft) => {
    const message = (draft ?? input).trim();

    if (!message || !activeChat || isSending) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: "user",
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          context: activeChat,
        }),
      });

      if (!response.ok) {
        throw new Error("The AI response could not be generated.");
      }

      const data = await response.json();
      const aiMessage = {
        id: Date.now() + 1,
        text: data.reply,
        sender: "ai",
      };

      setMessages((current) => [...current, aiMessage]);

      if (data.commentary) {
        onCommentGenerated?.(data.commentary);
      }
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 2,
          text: error.message || "The demo AI hit a temporary problem.",
          sender: "ai",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="chat-panel">
      <div className="chat-panel-heading">
        <div>
          <h2>AI Discussion</h2>
          <p>
            {activeChat
              ? `Active pairing: ${activeChat.user.name} and ${activeChat.project.title}`
              : "Waiting for a selected match"}
          </p>
        </div>
        <span className={`live-pill ${activeChat ? "ready" : ""}`}>
          {activeChat ? "Demo ready" : "Idle"}
        </span>
      </div>

      <div className="starter-row">
        {starterPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="starter-chip"
            disabled={!activeChat || isSending}
            onClick={() => sendMessage(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="chat-box">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder={activeChat ? "Ask the fake AI to guide the team..." : "Select a match first"}
          value={input}
          disabled={!activeChat || isSending}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              sendMessage();
            }
          }}
        />
        <button type="button" onClick={() => sendMessage()} disabled={!activeChat || isSending}>
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </section>
  );
}
