interface ProgressBarProps {
  value: number; // 0–100
  accentColor?: string;
  height?: number;
  showLabel?: boolean;
  className?: string;
  animated?: boolean;
}

export default function ProgressBar({
  value,
  accentColor = "var(--rag)",
  height = 4,
  showLabel = false,
  className = "",
  animated = false,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{
          height: `${height}px`,
          backgroundColor: "rgba(255,255,255,0.06)",
        }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${animated ? "animate-pulse" : ""}`}
          style={{
            width: `${clamped}%`,
            backgroundColor: accentColor,
            background:
              clamped > 0
                ? `linear-gradient(90deg, ${accentColor}cc, ${accentColor})`
                : "transparent",
          }}
        />
      </div>
      {showLabel && (
        <span
          className="text-xs font-medium tabular-nums min-w-[32px] text-right"
          style={{ color: "var(--text-muted)" }}
        >
          {clamped}%
        </span>
      )}
    </div>
  );
}
