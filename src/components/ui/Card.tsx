import { type HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accentColor?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

const paddingMap = {
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      accentColor,
      hover = true,
      padding = "md",
      children,
      className = "",
      style,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={`
          relative rounded-2xl transition-all duration-200
          ${hover ? "cursor-pointer" : ""}
          ${paddingMap[padding]}
          ${className}
        `}
        style={{
          backgroundColor: "var(--card)",
          border: `1px solid var(--border)`,
          ...(accentColor ? { borderLeft: `3px solid ${accentColor}` } : {}),
          ...style,
        }}
        onMouseEnter={
          hover
            ? (e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.backgroundColor = "var(--card-hover)";
                el.style.borderColor = "var(--border-hover)";
                el.style.transform = "translateY(-1px)";
                el.style.boxShadow = accentColor
                  ? `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${accentColor}22`
                  : "0 8px 32px rgba(0,0,0,0.4)";
              }
            : undefined
        }
        onMouseLeave={
          hover
            ? (e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.backgroundColor = "var(--card)";
                el.style.borderColor = "var(--border)";
                el.style.transform = "";
                el.style.boxShadow = "";
              }
            : undefined
        }
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

export default Card;
