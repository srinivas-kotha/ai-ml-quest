import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import AnalogyPanel from "@/components/learn/AnalogyPanel";

const mockAnalogies = [
  {
    background: "backend",
    familiarConcept: "Database Index",
    familiarIcon: "📇",
    newConcept: "Vector Index",
    newIcon: "🧮",
    bridgeText:
      "Just like a DB index speeds up row lookups, a vector index speeds up nearest-neighbour search.",
    breakPoint:
      "Unlike a B-tree, vector indexes are approximate — they trade recall for speed.",
  },
  {
    background: "backend",
    familiarConcept: "Cache",
    familiarIcon: "💾",
    newConcept: "Embedding Cache",
    newIcon: "🗂️",
    bridgeText:
      "Both store expensive-to-compute results so you don't recompute them on every request.",
    breakPoint:
      "Embedding caches can go stale when the underlying model is retrained.",
  },
  {
    background: "devops",
    familiarConcept: "Load Balancer",
    familiarIcon: "⚖️",
    newConcept: "Router LLM",
    newIcon: "🤖",
    bridgeText:
      "A router LLM directs queries to the cheapest capable model, just like a load balancer routes traffic.",
    breakPoint:
      "Unlike a load balancer, the router LLM itself adds latency and cost.",
  },
  {
    background: "general",
    familiarConcept: "Recipe",
    familiarIcon: "📋",
    newConcept: "Prompt Template",
    newIcon: "✍️",
    bridgeText:
      "A prompt template is a reusable recipe: fixed structure with variable ingredients.",
    breakPoint:
      "Unlike recipes, prompt templates can behave differently with the same inputs across model versions.",
  },
];

describe("AnalogyPanel", () => {
  it("(a) DevOps tab: pagination visible, arrows disabled, shows '1 of 1'", async () => {
    const user = userEvent.setup();
    render(<AnalogyPanel analogies={mockAnalogies} />);

    // Switch to DevOps tab
    await user.click(screen.getByRole("button", { name: "DevOps" }));

    // Pagination text shows 1 of 1
    expect(screen.getByText("1 of 1")).toBeInTheDocument();

    // Both arrows are aria-disabled
    const prevBtn = screen.getByRole("button", { name: "Previous analogy" });
    const nextBtn = screen.getByRole("button", { name: "Next analogy" });
    expect(prevBtn).toHaveAttribute("aria-disabled", "true");
    expect(nextBtn).toHaveAttribute("aria-disabled", "true");
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeDisabled();
  });

  it("(b) General tab appears as an explicit tab", () => {
    render(<AnalogyPanel analogies={mockAnalogies} />);
    expect(screen.getByRole("button", { name: "General" })).toBeInTheDocument();
  });

  it("(c) Backend tab shows only 2 backend items, not the general one", async () => {
    const user = userEvent.setup();
    render(<AnalogyPanel analogies={mockAnalogies} />);

    // Backend is first tab — already selected by default
    expect(screen.getByText("1 of 2")).toBeInTheDocument();

    // Advance to second item
    await user.click(screen.getByRole("button", { name: "Next analogy" }));
    expect(screen.getByText("2 of 2")).toBeInTheDocument();

    // Next is now disabled
    expect(screen.getByRole("button", { name: "Next analogy" })).toBeDisabled();
  });

  it("(d) Tab switch resets index to 0", async () => {
    const user = userEvent.setup();
    render(<AnalogyPanel analogies={mockAnalogies} />);

    // Advance to item 2 on Backend tab
    await user.click(screen.getByRole("button", { name: "Next analogy" }));
    expect(screen.getByText("2 of 2")).toBeInTheDocument();

    // Switch to DevOps
    await user.click(screen.getByRole("button", { name: "DevOps" }));
    expect(screen.getByText("1 of 1")).toBeInTheDocument();

    // Switch back to Backend — should be back at 1
    await user.click(screen.getByRole("button", { name: "Backend" }));
    expect(screen.getByText("1 of 2")).toBeInTheDocument();
  });

  it("(e) Prev disabled at index 0, Next disabled at last index on Backend tab", async () => {
    const user = userEvent.setup();
    render(<AnalogyPanel analogies={mockAnalogies} />);

    const prevBtn = screen.getByRole("button", { name: "Previous analogy" });
    const nextBtn = screen.getByRole("button", { name: "Next analogy" });

    // At index 0: Prev disabled, Next enabled
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    // Advance to last
    await user.click(nextBtn);
    expect(screen.getByText("2 of 2")).toBeInTheDocument();

    // At last index: Prev enabled, Next disabled
    expect(prevBtn).not.toBeDisabled();
    expect(nextBtn).toBeDisabled();
  });
});
