import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ExplorationWrapper from "@/components/learn/ExplorationWrapper";

// ── Mock React Flow ────────────────────────────────────────────────────────
vi.mock("@xyflow/react", () => ({
  ReactFlow: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="react-flow">{children}</div>
  ),
  Background: () => null,
  Controls: () => null,
  MiniMap: () => null,
  useNodesState: () => [[], vi.fn(), vi.fn()],
  useEdgesState: () => [[], vi.fn(), vi.fn()],
}));

// ── Mock next/dynamic (ReactFlowExploration lazy import) ──────────────────
vi.mock("next/dynamic", () => ({
  default: () => {
    const Stub = () => <div data-testid="react-flow-exploration" />;
    Stub.displayName = "DynamicStub";
    return Stub;
  },
}));

// ── ResizeObserver mock ────────────────────────────────────────────────────
type ROCallback = (entries: ResizeObserverEntry[]) => void;

let observerCallback: ROCallback | null = null;

function makeEntry(width: number): ResizeObserverEntry {
  return {
    contentRect: { width } as DOMRectReadOnly,
  } as ResizeObserverEntry;
}

function MockResizeObserver(cb: ROCallback) {
  observerCallback = cb;
  return {
    observe() {},
    disconnect() {
      observerCallback = null;
    },
    unobserve() {},
  };
}

const defaultProps = {
  title: "Test Exploration",
  nodes: [],
  edges: [],
};

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", MockResizeObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
  observerCallback = null;
});

// ── Helpers ────────────────────────────────────────────────────────────────

/** Returns the content wrapper div that holds the height style. */
function getContentWrapper(heightPx: number) {
  return document.querySelector(
    `[style*="height: ${heightPx}px"], [style*="height:${heightPx}px"]`,
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("ExplorationWrapper — ResizeObserver sizing", () => {
  it("(a) 480px container width → tablet height (400px)", () => {
    render(<ExplorationWrapper {...defaultProps} />);

    act(() => {
      observerCallback?.([makeEntry(480)]);
    });

    // isTablet = containerWidth >= 480 → height 400px, React Flow shown
    expect(getContentWrapper(400)).not.toBeNull();
    expect(screen.getByTestId("react-flow-exploration")).toBeInTheDocument();
  });

  it("(b) 800px container width → desktop height (500px)", () => {
    render(<ExplorationWrapper {...defaultProps} />);

    act(() => {
      observerCallback?.([makeEntry(800)]);
    });

    // isDesktop = containerWidth >= 768 → height 500px, React Flow shown
    expect(getContentWrapper(500)).not.toBeNull();
    expect(screen.getByTestId("react-flow-exploration")).toBeInTheDocument();
  });

  it("(c) 375px container width → static fallback shown (no React Flow)", () => {
    render(<ExplorationWrapper {...defaultProps} />);

    act(() => {
      observerCallback?.([makeEntry(375)]);
    });

    // Mobile: isDesktop=false, isTablet=false → text fallback
    expect(
      screen.getByText(
        "View on a larger screen for the interactive exploration.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("react-flow-exploration")).toBeNull();
  });

  it("(c) static image fallback shown when staticFallbackUrl provided on mobile", () => {
    render(
      <ExplorationWrapper
        {...defaultProps}
        staticFallbackUrl="/diagrams/test.png"
      />,
    );

    act(() => {
      observerCallback?.([makeEntry(375)]);
    });

    const img = screen.getByRole("img", { name: "Test Exploration" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/diagrams/test.png");
  });

  it("uses SSR-safe default (800px → desktop 500px) before ResizeObserver fires", () => {
    render(<ExplorationWrapper {...defaultProps} />);

    // No ResizeObserver callback fired yet — default containerWidth=800 → desktop
    expect(getContentWrapper(500)).not.toBeNull();
  });
});
