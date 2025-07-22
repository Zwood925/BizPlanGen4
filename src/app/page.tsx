"use client";
import { useRef, useState, useEffect } from "react";
import styles from "./page.module.css";

interface Message {
  sender: "user" | "assistant";
  text: string;
  pdfUrl?: string;
}

const STORAGE_KEY = "ai-chat-history";
const SESSION_KEY = "ai-chat-sessionId";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setMessages(JSON.parse(saved));
      }
      let sid = localStorage.getItem(SESSION_KEY);
      if (!sid) {
        sid = `session-${Date.now()}`;
        localStorage.setItem(SESSION_KEY, sid);
      }
      setSessionId(sid);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-focus input after messages change
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages]);

  const handleClearChat = () => {
    setMessages([]);
    // Generate new session ID
    const newSessionId = `session-${Date.now()}`;
    setSessionId(newSessionId);
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_KEY, newSessionId);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = { sender: "user" as const, text: input };
    setMessages((msgs) => [...msgs, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text, sessionId }),
      });
      
      if (!res.ok) {
        if (res.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before sending another message.');
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setMessages((msgs) => [
        ...msgs,
        { 
          sender: "assistant", 
          text: data.reply || "(No reply)",
          pdfUrl: data.pdfUrl 
        },
      ]);
    } catch (e) {
      console.error('Frontend error:', e);
      setMessages((msgs) => [
        ...msgs,
        { sender: "assistant", text: "Sorry, there was an error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className={styles.page} style={{ minHeight: "100vh", position: "relative" }}>
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
          opacity: 0.3,
        }}
        onError={(e) => {
          // Silently handle video loading errors
          console.warn('Video failed to load, using fallback background');
        }}
      >
        <source src="/background-video.mp4" type="video/mp4" />
        {/* Fallback for browsers that don't support video */}
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          zIndex: -1,
        }} />
      </video>

      <main className={styles.main} style={{ width: "100%", alignItems: "center", position: "relative", zIndex: 1 }}>
        <div
          style={{
            width: "100%",
            maxWidth: 600,
            minHeight: 400,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: 20,
            padding: 24,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            overflow: "hidden",
          }}
        >
          {/* Clear Chat Button */}
          {messages.length > 0 && (
            <div style={{ 
              display: "flex", 
              justifyContent: "flex-end", 
              marginBottom: 16 
            }}>
              <button
                onClick={handleClearChat}
                style={{
                  padding: "8px 16px",
                  borderRadius: 20,
                  background: "rgba(255, 107, 107, 0.1)",
                  color: "#ff6b6b",
                  border: "1px solid rgba(255, 107, 107, 0.3)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 107, 107, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 107, 107, 0.1)";
                }}
              >
                🗑️ Clear Chat
              </button>
            </div>
          )}

          <div style={{ flex: 1, overflowY: "auto", marginBottom: 16 }}>
            {messages.length === 0 && (
              <div style={{ color: "#666", textAlign: "center", marginTop: 80, fontSize: 18 }}>
                Start the conversation!
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                  margin: "12px 0",
                }}
              >
                <div
                  style={{
                    background: msg.sender === "user" 
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                      : "rgba(255, 255, 255, 0.9)",
                    color: msg.sender === "user" ? "#fff" : "#333",
                    borderRadius: 20,
                    padding: "12px 18px",
                    maxWidth: "80%",
                    wordBreak: "break-word",
                    fontSize: 16,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    border: msg.sender === "user" ? "none" : "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  {msg.text}
                  {msg.pdfUrl && (
                    <div style={{ marginTop: 12 }}>
                      <a 
                        href={msg.pdfUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 16px",
                          background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
                          color: "#fff",
                          textDecoration: "none",
                          borderRadius: 25,
                          fontSize: 14,
                          fontWeight: 600,
                          boxShadow: "0 4px 12px rgba(255, 107, 107, 0.3)",
                          transition: "all 0.3s ease",
                          border: "none",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 107, 107, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 107, 107, 0.3)";
                        }}
                      >
                        📄 View PDF
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: "14px 20px",
                borderRadius: 25,
                border: "2px solid rgba(255, 255, 255, 0.3)",
                fontSize: 16,
                outline: "none",
                background: "rgba(255, 255, 255, 0.9)",
                color: "#333",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
                minHeight: "20px",
                lineHeight: "1.5",
              }}
              disabled={loading}
              autoFocus
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                padding: "0 24px",
                borderRadius: 25,
                background: loading || !input.trim() 
                  ? "rgba(0,0,0,0.1)" 
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                border: "none",
                fontSize: 16,
                fontWeight: 600,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow: loading || !input.trim() 
                  ? "none" 
                  : "0 4px 12px rgba(102, 126, 234, 0.3)",
              }}
              onMouseEnter={(e) => {
                if (!loading && input.trim()) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && input.trim()) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
                }
              }}
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>

        {/* Instruction Note */}
        <div style={{
          marginTop: 24,
          padding: "16px 24px",
          background: "rgba(255, 255, 255, 0.9)",
          borderRadius: 16,
          border: "1px solid rgba(255, 255, 255, 0.3)",
          backdropFilter: "blur(10px)",
          maxWidth: 600,
          margin: "24px auto 0",
          textAlign: "center",
          fontSize: 14,
          color: "#666",
          lineHeight: 1.5,
        }}>
          💡 <strong>Ready for your Business Plan?</strong><br />
          When you think we've discussed enough and are ready for your Business Plan, just type in <strong>READY</strong> (all caps, nothing else) and hit send, then give me a couple minutes and I'll have it back to you ASAP! 🚀
        </div>
      </main>
    </div>
  );
}
