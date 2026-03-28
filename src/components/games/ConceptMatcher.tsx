"use client";

import { useState } from "react";
import type { ConceptMatcherConfig } from "@/types/content";

interface ConceptMatcherProps {
  config: ConceptMatcherConfig;
  accentColor: string;
  onComplete: (score: number, maxScore: number) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ConceptMatcher({
  config,
  accentColor,
  onComplete,
}: ConceptMatcherProps) {
  const { pairs } = config;

  const [leftItems] = useState(() =>
    shuffleArray(pairs.map((p, i) => ({ text: p.left, idx: i }))),
  );
  const [rightItems] = useState(() =>
    shuffleArray(pairs.map((p, i) => ({ text: p.right, idx: i }))),
  );

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrongRight, setWrongRight] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);

  const handleLeftClick = (idx: number) => {
    if (matched.has(idx)) return;
    setSelectedLeft(idx === selectedLeft ? null : idx);
  };

  const handleRightClick = (rightItemIdx: number, pairIdx: number) => {
    if (matched.has(pairIdx) || selectedLeft === null) return;
    setAttempts((a) => a + 1);

    if (pairIdx === selectedLeft) {
      // Correct match
      const newMatched = new Set(matched);
      newMatched.add(pairIdx);
      setMatched(newMatched);
      setSelectedLeft(null);

      if (newMatched.size === pairs.length) {
        setTimeout(() => onComplete(pairs.length, pairs.length), 400);
      }
    } else {
      // Wrong match
      setWrongRight(rightItemIdx);
      setTimeout(() => {
        setWrongRight(null);
        setSelectedLeft(null);
      }, 500);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex items-center justify-between text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        <span>Match each concept to its definition</span>
        <span>
          {matched.size}/{pairs.length} matched
          {attempts > 0 && ` · ${attempts} attempt${attempts !== 1 ? "s" : ""}`}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Left column — terms */}
        <div className="flex flex-col gap-2">
          <p
            className="text-xs font-semibold mb-1"
            style={{ color: "var(--text-muted)" }}
          >
            Concept
          </p>
          {leftItems.map((item) => {
            const isMatched = matched.has(item.idx);
            const isSelected = selectedLeft === item.idx;
            return (
              <button
                key={item.idx}
                type="button"
                disabled={isMatched}
                onClick={() => handleLeftClick(item.idx)}
                className="text-sm text-left rounded-xl px-3 py-2.5 transition-[background-color,border-color,color,transform] leading-snug"
                style={{
                  backgroundColor: isMatched
                    ? "rgba(245,197,66,0.10)"
                    : isSelected
                      ? `${accentColor}20`
                      : "var(--color-bg-surface)",
                  border: `1px solid ${
                    isMatched
                      ? "rgba(245,197,66,0.40)"
                      : isSelected
                        ? accentColor
                        : "var(--color-border)"
                  }`,
                  color: isMatched
                    ? "var(--success)"
                    : isSelected
                      ? accentColor
                      : "var(--text-secondary)",
                  cursor: isMatched ? "default" : "pointer",
                  transform: isSelected ? "scale(1.02)" : "scale(1)",
                }}
              >
                {item.text}
                {isMatched && (
                  <span className="ml-1.5 text-xs opacity-70">✓</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right column — definitions */}
        <div className="flex flex-col gap-2">
          <p
            className="text-xs font-semibold mb-1"
            style={{ color: "var(--text-muted)" }}
          >
            Definition
          </p>
          {rightItems.map((item, i) => {
            const isMatched = matched.has(item.idx);
            const isWrong = wrongRight === i;
            return (
              <button
                key={item.idx}
                type="button"
                disabled={isMatched || selectedLeft === null}
                onClick={() => handleRightClick(i, item.idx)}
                className="text-sm text-left rounded-xl px-3 py-2.5 transition-[background-color,border-color,color,transform] leading-snug"
                style={{
                  backgroundColor: isMatched
                    ? "rgba(245,197,66,0.10)"
                    : isWrong
                      ? "rgba(239,68,68,0.12)"
                      : "var(--color-bg-surface)",
                  border: `1px solid ${
                    isMatched
                      ? "rgba(245,197,66,0.40)"
                      : isWrong
                        ? "var(--error)"
                        : selectedLeft !== null
                          ? "var(--color-text-muted)"
                          : "var(--color-border)"
                  }`,
                  color: isMatched
                    ? "var(--success)"
                    : isWrong
                      ? "var(--error)"
                      : "var(--text-secondary)",
                  cursor:
                    isMatched || selectedLeft === null ? "default" : "pointer",
                }}
              >
                {item.text}
                {isMatched && (
                  <span className="ml-1.5 text-xs opacity-70">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedLeft !== null && (
        <p
          className="text-xs text-center animate-pulse"
          style={{ color: accentColor }}
        >
          Now click the matching definition →
        </p>
      )}
    </div>
  );
}
