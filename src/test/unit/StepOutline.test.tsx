import { render, screen } from "@testing-library/react";
import { beforeAll, describe, it, expect, vi } from "vitest";
import StepOutline from "@/components/level/StepOutline";

// jsdom does not implement scrollIntoView — provide a no-op stub
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

const makeSections = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    type: "text",
    title: `Section ${i + 1}`,
    index: i,
  }));

describe("StepOutline — Step X of Y indicator", () => {
  it("(a) step=3 of 12 learn sections → shows 'Step 4 of 13' (12 learn + 1 game)", () => {
    // 12 learn sections → allSteps = 13 (12 learn + 1 game)
    render(
      <StepOutline
        sections={makeSections(12)}
        currentStep={3}
        onStepClick={vi.fn()}
      />,
    );
    expect(screen.getByTestId("step-of-total")).toHaveTextContent(
      "Step 4 of 13",
    );
  });

  it("(b) 1-indexed: step=0 shows 'Step 1 of ...'", () => {
    render(
      <StepOutline
        sections={makeSections(5)}
        currentStep={0}
        onStepClick={vi.fn()}
      />,
    );
    // 5 learn + 1 game = 6 total
    expect(screen.getByTestId("step-of-total")).toHaveTextContent(
      "Step 1 of 6",
    );
  });

  it("(c) indicator updates when currentStep prop changes", () => {
    const { rerender } = render(
      <StepOutline
        sections={makeSections(4)}
        currentStep={0}
        onStepClick={vi.fn()}
      />,
    );
    // 4 learn + 1 game = 5 total
    expect(screen.getByTestId("step-of-total")).toHaveTextContent(
      "Step 1 of 5",
    );

    rerender(
      <StepOutline
        sections={makeSections(4)}
        currentStep={2}
        onStepClick={vi.fn()}
      />,
    );
    expect(screen.getByTestId("step-of-total")).toHaveTextContent(
      "Step 3 of 5",
    );
  });
});
