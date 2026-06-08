"use client";

import { useEffect, useRef, useState } from "react";

const RATES = [0.75, 1, 1.25, 1.5] as const;

export function TtsReader({ text }: { text: string }) {
  const [supported, setSupported] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState<number>(1);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function play() {
    if (!supported || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };
    u.onerror = () => {
      setSpeaking(false);
      setPaused(false);
    };
    utterRef.current = u;
    window.speechSynthesis.speak(u);
    setSpeaking(true);
    setPaused(false);
  }

  function pauseResume() {
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }

  function stop() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  }

  if (!supported) {
    return (
      <div className="rounded-full border border-ink-200 bg-white/70 px-4 py-2 text-[12px] text-ink-500 backdrop-blur-xl">
        Text-to-speech is not supported in this browser.
      </div>
    );
  }

  const active = speaking;

  return (
    <div className="flex items-center gap-3 rounded-full border border-ink-200 bg-white/70 px-3 py-2 soft-shadow backdrop-blur-xl">
      <button
        type="button"
        onClick={active ? pauseResume : play}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-700 text-white transition-all hover:-translate-y-0.5 hover:bg-primary-900 hover:pop-shadow"
        title={active ? (paused ? "Resume" : "Pause") : "Read aloud"}
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: "24px",
            fontVariationSettings: "'FILL' 1",
          }}
        >
          {active && !paused ? "pause" : "play_arrow"}
        </span>
      </button>

      <div className="flex items-end gap-[3px] px-1" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className={`block w-[3px] rounded-full ${
              active && !paused ? "bg-primary-500" : "bg-ink-200"
            }`}
            style={{
              height: `${6 + ((i * 7) % 18)}px`,
              animation:
                active && !paused
                  ? `wave 1.1s ease-in-out ${i * 0.08}s infinite`
                  : "none",
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-1 rounded-full bg-ink-100 p-1">
        {RATES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRate(r)}
            className={`px-2.5 py-1 text-[11px] uppercase transition-all ${
              rate === r
                ? "rounded-full bg-white font-semibold text-primary-700 soft-shadow"
                : "text-ink-500 hover:text-ink-900"
            }`}
            style={{
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.08em",
            }}
          >
            {r}x
          </button>
        ))}
      </div>

      {active && (
        <button
          type="button"
          onClick={stop}
          className="text-[12px] font-medium text-ink-500 transition-colors hover:text-coral-700"
        >
          Stop
        </button>
      )}

      <style>{`@keyframes wave {
        0%, 100% { transform: scaleY(0.4); }
        50% { transform: scaleY(1.4); }
      }`}</style>
    </div>
  );
}
