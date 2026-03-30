import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
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
  it("(a) step=0 — full header with hook quote visible", () => {
    render(<LevelHeader {...baseProps} currentStep={0} />);
    expect(screen.getByText(baseProps.hookQuote!)).toBeInTheDocument();
    expect(screen.getByText(baseProps.subtitle!)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      baseProps.title,
    );
  });

  it("(b) step=1 — compact bar, no hook quote", () => {
    render(<LevelHeader {...baseProps} currentStep={1} />);
    // Hook quote should NOT be in the document (compact mode)
    expect(screen.queryByText(baseProps.hookQuote!)).toBeNull();
    // Title should still be visible in compact bar
    expect(screen.getByText(baseProps.title)).toBeInTheDocument();
  });

  it("(c) title visible on both step 0 and step 3", () => {
    const { rerender } = render(<LevelHeader {...baseProps} currentStep={0} />);
    expect(screen.getByText(baseProps.title)).toBeInTheDocument();

    rerender(<LevelHeader {...baseProps} currentStep={3} />);
    expect(screen.getByText(baseProps.title)).toBeInTheDocument();
  });

  it("(d) XP badge visible on step 0 (full header)", () => {
    render(<LevelHeader {...baseProps} currentStep={0} />);
    expect(screen.getByText(`+${baseProps.xpReward} XP`)).toBeInTheDocument();
  });

  it("(e) XP badge visible on step > 0 (compact bar)", () => {
    render(<LevelHeader {...baseProps} currentStep={2} />);
    expect(screen.getByText(`+${baseProps.xpReward} XP`)).toBeInTheDocument();
  });

  it("(f) renders without hookQuote — no blockquote", () => {
    render(<LevelHeader {...baseProps} hookQuote={null} currentStep={0} />);
    expect(screen.queryByRole("blockquote")).toBeNull();
  });
});
