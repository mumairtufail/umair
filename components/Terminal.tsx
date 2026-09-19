"use client";
import { useState, useRef, useEffect } from "react";
import { terminalCommands } from "@/data/content";

type Line = { type: "out" | "cmd"; text: string };

const PROMPT = "guest@umair:~$";

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>([
    { type: "out", text: "Last login: connected as guest. Type help to see what I can do." },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight);
  }, [lines]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      if (!history.length) return;
      e.preventDefault();
      const idx = e.key === "ArrowUp" ? Math.min(histIdx + 1, history.length - 1) : Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx === -1 ? "" : history[idx]);
      return;
    }
    if (e.key !== "Enter") return;

    const val = input.trim();
    const key = val.split(" ")[0].toLowerCase();
    setInput("");
    setHistIdx(-1);
    if (val) setHistory((h) => [val, ...h]);

    if (key === "clear") {
      setLines([]);
      return;
    }
    const next: Line[] = [{ type: "cmd", text: val }];
    if (val) next.push({ type: "out", text: terminalCommands[key] ?? `command not found: ${val}. try help` });
    setLines((l) => [...l, ...next]);
  }

  return (
    <div className="term" onClick={() => inputRef.current?.focus()}>
      <div className="term-bar">
        <span className="dot r" />
        <span className="dot y" />
        <span className="dot g" />
        <span className="title">guest@umair: ~</span>
      </div>
      <div className="term-body" ref={bodyRef}>
        {lines.map((l, i) => (
          <div key={i} className={l.type === "out" ? "out" : ""} style={{ whiteSpace: "pre-wrap" }}>
            {l.type === "cmd" ? (
              <>
                <span style={{ color: "var(--term-green)" }}>{PROMPT}</span> {l.text}
              </>
            ) : (
              l.text
            )}
          </div>
        ))}
        <div className="term-input-line">
          <span style={{ color: "var(--term-green)" }}>{PROMPT}</span>
          <input
            ref={inputRef}
            className="term-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            spellCheck={false}
            aria-label="Terminal input"
          />
        </div>
      </div>
    </div>
  );
}
