"use client";
import { useState } from "react";
import TypingTest from "@/components/TypingTest";
import Terminal from "@/components/Terminal";

const TABS = [
  { id: "typing", label: "Typing test", hint: "how fast can you type?" },
  { id: "terminal", label: "Terminal", hint: "type 'help' ↵" },
] as const;

export default function Fun() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("typing");
  const current = TABS.find((t) => t.id === tab)!;

  return (
    <section className="block" id="play">
      <div className="h-row" data-reveal>
        <h2>Take a break</h2>
        <span className="hint">{current.hint}</span>
      </div>
      <div className="tabs" role="tablist" data-active={TABS.findIndex((t) => t.id === tab)} data-reveal>
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* both stay mounted so switching tabs doesn't wipe a run or the terminal history */}
      <div hidden={tab !== "typing"} className="tab-panel" data-reveal>
        <TypingTest />
      </div>
      <div hidden={tab !== "terminal"} className="tab-panel">
        <Terminal />
      </div>
    </section>
  );
}
