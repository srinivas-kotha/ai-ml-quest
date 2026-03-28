"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface LevelCompleteProps {
  score: number;
  maxScore: number;
  xpEarned: number;
  keyInsight?: string | null;
  accentColor: string;
  nextLevelUrl?: string | null;
  backUrl: string;
  onClose?: () => void;
}

// ── Canvas particle burst ─────────────────────────────────────────────────────

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

function ParticleBurst({
  accentColor,
  trigger,
}: {
  accentColor: string;
  trigger: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H * 0.4;

    const colors = [accentColor, "#f5c542", "#ffffff", accentColor + "cc"];

    // Spawn 70 particles
    particlesRef.current = Array.from({ length: 70 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.012 + Math.random() * 0.02,
      };
    });

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0);

      for (const p of particlesRef.current) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.alpha -= p.decay;
        p.size *= 0.98;
      }

      if (particlesRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(render);
      }
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [trigger, accentColor]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={300}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}

// ── XP roll-up ─────────────────────────────────────────────────────────────

function RollingXP({
  target,
  accentColor,
}: {
  target: number;
  accentColor: string;
}) {
  const [displayed, setDisplayed] = useState(0);
  const [goldFlash, setGoldFlash] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const duration = 800;
    startRef.current = null;
    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const progress = Math.min((now - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(target * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Roll-up complete — trigger gold flash
        setGoldFlash(true);
        setTimeout(() => setGoldFlash(false), 400);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target]);

  return (
    <span
      className="xp-pop text-4xl font-bold tabular-nums"
      style={{
        color: "var(--color-accent-gold)",
        transition: "box-shadow 200ms ease",
        borderRadius: "8px",
        padding: "2px 8px",
        boxShadow: goldFlash
          ? "0 0 24px rgba(255, 184, 0, 0.6)"
          : "0 0 0 transparent",
        display: "inline-block",
      }}
    >
      +{displayed}
    </span>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────

export default function LevelComplete({
  score,
  maxScore,
  xpEarned,
  keyInsight,
  accentColor,
  nextLevelUrl,
  backUrl,
  onClose,
}: LevelCompleteProps) {
  const [visible, setVisible] = useState(false);
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 100;
  const passed = pct >= 60;

  useEffect(() => {
    // Small delay to allow mount animation
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(12,12,20,0.85)",
        backdropFilter: "blur(8px)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s",
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl p-8 flex flex-col items-center text-center gap-5 overflow-hidden"
        style={{
          backgroundColor: "var(--color-bg-card)",
          border: `1px solid ${accentColor}40`,
          boxShadow: `0 0 60px ${accentColor}20`,
          transform: visible
            ? "scale(1) translateY(0)"
            : "scale(0.8) translateY(16px)",
          transition: "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Particle burst */}
        <ParticleBurst accentColor={accentColor} trigger={visible} />

        {/* Medal */}
        <div className="text-5xl" aria-hidden="true">
          {passed ? "🏆" : "📚"}
        </div>

        {/* Title */}
        <div>
          <h2
            className="text-xl font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            {passed ? "Level Complete!" : "Keep Practicing!"}
          </h2>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            {score}/{maxScore} correct · {pct}%
          </p>
        </div>

        {/* Score bar */}
        <div className="w-full">
          <div
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${pct}%`,
                backgroundColor: accentColor,
                transition: "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />
          </div>
        </div>

        {/* XP earned */}
        <div className="flex flex-col items-center gap-1">
          <p
            className="text-xs font-medium"
            style={{ color: "var(--color-text-muted)" }}
          >
            XP Earned
          </p>
          {visible && <RollingXP target={xpEarned} accentColor={accentColor} />}
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            experience points
          </p>
        </div>

        {/* Key insight */}
        {keyInsight && (
          <div
            className="w-full rounded-xl p-3 text-xs leading-relaxed text-left"
            style={{
              backgroundColor: "rgba(255, 184, 0, 0.08)",
              border: "1px solid rgba(255, 184, 0, 0.20)",
              color: "var(--color-text-secondary)",
            }}
          >
            <span
              className="font-semibold"
              style={{ color: "var(--color-accent-gold)" }}
            >
              💡 Key Insight:{" "}
            </span>
            {keyInsight}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="w-full flex flex-col gap-2">
          {nextLevelUrl && passed && (
            <Link
              href={nextLevelUrl}
              className="w-full rounded-xl py-3 text-sm font-semibold text-center block"
              style={{
                backgroundColor: accentColor,
                color: "#0c0c14",
                transition: "filter 150ms ease",
              }}
            >
              Next Level →
            </Link>
          )}
          <Link
            href={backUrl}
            className="w-full rounded-xl py-3 text-sm font-medium text-center block"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              color: "var(--color-text-secondary)",
              border: "1px solid var(--color-border)",
              transition:
                "background-color 150ms ease, border-color 150ms ease",
            }}
          >
            {nextLevelUrl && passed ? "Back to Chapter" : "Try Again"}
          </Link>
        </div>
      </div>
    </div>
  );
}
