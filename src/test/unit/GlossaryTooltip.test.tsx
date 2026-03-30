import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { GlossaryTooltip } from "@/components/learn/GlossaryTooltip";

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

// jsdom includes ontouchstart by default, so the component runs in touch-device
// mode. Tooltip is triggered by click (tap) in that mode, not mouseenter.
// Tests (a)-(e) all use fireEvent.click to show the tooltip.

describe("GlossaryTooltip", () => {
  // (a) Trigger shows tooltip with role="tooltip"
  it("(a) shows tooltip with role=tooltip on click/tap", async () => {
    render(
      <GlossaryTooltip term="vector">
        <span>vector</span>
      </GlossaryTooltip>,
    );

    const trigger = screen.getByText("vector").closest("[data-glossary-term]")!;
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    // Tooltip contains the definition text
    expect(screen.getByRole("tooltip")).toHaveTextContent(/list of numbers/i);
  });

  // (b) Escape closes the tooltip
  it("(b) Escape key closes the tooltip", async () => {
    render(<GlossaryTooltip term="embedding">embedding</GlossaryTooltip>);

    const trigger = screen.getByText("embedding");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    // Use act to ensure the useEffect that registers the global Escape listener
    // has run before we dispatch the keydown event.
    await act(async () => {
      fireEvent.keyDown(document, { key: "Escape", bubbles: true });
    });

    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  // (c) First-use: "New" badge present
  it("(c) shows New badge on first encounter", async () => {
    // localStorage is empty -- term has never been seen
    render(<GlossaryTooltip term="chunk">chunk</GlossaryTooltip>);

    const trigger = screen.getByText("chunk");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    expect(screen.getByText(/^New$/i)).toBeInTheDocument();
  });

  // (d) Repeat use: no "New" badge
  it("(d) does not show New badge on repeat encounter", async () => {
    // Pre-seed the seen list
    localStorageMock.setItem(
      "aiquest_glossary_seen",
      JSON.stringify(["chunk"]),
    );

    render(<GlossaryTooltip term="chunk">chunk</GlossaryTooltip>);

    const trigger = screen.getByText("chunk");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    expect(screen.queryByText(/^New$/i)).not.toBeInTheDocument();
  });

  // (e) Click/tap on touch device shows tooltip (jsdom always has ontouchstart)
  it("(e) click on touch device shows tooltip", async () => {
    render(<GlossaryTooltip term="BM25">BM25</GlossaryTooltip>);

    const trigger = screen.getByText("BM25");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    expect(screen.getByRole("tooltip")).toHaveTextContent(/Best Match 25/i);
  });

  // Additional: unknown term renders children without tooltip
  it("renders children without tooltip for unknown terms", () => {
    render(<GlossaryTooltip term="not-a-real-term">some text</GlossaryTooltip>);
    expect(screen.getByText("some text")).toBeInTheDocument();
    // No trigger span with data-glossary-term
    expect(
      document.querySelector("[data-glossary-term]"),
    ).not.toBeInTheDocument();
  });

  // Additional: second click dismisses tooltip
  it("second click dismisses the open tooltip", async () => {
    render(<GlossaryTooltip term="vector">vector</GlossaryTooltip>);

    const trigger = screen.getByText("vector");
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    // Second click should close
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });
});
