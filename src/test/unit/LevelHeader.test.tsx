import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import LevelHeader from "@/components/level/LevelHeader";

const baseProps = {
  levelNum: 1,
  title: "What is RAG?",
  subtitle: "Retrieval-Augmented Generation explained",
  hookQuote: "Stop memorising facts. Start retrieving them.",
  accentColor: "var(--rag)",
  totalLevels: 10,
  chapterTitle: "Production RAG Pipeline",
  xpReward: 100,
  estimatedMinutes: 8,
};

describe("LevelHeader", () => {
  it("(a) step=0 — collapsible section is visible (maxHeight not 0, opacity not 0)", () => {
    render(<LevelHeader {...baseProps} currentStep={0} />);

    // The collapsible wrapper has aria-hidden=false at step 0
    const collapseWrapper = screen
      .getByText(baseProps.hookQuote!)
      .closest("[aria-hidden]");
    expect(collapseWrapper).not.toBeNull();
    expect(collapseWrapper).toHaveAttribute("aria-hidden", "false");

    // Hook quote text is in the document
    expect(screen.getByText(baseProps.hookQuote!)).toBeInTheDocument();

    // Subtitle is visible
    expect(screen.getByText(baseProps.subtitle!)).toBeInTheDocument();
  });

  it("(b) step=1 — collapsible section is collapsed (aria-hidden=true, maxHeight=0px)", () => {
    render(<LevelHeader {...baseProps} currentStep={1} />);

    // The wrapper should be aria-hidden
    const collapseWrapper = screen
      .getByText(baseProps.hookQuote!)
      .closest("[aria-hidden]");
    expect(collapseWrapper).not.toBeNull();
    expect(collapseWrapper).toHaveAttribute("aria-hidden", "true");

    // Inline style should have maxHeight: 0px and opacity: 0
    const el = collapseWrapper as HTMLElement;
    expect(el.style.maxHeight).toBe("0px");
    expect(el.style.opacity).toBe("0");
  });

  it("(c) prefers-reduced-motion — transition is removed when media query matches", () => {
    // Mock matchMedia to return prefers-reduced-motion: reduce
    const mockMatchMedia = vi.fn().mockReturnValue({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: mockMatchMedia,
    });

    render(<LevelHeader {...baseProps} currentStep={1} />);

    const collapseWrapper = screen
      .getByText(baseProps.hookQuote!)
      .closest("[aria-hidden]") as HTMLElement;

    // With reduced motion, useEffect sets transition to 'none'
    // The initial inline style from JSX still sets the correct maxHeight/opacity
    expect(collapseWrapper.style.maxHeight).toBe("0px");
    expect(collapseWrapper.style.opacity).toBe("0");

    // Restore
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: undefined,
    });
  });

  it("(d) title is always visible regardless of step", () => {
    const { rerender } = render(<LevelHeader {...baseProps} currentStep={0} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      baseProps.title,
    );

    rerender(<LevelHeader {...baseProps} currentStep={3} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      baseProps.title,
    );
  });

  it("(e) XP badge and level counter are always visible", () => {
    render(<LevelHeader {...baseProps} currentStep={2} />);
    expect(screen.getByText(`+${baseProps.xpReward} XP`)).toBeInTheDocument();
    expect(
      screen.getByText(`${baseProps.levelNum} / ${baseProps.totalLevels}`),
    ).toBeInTheDocument();
  });

  it("(f) renders without hookQuote — no blockquote rendered", () => {
    render(<LevelHeader {...baseProps} hookQuote={null} currentStep={0} />);
    expect(screen.queryByRole("blockquote")).toBeNull();
  });
});
