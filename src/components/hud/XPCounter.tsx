"use client";

import { useState, useEffect, useRef } from "react";

interface XPCounterProps {
  xp: number;
  gained?: number; // XP just earned — triggers animation
}

export default function XPCounter({ xp, gained = 0 }: XPCounterProps) {
  const [displayXp, setDisplayXp] = useState(xp - gained);
  const [animating, setAnimating] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (gained <= 0) return;

    const from = xp - gained;
    const to = xp;
    const duration = 800;

    setAnimating(true);
    startRef.current = null;

    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayXp(Math.round(from + (to - from) * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayXp(to);
        setTimeout(() => setAnimating(false), 200);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [xp, gained]);

  return (
    <div
      className="flex items-center gap-1.5 rounded-full px-3 py-1"
      style={{
        backgroundColor: animating
          ? "rgba(255, 184, 0, 0.15)"
          : "rgba(255,255,255,0.05)",
        border: `1px solid ${animating ? "rgba(255, 184, 0, 0.4)" : "var(--color-border)"}`,
        boxShadow: animating ? "0 0 16px rgba(255, 184, 0, 0.3)" : "none",
        transition:
          "background-color 300ms ease, border-color 300ms ease, box-shadow 300ms ease",
      }}
    >
      <span
        className="text-xs"
        style={{
          color: animating
            ? "var(--color-accent-gold)"
            : "var(--color-text-muted)",
        }}
      >
        ⚡
      </span>
      <span
        className={`text-sm font-mono font-bold tabular-nums ${animating ? "xp-pop" : ""}`}
        style={{
          color: animating
            ? "var(--color-accent-gold)"
            : "var(--color-text-secondary)",
          transition: "color 300ms ease",
        }}
      >
        {displayXp.toLocaleString()}
      </span>
      {gained > 0 && animating && (
        <span
          className="text-xs font-semibold"
          style={{ color: "var(--color-accent-gold)" }}
        >
          +{gained}
        </span>
      )}
    </div>
  );
}
