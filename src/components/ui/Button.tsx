import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "danger";
type Size = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background:
      "linear-gradient(135deg, var(--accent-teal) 0%, var(--accent-indigo) 100%)",
    color: "#ffffff",
    border: "none",
    boxShadow: "0 0 24px rgba(20, 184, 166, 0.20)",
  },
  secondary: {
    backgroundColor: "transparent",
    color: "var(--text-secondary)",
    border: "1px solid var(--border)",
  },
  danger: {
    backgroundColor: "rgba(239, 68, 68, 0.10)",
    color: "#ef4444",
    border: "1px solid rgba(239, 68, 68, 0.25)",
  },
};

const sizeStyles: Record<Size, string> = {
  xs: "px-2 py-1 text-xs rounded-md",
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      className = "",
      style,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        className={`
          inline-flex items-center justify-center gap-2 font-medium
          motion-safe:transition-[background-color,border-color,color,box-shadow,opacity,transform] motion-safe:duration-150 cursor-pointer select-none
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeStyles[size]}
          ${className}
        `}
        style={{
          ...variantStyles[variant],
          ...(isDisabled ? { opacity: 0.5 } : {}),
          ...style,
        }}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
