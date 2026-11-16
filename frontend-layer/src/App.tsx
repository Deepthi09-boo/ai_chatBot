
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const suggestions = [
  {
    icon: "💡",
    title: "Brainstorm ideas",
    description: "Help me generate creative ideas",
    prompt: "Help me brainstorm some creative ideas for a new project.",
  },
  {
    icon: "💻",
    title: "Write code",
    description: "Help me with programming",
    prompt: "Help me write a Python program.",
  },
  {
    icon: "📚",
    title: "Learn something",
    description: "Explain complex topics simply",
    prompt: "Explain artificial intelligence in simple terms.",
  },
  {
    icon: "✍️",
    title: "Write something",
    description: "Create content and improve writing",
    prompt: "Help me write a professional email.",
  },
];

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Automatically scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // Send message to backend
  const handleSendMessage = async (text?: string) => {
    const currentInput = (text ?? input).trim();

    if (!currentInput || loading) return;

    const userMessage: Message = {
      role: "user",
      content: currentInput,
    };

    // Keep previous conversation as history
    const history = [...messages];

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/chat`,
        {
          message: currentInput,
          history: history,
        }
      );

      const aiReply = response.data?.data?.reply;

      if (!aiReply) {
        throw new Error("Invalid response from server");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: aiReply,
      };

      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Chat error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, something went wrong. Please check your server connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  // Enter to send, Shift + Enter for new line
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Start new conversation
  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setLoading(false);
    textareaRef.current?.focus();
  };

  // Copy AI response
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="app-container">

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>

        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-icon">✦</div>
            <span>Nova AI</span>
          </div>

          <button
            className="icon-button mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <button
          className="new-chat-button"
          onClick={handleNewChat}
        >
          <span>＋</span>
          New conversation
        </button>

        <div className="sidebar-section">
          <p className="sidebar-label">WORKSPACE</p>

          <div className="sidebar-item active">
            <span>◈</span>
            AI Assistant
          </div>

          <div className="sidebar-item">
            <span>✧</span>
            Explore ideas
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="profile-card">
            <div className="avatar">N</div>

            <div>
              <p className="profile-name">Nova User</p>
              <p className="profile-status">AI Workspace</p>
            </div>

            <span className="profile-dots">•••</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* HEADER */}
        <header className="topbar">

          <button
            className="icon-button menu-button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>

          <div className="header-title">
            <span>Nova AI</span>
            <span className="model-badge">AI Assistant</span>
          </div>

          <button
            className="clear-button"
            onClick={handleNewChat}
          >
            ＋ New chat
          </button>
        </header>

        {/* CHAT AREA */}
        <div className="chat-area">

          {messages.length === 0 ? (

            /* WELCOME SCREEN */
            <div className="welcome-screen">

              <div className="welcome-icon">
                <span>✦</span>
              </div>

              <p className="welcome-subtitle">
                YOUR PERSONAL AI ASSISTANT
              </p>

              <h1>
                Hello there! <br />
                <span>What can I help you with?</span>
              </h1>

              <p className="welcome-description">
                I'm here to help you think, create, learn,
                and solve problems. Let's make something
                amazing together.
              </p>

              <div className="suggestion-grid">

                {suggestions.map((item, index) => (
                  <button
                    className="suggestion-card"
                    key={index}
                    onClick={() => handleSendMessage(item.prompt)}
                  >
                    <span className="suggestion-icon">
                      {item.icon}
                    </span>

                    <span className="suggestion-title">
                      {item.title}
                    </span>

                    <span className="suggestion-description">
                      {item.description}
                    </span>

                    <span className="suggestion-arrow">
                      ↗
                    </span>
                  </button>
                ))}

              </div>
            </div>

          ) : (

            /* CHAT MESSAGES */
            <div className="messages-container">

              {messages.map((msg, index) => (

                <div
                  className={`message-row ${msg.role}`}
                  key={index}
                >

                  {msg.role === "assistant" && (
                    <div className="message-avatar">
                      ✦
                    </div>
                  )}

                  <div className="message-content">

                    <div className="message-name">
                      {msg.role === "user" ? "You" : "Nova AI"}
                    </div>

                    <div className="message-bubble">
                      {msg.content}
                    </div>

                    {msg.role === "assistant" && (
                      <button
                        className="copy-button"
                        onClick={() => handleCopy(msg.content)}
                        title="Copy response"
                      >
                        ◫ Copy
                      </button>
                    )}

                  </div>

                </div>

              ))}

              {/* TYPING INDICATOR */}
              {loading && (
                <div className="message-row assistant">

                  <div className="message-avatar">
                    ✦
                  </div>

                  <div className="message-content">

                    <div className="message-name">
                      Nova AI
                    </div>

                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                      <small>Thinking...</small>
                    </div>

                  </div>
                </div>
              )}

              <div ref={chatEndRef} />

            </div>
          )}

        </div>

        {/* INPUT AREA */}
        <footer className="input-section">

          <form
            className="chat-input-container"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Nova AI..."
              disabled={loading}
              rows={1}
            />

            <button
              type="submit"
              className="send-button"
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              ↑
            </button>

          </form>

          <p className="input-footer">
            Nova AI can make mistakes. Verify important information.
          </p>

        </footer>

      </main>
    </div>
  );
}

export default App;
