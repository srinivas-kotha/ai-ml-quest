"use client";

import { useState, useRef, useEffect, useId, useCallback } from "react";
import { createPortal } from "react-dom";
import { GLOSSARY } from "@/data/glossary";

interface GlossaryTooltipProps {
  term: string;
  children: React.ReactNode;
}

const SEEN_KEY = "aiquest_glossary_seen";

function getSeenTerms(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function markTermSeen(term: string): void {
  if (typeof window === "undefined") return;
  try {
    const seen = getSeenTerms();
    if (!seen.includes(term)) {
      localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, term]));
    }
  } catch {
    // ignore localStorage errors
  }
}

interface TooltipPosition {
  top: number;
  left: number;
  transformOrigin: string;
}

export function GlossaryTooltip({ term, children }: GlossaryTooltipProps) {
  const [open, setOpen] = useState(false);
  const [isFirstUse, setIsFirstUse] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({
    top: 0,
    left: 0,
    transformOrigin: "bottom center",
  });
  // `mounted` guards createPortal against SSR (document.body not available on server).
  // Initialize to true in browser environments immediately so hover/click works
  // without waiting for a useEffect tick.
  const [mounted, setMounted] = useState(() => typeof document !== "undefined");

  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();

  const termData = GLOSSARY[term];

  // Ensure mounted is set to true on client (covers SSR hydration path)
  useEffect(() => {
    if (!mounted) setMounted(true);
  }, [mounted]);

  const computePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const tooltipWidth = 280;
    const tooltipEstHeight = 100;
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;
    const spaceAbove = rect.top;
    const spaceBelow = viewportH - rect.bottom;

    let top: number;
    let transformOrigin: string;

    if (spaceAbove >= tooltipEstHeight + 8 || spaceAbove >= spaceBelow) {
      // Prefer above
      top = rect.top + window.scrollY - tooltipEstHeight - 8;
      transformOrigin = "bottom center";
    } else {
      // Below
      top = rect.bottom + window.scrollY + 8;
      transformOrigin = "top center";
    }

    let left = rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2;
    // Clamp to viewport
    left = Math.max(8, Math.min(left, viewportW - tooltipWidth - 8));

    setPosition({ top, left, transformOrigin });
  }, []);

  const showTooltip = useCallback(() => {
    const seen = getSeenTerms();
    const firstTime = !seen.includes(term);
    setIsFirstUse(firstTime);
    if (firstTime) markTermSeen(term);
    computePosition();
    setOpen(true);
  }, [term, computePosition]);

  const hideTooltip = useCallback(() => {
    setOpen(false);
  }, []);

  // Touch detection: show on click, dismiss on outside click
  const isTouchDevice =
    typeof window !== "undefined" && "ontouchstart" in window;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isTouchDevice) {
        e.stopPropagation();
        if (open) {
          hideTooltip();
        } else {
          showTooltip();
        }
      }
    },
    [isTouchDevice, open, showTooltip, hideTooltip],
  );

  const handleMouseEnter = useCallback(() => {
    if (!isTouchDevice) showTooltip();
  }, [isTouchDevice, showTooltip]);

  const handleMouseLeave = useCallback(() => {
    if (!isTouchDevice) hideTooltip();
  }, [isTouchDevice, hideTooltip]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        hideTooltip();
        // Don't re-focus here: the trigger is already focused since this handler
        // fires on the trigger element itself. Calling focus() would re-trigger
        // handleFocus and immediately reopen the tooltip.
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (open) {
          hideTooltip();
        } else {
          showTooltip();
        }
      }
    },
    [open, showTooltip, hideTooltip],
  );

  const handleFocus = useCallback(() => {
    showTooltip();
  }, [showTooltip]);

  const handleBlur = useCallback(() => {
    hideTooltip();
  }, [hideTooltip]);

  // Dismiss on outside click (touch devices)
  useEffect(() => {
    if (!open || !isTouchDevice) return;
    const onOutsideClick = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        hideTooltip();
      }
    };
    document.addEventListener("click", onOutsideClick);
    return () => document.removeEventListener("click", onOutsideClick);
  }, [open, isTouchDevice, hideTooltip]);

  // Dismiss on Escape globally (no focus() call here to avoid re-opening via
  // handleFocus when the trigger is already focused)
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        hideTooltip();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, hideTooltip]);

  if (!termData) {
    // Term not in glossary — render children as-is
    return <>{children}</>;
  }

  const tooltipContent = (
    <div
      ref={tooltipRef}
      id={tooltipId}
      role="tooltip"
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        width: 280,
        zIndex: 9999,
        transformOrigin: position.transformOrigin,
        backgroundColor:
          "var(--color-bg-card, var(--color-bg-surface, #1e1b3a))",
        border: isFirstUse
          ? "1px solid var(--rag, #3b82f6)"
          : "1px solid var(--color-border, rgba(255,255,255,0.12))",
        borderRadius: 10,
        padding: "10px 12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        pointerEvents: "none",
        // Respect prefers-reduced-motion via CSS animation none fallback
        animation: "var(--motion-safe, glossary-tooltip-fade 120ms ease-out)",
      }}
    >
      {isFirstUse && (
        <span
          style={{
            display: "inline-block",
            fontSize: 10,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--rag, #3b82f6)",
            backgroundColor: "rgba(59,130,246,0.12)",
            borderRadius: 4,
            padding: "1px 6px",
            marginBottom: 6,
          }}
        >
          New
        </span>
      )}
      <p
        style={{
          margin: 0,
          fontSize: 13,
          lineHeight: 1.5,
          color: "var(--text-secondary, rgba(255,255,255,0.75))",
        }}
      >
        {termData.definition}
      </p>
      {termData.example && (
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 12,
            lineHeight: 1.4,
            color: "var(--text-muted, rgba(255,255,255,0.45))",
            fontStyle: "italic",
          }}
        >
          e.g. {termData.example}
        </p>
      )}
    </div>
  );

  return (
    <>
      <span
        ref={triggerRef}
        aria-describedby={open ? tooltipId : undefined}
        tabIndex={0}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{
          borderBottom: "1px dotted var(--text-muted, rgba(255,255,255,0.45))",
          cursor: "help",
          display: "inline",
        }}
        data-glossary-term={term}
      >
        {children}
      </span>
      {mounted && open && createPortal(tooltipContent, document.body)}
    </>
  );
}

export default GlossaryTooltip;
