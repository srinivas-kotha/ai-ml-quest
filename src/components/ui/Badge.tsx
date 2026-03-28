import { type HTMLAttributes } from "react";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "rag"
  | "slm"
  | "monitoring"
  | "finetuning"
  | "multimodal"
  | "capstone";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "xs" | "sm";
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: {
    backgroundColor: "rgba(255,255,255,0.06)",
    color: "var(--text-secondary)",
    border: "1px solid var(--border)",
  },
  success: {
    backgroundColor: "rgba(245, 197, 66, 0.12)",
    color: "#f5c542",
    border: "1px solid rgba(245, 197, 66, 0.25)",
  },
  warning: {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    color: "#f59e0b",
    border: "1px solid rgba(245, 158, 11, 0.25)",
  },
  error: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    color: "#ef4444",
    border: "1px solid rgba(239, 68, 68, 0.25)",
  },
  rag: {
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    color: "#3b82f6",
    border: "1px solid rgba(59, 130, 246, 0.25)",
  },
  slm: {
    backgroundColor: "rgba(139, 92, 246, 0.12)",
    color: "#8b5cf6",
    border: "1px solid rgba(139, 92, 246, 0.25)",
  },
  monitoring: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    color: "#10b981",
    border: "1px solid rgba(16, 185, 129, 0.25)",
  },
  finetuning: {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    color: "#f59e0b",
    border: "1px solid rgba(245, 158, 11, 0.25)",
  },
  multimodal: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    color: "#ef4444",
    border: "1px solid rgba(239, 68, 68, 0.25)",
  },
  capstone: {
    backgroundColor: "rgba(245, 197, 66, 0.15)",
    color: "#f5c542",
    border: "1px solid rgba(245, 197, 66, 0.3)",
  },
};

export default function Badge({
  variant = "default",
  size = "sm",
  children,
  className = "",
  style,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-lg font-medium
        ${size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"}
        ${className}
      `}
      style={{ ...variantStyles[variant], ...style }}
      {...props}
    >
      {children}
    </span>
  );
}
