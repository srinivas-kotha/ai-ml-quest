"use client";

import { useState, useEffect } from "react";

interface DiagramViewerProps {
  svgPath: string;
  title: string;
  altText: string;
  caption?: string;
  accentColor?: string;
}

export default function DiagramViewer({
  svgPath,
  title,
  altText,
  caption,
  accentColor,
}: DiagramViewerProps) {
  const [svgContent, setSvgContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!svgPath) {
      setLoading(false);
      setError(true);
      return;
    }

    fetch(svgPath)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load SVG: ${r.status}`);
        return r.text();
      })
      .then((text) => {
        setSvgContent(text);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [svgPath]);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: "var(--color-bg-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-3"
        style={{
          backgroundColor: "var(--color-bg-card)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <span
          className="text-xs font-bold uppercase"
          style={{
            color: accentColor || "var(--color-accent-gold)",
            letterSpacing: "1.5px",
          }}
        >
          ARCHITECTURE DIAGRAM
        </span>
        <h3
          className="font-display text-base mt-0.5"
          style={{ color: "var(--color-text-primary)" }}
        >
          {title}
        </h3>
      </div>

      {/* SVG content area */}
      <div className="p-4">
        {loading && (
          <div
            className="rounded-xl animate-pulse"
            style={{
              backgroundColor: "var(--color-bg-card)",
              height: "240px",
              border: "1px solid var(--color-border)",
            }}
          />
        )}

        {error && !loading && (
          <div
            className="rounded-xl p-6 text-center"
            style={{
              backgroundColor: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          >
            <p className="text-sm">Failed to load diagram.</p>
          </div>
        )}

        {!loading && !error && svgContent && (
          <div
            className="overflow-x-auto rounded-xl"
            style={{
              backgroundColor: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              role="img"
              aria-label={altText}
              className="diagram-svg-container min-w-[400px] p-3 transition-[opacity] duration-300"
              style={{ opacity: loading ? 0 : 1 }}
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>
        )}
      </div>

      {/* Footer: caption + full-size link */}
      {(caption || svgPath) && (
        <div
          className="px-5 py-3 flex items-center justify-between gap-4"
          style={{
            borderTop: "1px solid var(--color-border)",
          }}
        >
          {caption && (
            <p
              className="text-sm flex-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {caption}
            </p>
          )}
          {svgPath && (
            <a
              href={svgPath}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium shrink-0 transition-[opacity] duration-200 hover:opacity-80"
              style={{ color: accentColor || "var(--color-accent-gold)" }}
            >
              View full size
            </a>
          )}
        </div>
      )}
    </div>
  );
}
