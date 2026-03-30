import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import PredictionPrompt from "@/components/learn/PredictionPrompt";

const defaultProps = {
  question: "Test question",
  options: ["A", "B", "C", "D"],
  reveal: "Test answer",
  accentColor: "#ffb800",
};

describe("PredictionPrompt", () => {
  it("renders the Reveal Answer button", () => {
    render(<PredictionPrompt {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /reveal answer/i }),
    ).toBeInTheDocument();
  });

  it("Reveal Answer button is disabled before an option is selected", () => {
    render(<PredictionPrompt {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /reveal answer/i }),
    ).toBeDisabled();
  });

  it("clicking an option enables the Reveal Answer button", async () => {
    const user = userEvent.setup();
    render(<PredictionPrompt {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "A" }));
    expect(
      screen.getByRole("button", { name: /reveal answer/i }),
    ).not.toBeDisabled();
  });

  it("clicking Reveal Answer shows the reveal text", async () => {
    const user = userEvent.setup();
    render(<PredictionPrompt {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "B" }));
    await user.click(screen.getByRole("button", { name: /reveal answer/i }));

    expect(screen.getByText("Test answer")).toBeInTheDocument();
  });

  // (a) Reveal → answer shown, aria-expanded true
  it("(a) after reveal, answer is visible and aria-expanded is true", async () => {
    const user = userEvent.setup();
    render(<PredictionPrompt {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "A" }));
    await user.click(screen.getByRole("button", { name: /reveal answer/i }));

    expect(screen.getByText("Test answer")).toBeInTheDocument();
    // answer panel div has aria-expanded="true"
    const panel = screen.getByText("Test answer").closest("[aria-expanded]");
    expect(panel).toHaveAttribute("aria-expanded", "true");
  });

  // (b) "Hide answer" → answer hidden
  it("(b) clicking Hide answer hides the answer panel", async () => {
    const user = userEvent.setup();
    render(<PredictionPrompt {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "A" }));
    await user.click(screen.getByRole("button", { name: /reveal answer/i }));
    await user.click(screen.getByRole("button", { name: /hide answer/i }));

    expect(screen.queryByText("Test answer")).not.toBeInTheDocument();
  });

  // (c) "Reveal again" → answer shown again
  it("(c) clicking Reveal again shows the answer again", async () => {
    const user = userEvent.setup();
    render(<PredictionPrompt {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "A" }));
    await user.click(screen.getByRole("button", { name: /reveal answer/i }));
    await user.click(screen.getByRole("button", { name: /hide answer/i }));
    await user.click(screen.getByRole("button", { name: /reveal again/i }));

    expect(screen.getByText("Test answer")).toBeInTheDocument();
  });

  // (d) "Try again" → initial state (no selection, no reveal)
  it("(d) clicking Try again resets to initial state", async () => {
    const user = userEvent.setup();
    render(<PredictionPrompt {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "A" }));
    await user.click(screen.getByRole("button", { name: /reveal answer/i }));
    await user.click(screen.getByRole("button", { name: /try again/i }));

    // Answer gone
    expect(screen.queryByText("Test answer")).not.toBeInTheDocument();
    // "Reveal Answer →" button back, disabled (no selection)
    expect(
      screen.getByRole("button", { name: /reveal answer/i }),
    ).toBeDisabled();
    // Options are interactive again (not disabled)
    const optionA = screen.getByRole("button", { name: "A" });
    expect(optionA).not.toBeDisabled();
  });

  // (e) aria-expanded toggles correctly
  it("(e) aria-expanded is false on Reveal again button when collapsed", async () => {
    const user = userEvent.setup();
    render(<PredictionPrompt {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "A" }));
    await user.click(screen.getByRole("button", { name: /reveal answer/i }));
    await user.click(screen.getByRole("button", { name: /hide answer/i }));

    const revealAgain = screen.getByRole("button", { name: /reveal again/i });
    expect(revealAgain).toHaveAttribute("aria-expanded", "false");
  });
});
