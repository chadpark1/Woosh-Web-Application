import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import "./chat.css";

const LOGO_SRC = "/woosh-logo.png";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasChatted, setHasChatted] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I’m the Woosh assistant. Ask me about how we handle local deliveries, launch timing, pricing, or partnerships."
    }
  ]);

  const samples = useMemo(
    () => [
      "What is Woosh and how does it work?",
      "What can I ship with Woosh (size & weight limits)?",
      "How are delivery prices calculated?",
      "How can my business join the waitlist or become a pilot partner?",
      "How do you ensure driver and shipment safety?",
    ],
    []
  );

  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send(content) {
    if (!content.trim()) return;
    setHasChatted(true);
    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next })
      });

      if (!res.ok) {
        const errPayload = await res.json().catch(() => ({}));
        throw new Error(errPayload.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply =
        data?.reply ??
        data?.choices?.[0]?.message?.content ??
        "Sorry — the server returned no content.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ Server error: ${err.message}` }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    send(input);
  }

  return (
    <>
      {}
      {!open && (
        <button
          className="cw-fab"
          aria-label="Open chat"
          onClick={() => setOpen(true)}
        >
          <img
            src={LOGO_SRC}
            alt="Woosh"
            width="26"
            height="26"
            style={{ borderRadius: "50%", display: "block" }}
          />
        </button>
      )}

      {/* Popup panel */}
      <div
        className={`cw-wrap ${open ? "cw-open" : ""}`}
        role="dialog"
        aria-label="Chatbot"
      >
        <div className="cw-card">
          {/* Header */}
          <div className="cw-head">
            <div className="cw-brand">
              <img
                src={LOGO_SRC}
                alt="Woosh"
                width="24"
                height="24"
                style={{ borderRadius: "6px" }}
              />
              <span className="cw-title">Woosh Chat</span>
            </div>
            <button
              className="cw-x"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="cw-body">
            <div className="cw-stream">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`cw-msg ${
                    m.role === "user" ? "cw-user" : "cw-assistant"
                  }`}
                >
                  <div className="cw-bubble">
                    {m.role === "assistant" ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                        components={{
                          a: ({ node, ...props }) => (
                            <a {...props} target="_blank" rel="noopener noreferrer" />
                          ),
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    ) : (
                      <span>{m.content}</span>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="cw-msg cw-assistant">
                  <div className="cw-bubble cw-typing">
                    <span className="cw-dot"></span>
                    <span className="cw-dot"></span>
                    <span className="cw-dot"></span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Sample prompts (hide after first user send) */}
            {!hasChatted && (
              <div className="cw-samples" aria-label="Sample questions">
                {samples.map((q, i) => (
                  <button key={i} className="cw-chip" onClick={() => send(q)}>
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Composer */}
          <form className="cw-inputrow" onSubmit={onSubmit}>
            <input
              className="cw-input"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Message input"
            />
            <button className="cw-send" type="submit" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
}