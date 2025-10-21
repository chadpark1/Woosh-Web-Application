import { useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "system", content: "You are a helpful assistant." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const next = [...messages, { role: "user", content: input }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next })
      });
      const data = await res.json();
      if (data.reply !== undefined) {
        setMessages([...next, { role: "assistant", content: data.reply }]);
      } else {
        setMessages([...next, { role: "assistant", content: "Error: no reply." }]);
      }
    } catch (err) {
      setMessages([...next, { role: "assistant", content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto", fontFamily: "ui-sans-serif, system-ui" }}>
      <h1>GPT Chat</h1>
      <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8, minHeight: 300 }}>
        {messages.filter(m => m.role !== "system").map((m, i) => (
          <div key={i} style={{ margin: "0.5rem 0" }}>
            <strong>{m.role === "user" ? "You" : "Assistant"}: </strong>
            <span>{m.content}</span>
          </div>
        ))}
        {loading && <div><em>Thinking…</em></div>}
      </div>

      <form onSubmit={sendMessage} style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything…"
          style={{ flex: 1, padding: 12, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <button type="submit" disabled={loading} style={{ padding: "0 16px" }}>
          Send
        </button>
      </form>
    </div>
  );
}