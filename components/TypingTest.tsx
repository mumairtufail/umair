"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { RotateCcw, Volume2, VolumeX } from "lucide-react";
import { typingSentences } from "@/data/content";
import { playKey } from "@/lib/keySound";

const DURATIONS = [15, 30, 60] as const;
type Duration = (typeof DURATIONS)[number];
type Phase = "ready" | "running" | "done";

// Best WPM persisted in localStorage, read via an external store so SSR renders 0 without a hydration mismatch.
const BEST_KEY = "typing-best";
function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(BEST_KEY, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(BEST_KEY, cb);
  };
}
function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}
function saveBest(wpm: number) {
  try {
    localStorage.setItem(BEST_KEY, String(wpm));
  } catch {}
  window.dispatchEvent(new Event(BEST_KEY));
}

function verdict(wpm: number) {
  if (wpm >= 90) return "Are you a keyboard? 🤖";
  if (wpm >= 70) return "Fast. Genuinely fast. ⚡";
  if (wpm >= 50) return "Solid, faster than most people.";
  if (wpm >= 30) return "Nice and steady. One more round?";
  return "Warming up. Try again?";
}

function countCorrect(typed: string, target: string) {
  let n = 0;
  for (let i = 0; i < typed.length; i++) if (typed[i] === target[i]) n++;
  return n;
}

export default function TypingTest() {
  const [duration, setDuration] = useState<Duration>(30);
  const [phase, setPhase] = useState<Phase>("ready");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [doneCorrect, setDoneCorrect] = useState(0); // correct chars from completed snippets
  const [keystrokes, setKeystrokes] = useState(0);
  const [errors, setErrors] = useState(0);
  const [sound, setSound] = useState(true);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const focusOnReady = useRef(false);
  const best = useSyncExternalStore(subscribe, readBest, () => 0);

  const snippet = typingSentences[idx % typingSentences.length];
  const upcoming = typingSentences[(idx + 1) % typingSentences.length];
  const correct = doneCorrect + countCorrect(typed, snippet);
  const elapsed = duration - timeLeft;
  const wpm = elapsed > 0.5 ? Math.round(correct / 5 / (elapsed / 60)) : 0;
  const accuracy = keystrokes ? Math.max(0, Math.round(((keystrokes - errors) / keystrokes) * 100)) : 100;
  const isNewBest = phase === "done" && wpm > 0 && wpm >= best;

  // countdown
  useEffect(() => {
    if (phase !== "running" || startedAt === null) return;
    const id = setInterval(() => {
      const left = Math.max(0, duration - (Date.now() - startedAt) / 1000);
      setTimeLeft(left);
      if (left <= 0) {
        setPhase("done");
        if (sound) playKey("finish");
        inputRef.current?.blur();
      }
    }, 100);
    return () => clearInterval(id);
  }, [phase, startedAt, duration, sound]);

  // "Try again" from the score screen: focus the input once it's rendered again
  useEffect(() => {
    if (phase === "ready" && focusOnReady.current) {
      focusOnReady.current = false;
      inputRef.current?.focus();
    }
  }, [phase]);

  // persist a new best once the run ends
  useEffect(() => {
    if (phase === "done" && wpm > readBest()) saveBest(wpm);
  }, [phase, wpm]);

  function reset(d: Duration = duration) {
    setPhase("ready");
    setStartedAt(null);
    setTimeLeft(d);
    setIdx(0);
    setTyped("");
    setDoneCorrect(0);
    setKeystrokes(0);
    setErrors(0);
  }

  function restart() {
    reset();
    focusOnReady.current = true;
    inputRef.current?.focus();
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (phase === "done") return;
    const value = e.target.value.slice(0, snippet.length);
    if (phase === "ready") {
      setPhase("running");
      setStartedAt(Date.now());
    }

    if (value.length < typed.length) {
      if (sound) playKey("back");
    } else {
      let newErrors = 0;
      for (let i = typed.length; i < value.length; i++) if (value[i] !== snippet[i]) newErrors++;
      setKeystrokes((k) => k + value.length - typed.length);
      setErrors((n) => n + newErrors);
      if (sound) playKey(newErrors ? "error" : value.endsWith(" ") ? "space" : "key");
    }

    if (value.length === snippet.length) {
      // snippet finished → bank its correct chars and roll to the next one
      setDoneCorrect((c) => c + countCorrect(value, snippet));
      setIdx((i) => i + 1);
      setTyped("");
      if (sound) playKey("line");
    } else {
      setTyped(value);
    }
  }

  return (
    <div className="tt">
      <div className="tt-bar">
        <div className="tt-stats">
          <div className={`tt-stat tt-timer ${phase === "running" && timeLeft <= 5 ? "urgent" : ""}`}>
            <strong>{Math.ceil(timeLeft)}</strong>
            <span>seconds</span>
          </div>
          <div className="tt-stat">
            <strong>{wpm}</strong>
            <span>wpm</span>
          </div>
          <div className="tt-stat">
            <strong>{accuracy}%</strong>
            <span>accuracy</span>
          </div>
        </div>
        <div className="tt-controls">
          <div className="seg" role="group" aria-label="Test length">
            {DURATIONS.map((d) => (
              <button
                key={d}
                className={d === duration ? "active" : ""}
                disabled={phase === "running"}
                onClick={() => {
                  setDuration(d);
                  reset(d);
                }}
              >
                {d}s
              </button>
            ))}
          </div>
          <button
            className="icon-btn"
            onClick={() => setSound((s) => !s)}
            aria-label={sound ? "Mute typing sounds" : "Unmute typing sounds"}
            title={sound ? "Mute sounds" : "Unmute sounds"}
          >
            {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button className="icon-btn" onClick={restart} aria-label="Restart" title="Restart (Esc)">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="typing-progress">
        <div style={{ width: `${(elapsed / duration) * 100}%` }} />
      </div>

      {phase === "done" ? (
        <div className="typing-score">
          <div className="score-main">
            <strong>{wpm}</strong>
            <span>wpm</span>
          </div>
          <p className="score-verdict">
            {isNewBest ? "🏆 New personal best! " : ""}
            {verdict(wpm)}
          </p>
          <div className="score-grid">
            <div>
              <strong>{accuracy}%</strong>
              <span>accuracy</span>
            </div>
            <div>
              <strong>{correct}</strong>
              <span>correct chars</span>
            </div>
            <div>
              <strong>{errors}</strong>
              <span>mistakes</span>
            </div>
            <div>
              <strong>{Math.max(best, wpm)}</strong>
              <span>best wpm</span>
            </div>
          </div>
          <button className="btn primary" onClick={restart} autoFocus>
            <RotateCcw size={14} /> Try again
          </button>
        </div>
      ) : (
        <div className={`typing-box ${focused ? "focused" : ""}`}>
          <div className="typing-text">
            {snippet.split("").map((ch, i) => {
              const t = typed[i];
              const cls = t === undefined ? (i === typed.length && focused ? "cur" : "") : t === ch ? "ok" : "bad";
              return (
                <span key={i} className={cls}>
                  {ch}
                </span>
              );
            })}
          </div>
          <div className="typing-next">
            <span>next</span> {upcoming}
          </div>
          {!focused && (
            <div className="typing-overlay">
              <span>
                {phase === "ready" ? (
                  <>
                    Click here and start typing <small>{duration}s on the clock</small>
                  </>
                ) : (
                  <>
                    Clock&apos;s still running <small>click to keep typing</small>
                  </>
                )}
              </span>
            </div>
          )}
          <input
            ref={inputRef}
            className="typing-input"
            value={typed}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onPaste={(e) => e.preventDefault()}
            onKeyDown={(e) => {
              if (e.key === "Escape") restart();
            }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Type the sentence"
          />
        </div>
      )}

      <div className="typing-foot">
        <span>
          <kbd>Esc</kbd> to restart
        </span>
        <span>
          your best: <strong>{best}</strong> wpm
        </span>
      </div>
    </div>
  );
}
