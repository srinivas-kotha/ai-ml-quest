"use client";

import { useState, useCallback } from "react";
import type { PipelineBuilderConfig } from "@/types/content";

interface PipelineBuilderProps {
  config: PipelineBuilderConfig;
  accentColor: string;
  onComplete: (score: number, maxScore: number) => void;
}

interface SlotState {
  id: string;
  label: string;
  description: string;
}

export default function PipelineBuilder({
  config,
  accentColor,
  onComplete,
}: PipelineBuilderProps) {
  const { steps, correctOrder } = config;

  // Available pool: shuffled
  const [available, setAvailable] = useState<typeof steps>(() => {
    const arr = [...steps];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });

  const [slots, setSlots] = useState<(SlotState | null)[]>(() =>
    new Array(correctOrder.length).fill(null),
  );
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [dragSrc, setDragSrc] = useState<{
    from: "pool" | "slot";
    idx: number;
  } | null>(null);
  // Mobile: tap-to-select
  const [tappedPool, setTappedPool] = useState<number | null>(null);

  const placeInSlot = useCallback(
    (slotIdx: number) => {
      if (submitted) return;
      if (tappedPool !== null) {
        // Place from pool into slot
        const item = available[tappedPool];
        const evicted = slots[slotIdx];
        const newSlots = [...slots];
        newSlots[slotIdx] = item;
        const newAvail = available.filter((_, i) => i !== tappedPool);
        if (evicted) newAvail.push(evicted);
        setSlots(newSlots);
        setAvailable(newAvail);
        setTappedPool(null);
        return;
      }
      // Tap to clear slot
      if (slots[slotIdx]) {
        const evicted = slots[slotIdx]!;
        const newSlots = [...slots];
        newSlots[slotIdx] = null;
        setSlots(newSlots);
        setAvailable((a) => [...a, evicted]);
      }
    },
    [available, slots, submitted, tappedPool],
  );

  const tapPoolItem = useCallback(
    (poolIdx: number) => {
      if (submitted) return;
      if (tappedPool === poolIdx) {
        setTappedPool(null);
        return;
      }
      setTappedPool(poolIdx);
    },
    [tappedPool, submitted],
  );

  // Drag handlers
  const onDragStart = (from: "pool" | "slot", idx: number) => {
    setDragSrc({ from, idx });
  };

  const onDropSlot = (slotIdx: number) => {
    if (!dragSrc || submitted) return;
    let item: SlotState;
    if (dragSrc.from === "pool") {
      item = available[dragSrc.idx];
      const newAvail = available.filter((_, i) => i !== dragSrc.idx);
      const evicted = slots[slotIdx];
      const newSlots = [...slots];
      newSlots[slotIdx] = item;
      if (evicted) newAvail.push(evicted);
      setAvailable(newAvail);
      setSlots(newSlots);
    } else {
      // slot -> slot
      const srcSlot = slots[dragSrc.idx];
      if (!srcSlot) return;
      const dstSlot = slots[slotIdx];
      const newSlots = [...slots];
      newSlots[slotIdx] = srcSlot;
      newSlots[dragSrc.idx] = dstSlot;
      setSlots(newSlots);
    }
    setDragSrc(null);
  };

  const onDropPool = () => {
    if (!dragSrc || dragSrc.from !== "slot" || submitted) return;
    const item = slots[dragSrc.idx];
    if (!item) return;
    const newSlots = [...slots];
    newSlots[dragSrc.idx] = null;
    setSlots(newSlots);
    setAvailable((a) => [...a, item]);
    setDragSrc(null);
  };

  const checkPipeline = () => {
    if (slots.some((s) => s === null) || submitted) return;
    setSubmitted(true);
    const res = slots.map((s, i) => s?.id === correctOrder[i]);
    setResults(res);
    const correct = res.filter(Boolean).length;
    setTimeout(() => onComplete(correct, correctOrder.length), 600);
  };

  const allFilled = slots.every((s) => s !== null);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        Arrange the pipeline stages in the correct order. Drag & drop or tap to
        select then tap a slot.
      </p>

      {/* Available pool */}
      <div
        className="flex flex-wrap gap-2 p-3 rounded-xl min-h-[52px]"
        style={{
          backgroundColor: "var(--color-bg-surface)",
          border: "1px dashed var(--color-border)",
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDropPool}
      >
        {available.length === 0 && (
          <span
            className="text-xs italic"
            style={{ color: "var(--text-muted)" }}
          >
            All stages placed
          </span>
        )}
        {available.map((step, i) => (
          <div
            key={step.id}
            draggable={!submitted}
            onDragStart={() => onDragStart("pool", i)}
            onClick={() => tapPoolItem(i)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-grab active:cursor-grabbing select-none transition-[background-color,border-color,transform]"
            style={{
              backgroundColor:
                tappedPool === i ? `${accentColor}25` : `${accentColor}15`,
              border: `1px solid ${tappedPool === i ? accentColor : `${accentColor}40`}`,
              color: accentColor,
              transform: tappedPool === i ? "scale(1.04)" : "scale(1)",
            }}
          >
            {step.label}
          </div>
        ))}
      </div>

      {/* Pipeline slots */}
      <div className="flex flex-col gap-2">
        {slots.map((slot, i) => {
          const isCorrect = submitted && results[i] === true;
          const isWrong = submitted && results[i] === false;
          return (
            <div key={i} className="flex items-center gap-2">
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: `${accentColor}15`,
                  color: accentColor,
                }}
              >
                {i + 1}
              </span>
              <div
                draggable={!!slot && !submitted}
                onDragStart={() => slot && onDragStart("slot", i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDropSlot(i)}
                onClick={() => placeInSlot(i)}
                className="flex-1 rounded-xl px-3 py-2.5 text-sm transition-[background-color,border-color,color] cursor-pointer"
                style={{
                  backgroundColor: slot
                    ? isCorrect
                      ? "rgba(245,197,66,0.12)"
                      : isWrong
                        ? "rgba(239,68,68,0.12)"
                        : `${accentColor}10`
                    : "var(--color-bg-surface)",
                  border: slot
                    ? `1px solid ${isCorrect ? "var(--success)" : isWrong ? "var(--error)" : accentColor}60`
                    : "1px dashed var(--color-text-muted)",
                  color: slot
                    ? isCorrect
                      ? "var(--success)"
                      : isWrong
                        ? "var(--error)"
                        : "var(--text-primary)"
                    : "var(--text-muted)",
                }}
              >
                {slot ? (
                  <span className="flex items-center gap-2">
                    {slot.label}
                    {submitted && (
                      <span className="ml-auto text-xs">
                        {isCorrect ? "✓" : "✗"}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="italic text-xs">
                    Step {i + 1} — drop here
                  </span>
                )}
              </div>
              {submitted && isWrong && (
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  → {steps.find((s) => s.id === correctOrder[i])?.label}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit */}
      {!submitted && (
        <button
          type="button"
          disabled={!allFilled}
          onClick={checkPipeline}
          className="rounded-xl py-2.5 text-sm font-semibold transition-[background-color,color]"
          style={{
            backgroundColor: allFilled
              ? accentColor
              : "var(--color-bg-surface)",
            color: allFilled ? "#0c0c14" : "var(--text-muted)",
            cursor: allFilled ? "pointer" : "not-allowed",
          }}
        >
          Check Pipeline
        </button>
      )}
    </div>
  );
}
