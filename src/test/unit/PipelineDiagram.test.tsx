import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import PipelineDiagram from "@/components/learn/PipelineDiagram";

const mockProps = {
  nodes: [
    { id: "1", label: "Step 1", icon: "sparkles", description: "First step" },
    { id: "2", label: "Step 2", icon: "sparkles", description: "Second step" },
  ],
  edges: [["1", "2"]] as Array<[string, string]>,
  animate: false,
  stepThrough: true,
  accentColor: "#ffb800",
};

// Aria-label helpers that match the component's labels
const LABELS = {
  reset: /reset/i,
  start: /start pipeline/i,
  prev: /previous step/i,
  next: /next step in pipeline/i,
  done: /done.*mark pipeline/i,
};

describe("PipelineDiagram", () => {
  it("renders step-through controls when stepThrough=true", () => {
    render(<PipelineDiagram {...mockProps} />);
    expect(
      screen.getByRole("button", { name: LABELS.reset }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: LABELS.start }),
    ).toBeInTheDocument();
  });

  it("Start button uses primary variant (has gradient background)", () => {
    render(<PipelineDiagram {...mockProps} />);
    const startBtn = screen.getByRole("button", { name: LABELS.start });
    // Primary variant renders with inline style containing linear-gradient
    const style = startBtn.getAttribute("style") ?? "";
    expect(style).toMatch(/linear-gradient/);
  });

  it("Prev button is disabled at step -1 and has aria-disabled", () => {
    render(<PipelineDiagram {...mockProps} />);
    const prevBtn = screen.getByRole("button", { name: LABELS.prev });
    expect(prevBtn).toBeDisabled();
    expect(prevBtn).toHaveAttribute("aria-disabled", "true");
  });

  it("Reset button has aria-disabled=false when enabled", () => {
    render(<PipelineDiagram {...mockProps} />);
    const resetBtn = screen.getByRole("button", { name: LABELS.reset });
    expect(resetBtn).not.toBeDisabled();
    expect(resetBtn).toHaveAttribute("aria-disabled", "false");
  });

  it("clicking Start advances to step 1 and shows Next button", async () => {
    const user = userEvent.setup();
    render(<PipelineDiagram {...mockProps} />);

    await user.click(screen.getByRole("button", { name: LABELS.start }));

    // After first click we are at step 0 (1 of 2 shown in header)
    expect(screen.getByText(/step 1 of 2/i)).toBeInTheDocument();
    // Start button should no longer be present
    expect(
      screen.queryByRole("button", { name: LABELS.start }),
    ).not.toBeInTheDocument();
  });

  it("Done button appears on last step", async () => {
    const user = userEvent.setup();
    render(<PipelineDiagram {...mockProps} />);

    // Step through to the last node (2 nodes total)
    await user.click(screen.getByRole("button", { name: LABELS.start }));
    await user.click(screen.getByRole("button", { name: LABELS.next }));

    expect(
      screen.getByRole("button", { name: LABELS.done }),
    ).toBeInTheDocument();
  });

  it("clicking Done shows completion panel with 'Pipeline complete!'", async () => {
    const user = userEvent.setup();
    render(<PipelineDiagram {...mockProps} />);

    await user.click(screen.getByRole("button", { name: LABELS.start }));
    await user.click(screen.getByRole("button", { name: LABELS.next }));
    await user.click(screen.getByRole("button", { name: LABELS.done }));

    // The completion panel <p> and header <span> both show this text — verify at least one exists
    expect(
      screen.getAllByText(/pipeline complete!/i).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("Reset from completion panel returns to step -1 (Start button visible)", async () => {
    const user = userEvent.setup();
    render(<PipelineDiagram {...mockProps} />);

    // Walk through to completion
    await user.click(screen.getByRole("button", { name: LABELS.start }));
    await user.click(screen.getByRole("button", { name: LABELS.next }));
    await user.click(screen.getByRole("button", { name: LABELS.done }));

    // Reset from completion panel
    await user.click(screen.getByRole("button", { name: LABELS.reset }));

    // Should show Start button again (back to initial state)
    expect(
      screen.getByRole("button", { name: LABELS.start }),
    ).toBeInTheDocument();
    // Completion panel gone
    expect(screen.queryByText(/pipeline complete!/i)).not.toBeInTheDocument();
  });

  it("Reset from controls mid-walk returns to step -1", async () => {
    const user = userEvent.setup();
    render(<PipelineDiagram {...mockProps} />);

    await user.click(screen.getByRole("button", { name: LABELS.start }));
    // Now at step 0 — reset
    await user.click(screen.getByRole("button", { name: LABELS.reset }));

    expect(
      screen.getByRole("button", { name: LABELS.start }),
    ).toBeInTheDocument();
  });

  it("step sequence: Start → step 1 of 2, Next → step 2 of 2", async () => {
    const user = userEvent.setup();
    render(<PipelineDiagram {...mockProps} />);

    await user.click(screen.getByRole("button", { name: LABELS.start }));
    expect(screen.getByText(/step 1 of 2/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: LABELS.next }));
    expect(screen.getByText(/step 2 of 2/i)).toBeInTheDocument();
  });
});
