"use client";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { chatQA, profile } from "@/data/content";

type Msg = { from: "bot" | "me"; text: string };

const GREETING = "Hi! I'm Umair's assistant. Ask me anything about his work — or tap a question below.";

// Canned answers for now: match free text against the question with the most shared words.
function answer(question: string) {
  const exact = chatQA.find((qa) => qa.q === question);
  if (exact) return exact.a;
  const words = question.toLowerCase().match(/[a-z]{3,}/g) ?? [];
  let best = { score: 0, a: "" };
  for (const qa of chatQA) {
    const hay = (qa.q + " " + qa.a).toLowerCase();
    const score = words.filter((w) => hay.includes(w)).length;
    if (score > best.score) best = { score, a: qa.a };
  }
  return best.score >= 2
    ? best.a
    : `Good question — that one's best answered by Umair directly: ${profile.email}`;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "bot", text: GREETING }]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [msgs, typing]);

  function ask(q: string) {
    const text = q.trim();
    if (!text || typing) return;
    setMsgs((m) => [...m, { from: "me", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: "bot", text: answer(text) }]);
    }, 700);
  }

  const asked = new Set(msgs.filter((m) => m.from === "me").map((m) => m.text));
  const suggestions = chatQA.filter((qa) => !asked.has(qa.q));

  return (
    <>
      {open && (
        <div className="chat" role="dialog" aria-label="Umair Support chat">
          <div className="chat-head">
            <div className="avatar">U</div>
            <div className="who">
              <strong>Umair Support</strong>
              <small>usually replies instantly</small>
            </div>
            <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={16} />
            </button>
          </div>
          <div className="chat-msgs" ref={listRef}>
            {msgs.map((m, i) => (
              <div key={i} className={`msg ${m.from}`}>
                {m.text}
              </div>
            ))}
            {typing && (
              <div className="msg bot">
                <span className="chat-typing">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            )}
          </div>
          {suggestions.length > 0 && (
            <div className="chips">
              {suggestions.map((qa) => (
                <button key={qa.q} className="chip" onClick={() => ask(qa.q)}>
                  {qa.q}
                </button>
              ))}
            </div>
          )}
          <form
            className="chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about Umair…" aria-label="Message" />
            <button className="icon-btn" type="submit" aria-label="Send">
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
      <button className="chat-fab" onClick={() => setOpen((o) => !o)} aria-label={open ? "Close chat" : "Open chat"}>
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  );
}
