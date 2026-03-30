"use client";

import { useState, useEffect, useRef, useCallback } from "react";

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
  const [expanded, setExpanded] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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

  const openDialog = useCallback(() => {
    setExpanded(true);
    dialogRef.current?.showModal();
    // Move focus to close button when dialog opens
    requestAnimationFrame(() => closeButtonRef.current?.focus());
  }, []);

  const closeDialog = useCallback(() => {
    setExpanded(false);
    dialogRef.current?.close();
  }, []);

  // Close on Escape (dialog element handles this natively, but we sync state)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => setExpanded(false);
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  // Close on backdrop click
  const handleDialogClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) closeDialog();
    },
    [closeDialog],
  );

  // Focus trap: keep Tab/Shift+Tab inside dialog
  const handleDialogKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDialogElement>) => {
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    },
    [],
  );

  return (
    <>
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

        {/* SVG content area — clickable to expand */}
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
            <button
              type="button"
              onClick={openDialog}
              aria-label={`Expand ${title} diagram`}
              className="w-full text-left overflow-x-auto rounded-xl transition-[box-shadow,outline-color] duration-200 hover:outline hover:outline-2 hover:outline-offset-2"
              style={{
                backgroundColor: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                outlineColor: accentColor || "var(--color-accent-gold)",
                cursor: "zoom-in",
              }}
            >
              <div
                role="img"
                aria-label={altText}
                className="diagram-svg-container min-w-[400px] p-3 transition-[opacity] duration-300"
                style={{ opacity: loading ? 0 : 1 }}
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </button>
          )}
        </div>

        {/* Footer: caption + expand trigger */}
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
            {svgPath && !loading && !error && (
              <button
                type="button"
                onClick={openDialog}
                className="text-xs font-medium shrink-0 transition-[opacity] duration-200 hover:opacity-80"
                style={{
                  color: accentColor || "var(--color-accent-gold)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Click to expand ↗
              </button>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen expand dialog */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        ref={dialogRef}
        role="dialog"
        aria-label={`${title} — expanded view`}
        aria-modal="true"
        onClick={handleDialogClick}
        onKeyDown={handleDialogKeyDown}
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          maxWidth: "100vw",
          maxHeight: "100vh",
          margin: 0,
          padding: 0,
          border: "none",
          backgroundColor: "transparent",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px 16px",
          }}
        >
          {/* Dialog header */}
          <div
            style={{
              width: "min(90vw, 1200px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                color: accentColor || "var(--color-accent-gold)",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {title}
            </span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeDialog}
              aria-label="Close expanded diagram"
              style={{
                background: "none",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: "rgba(255,255,255,0.8)",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                padding: "4px 10px",
                transition: "border-color 200ms, color 200ms",
              }}
            >
              Close ✕
            </button>
          </div>

          {/* SVG scroll area */}
          <div
            style={{
              width: "90vw",
              height: "85vh",
              overflow: "auto",
              backgroundColor: "var(--color-bg-card)",
              borderRadius: "12px",
              border: "1px solid var(--color-border)",
              padding: "16px",
            }}
          >
            <div
              role="img"
              aria-label={altText}
              className="diagram-svg-container"
              style={{
                minWidth: "400px",
                opacity: expanded ? 1 : 0,
                transition: "opacity 200ms",
              }}
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>
        </div>

        <style>{`
          @media (prefers-reduced-motion: reduce) {
            dialog .diagram-svg-container {
              transition: none !important;
            }
          }
          dialog::backdrop {
            background: rgba(0,0,0,0.85);
          }
        `}</style>
      </dialog>
    </>
  );
}
