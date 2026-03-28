"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { SpeedQuizConfig } from "@/types/content";

interface SpeedQuizProps {
  config: SpeedQuizConfig;
  accentColor: string;
  onComplete: (score: number, maxScore: number) => void;
}

const OPTION_KEYS = ["A", "B", "C", "D"];

export default function SpeedQuiz({
  config,
  accentColor,
  onComplete,
}: SpeedQuizProps) {
  const { questions, timePerQuestion = 30 } = config;
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(timePerQuestion);
  const [showExplanation, setShowExplanation] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQ = questions[qIdx];
  const isLast = qIdx >= questions.length - 1;

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleAnswer = useCallback(
    (idx: number) => {
      if (answered) return;
      stopTimer();
      setAnswered(true);
      setSelectedIdx(idx);
      const correct = idx === currentQ.correct;
      if (correct) setScore((s) => s + 1);
      setShowExplanation(true);

      setTimeout(() => {
        setShowExplanation(false);
        setAnswered(false);
        setSelectedIdx(null);
        if (isLast) {
          const finalScore = correct ? score + 1 : score;
          onComplete(finalScore, questions.length);
        } else {
          setQIdx((i) => i + 1);
          setTimeLeft(timePerQuestion);
        }
      }, 1800);
    },
    [
      answered,
      currentQ,
      isLast,
      onComplete,
      questions.length,
      score,
      stopTimer,
      timePerQuestion,
    ],
  );

  // Timer
  useEffect(() => {
    setTimeLeft(timePerQuestion);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          stopTimer();
          handleAnswer(-1);
          return 0;
        }
        return t - 0.1;
      });
    }, 100);
    return stopTimer;
  }, [qIdx, timePerQuestion, stopTimer, handleAnswer]);

  const timerPct = (timeLeft / timePerQuestion) * 100;
  const timerColor =
    timerPct > 50 ? accentColor : timerPct > 20 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col gap-4">
      {/* Progress + timer row */}
      <div
        className="flex items-center justify-between text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        <span>
          Question {qIdx + 1} of {questions.length}
        </span>
        <span
          className="font-mono font-medium"
          style={{ color: timerColor, transition: "color 0.3s" }}
        >
          {Math.ceil(timeLeft)}s
        </span>
      </div>

      {/* Timer bar */}
      <div
        className="h-1 rounded-full overflow-hidden"
        style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${timerPct}%`,
            backgroundColor: timerColor,
            transition: "width 0.1s linear, background-color 0.3s",
          }}
        />
      </div>

      {/* Question */}
      <div
        className="rounded-xl p-4 text-sm leading-relaxed font-medium"
        style={{
          backgroundColor: `${accentColor}10`,
          border: `1px solid ${accentColor}25`,
          color: "var(--text-primary)",
        }}
      >
        {currentQ.question}
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {currentQ.options.map((opt, i) => {
          let bg = "rgba(255,255,255,0.03)";
          let border = "rgba(255,255,255,0.08)";
          let textColor = "var(--text-secondary)";

          if (answered) {
            if (i === currentQ.correct) {
              bg = "rgba(245,197,66,0.12)";
              border = "var(--success)";
              textColor = "var(--success)";
            } else if (i === selectedIdx && i !== currentQ.correct) {
              bg = "rgba(239,68,68,0.12)";
              border = "var(--error)";
              textColor = "var(--error)";
            }
          } else if (!answered) {
            bg = "rgba(255,255,255,0.03)";
          }

          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => handleAnswer(i)}
              className="flex items-center gap-3 rounded-xl p-3 text-sm text-left transition-all"
              style={{
                backgroundColor: bg,
                border: `1px solid ${border}`,
                color: textColor,
                cursor: answered ? "default" : "pointer",
              }}
            >
              <span
                className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: answered
                    ? i === currentQ.correct
                      ? "rgba(245,197,66,0.2)"
                      : i === selectedIdx
                        ? "rgba(239,68,68,0.2)"
                        : "rgba(255,255,255,0.06)"
                    : `${accentColor}20`,
                  color: answered
                    ? i === currentQ.correct
                      ? "var(--success)"
                      : i === selectedIdx
                        ? "var(--error)"
                        : "var(--text-muted)"
                    : accentColor,
                }}
              >
                {OPTION_KEYS[i]}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showExplanation && currentQ.explanation && (
        <div
          className="rounded-xl p-3 text-xs leading-relaxed"
          style={{
            backgroundColor:
              selectedIdx === currentQ.correct
                ? "rgba(245,197,66,0.08)"
                : "rgba(239,68,68,0.08)",
            border: `1px solid ${selectedIdx === currentQ.correct ? "rgba(245,197,66,0.25)" : "rgba(239,68,68,0.25)"}`,
            color: "var(--text-secondary)",
          }}
        >
          <span
            className="font-semibold"
            style={{
              color:
                selectedIdx === currentQ.correct
                  ? "var(--success)"
                  : "var(--error)",
            }}
          >
            {selectedIdx === currentQ.correct
              ? "✓ Correct — "
              : selectedIdx === -1
                ? "⏰ Time's up — "
                : "✗ Incorrect — "}
          </span>
          {currentQ.explanation}
        </div>
      )}
    </div>
  );
}
