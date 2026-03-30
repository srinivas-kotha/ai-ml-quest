# UX Polish Sprint — Level Page Issues (Reworked)

> Created: 2026-03-30
> Reworked: 2026-03-30 — addresses all 10 required actions from phase-evaluator
> Status: READY FOR IMPLEMENTATION
> Context: User tested Level 1 after UX redesign (PR #47), found 11 issues + 3 learning methodology gaps
> Baseline: ZERO tests exist. No regression baseline. Safety net must be built, not protected.

---

## Table of Contents

1. [Issue Inventory](#1-issue-inventory)
2. [Investigation Findings](#2-investigation-findings)
3. [Architecture Decisions](#3-architecture-decisions)
4. [Scope Boundaries](#4-scope-boundaries)
5. [Phase 0 — Prerequisites](#5-phase-0--prerequisites)
6. [Phase 1 — P1 Broken / Unusable](#6-phase-1--p1-broken--unusable)
7. [Phase 2 — P2 Confusing / Misleading](#7-phase-2--p2-confusing--misleading)
8. [Phase 3 — Learning Methodology](#8-phase-3--learning-methodology)
9. [Risk Register](#9-risk-register)
10. [Test Plan](#10-test-plan)

---

## 1. Issue Inventory

Issues received from user testing of Level 1 after UX redesign (PR #47). Categorized by severity.

### P1 — Broken / Unusable

| #   | Title                                           | Root Cause                                                                                         |
| --- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 1   | Pipeline buttons look unstyled                  | `PipelineDiagram.tsx` uses inline `text-xs px-2.5 py-1 rounded` without design-system button class |
| 2   | Pipeline "Done" button is disabled on last step | `handleNext` returns early when `next >= orderedIds.length`; the final state has no exit handler   |
| 3   | PredictionPrompt has no collapse after reveal   | `revealed` state is one-way — no reset path, no collapse button                                    |
| 5   | Analogy pagination — arrows cycle wrong content | See Investigation Findings §2.1 — root cause is subtler than reported                              |
| 6   | DevOps tab shows 0 pagination arrows            | 1 analogy for DevOps → `filtered.length > 1` guard hides pagination — correct but confusing        |
| 7   | React Flow exploration is too small             | `ExplorationWrapper` caps height at 450px/350px, constrained inside `maxWidth: 800px` CardFlow     |
| 8   | D2 Architecture diagram micro-sized             | `DiagramViewer` renders SVG at `min-width: 400px` inside 800px card — no zoom, text unreadable     |
| 9   | D2 Decision Tree same micro-size issue          | Same as Issue 8                                                                                    |

### P2 — Confusing / Misleading

| #   | Title                                | Root Cause                                                                                 |
| --- | ------------------------------------ | ------------------------------------------------------------------------------------------ |
| 4   | Sidebar perceived as separate levels | Sidebar shows section names only, no "X of Y steps in this level" context                  |
| 10  | Level header static across all cards | `page.tsx` renders header once above `LevelPageClient`; it does not react to `currentStep` |
| 11  | Issues repeat across all levels      | Components are shared — any component fix propagates to all levels automatically           |

### Learning Methodology Gaps

| #   | Title                                                                                          |
| --- | ---------------------------------------------------------------------------------------------- |
| L1  | Terms used before defined — "vector", "embedding" in step 1 before text explanation in step 3  |
| L2  | Expert terminology without human context — "cosine similarity", "K chunks", "backoff"          |
| L3  | Cross-level references — B-tree analogy references Level 4 (Vector Databases), not yet covered |

---

## 2. Investigation Findings

### 2.1 Issue 5 — Analogy Pagination Root Cause (Corrected)

**Reported:** "Prev/next arrows navigate to a different concept."

**Actual behavior after code review:**

`AnalogyPanel.tsx` lines 30-33:

```typescript
const filtered = analogies.filter(
  (a) => a.background === selectedBg || a.background === "general",
);
```

The `filtered` array includes both the selected background AND any `background === "general"` items. Pagination arrows navigate within `filtered`.

**Level 1 seed data (verified):** 10 analogies — 4 backend, 5 frontend, 1 devops. **No items have `background === "general"`.**

**Conclusion:** Issue 5 is NOT a pagination bug for Level 1. The reported confusion is almost certainly caused by:

1. The "general" mixing behavior — if future levels add `background: "general"` items, they will unexpectedly appear in every tab's rotation, and users will see apparently unrelated content. This is a latent bug.
2. The DevOps tab (Issue 6) showing 1 analogy with no prev/next controls, making the interface feel broken — user may have conflated the two issues.

**Action:** Fix the latent "general" mixing bug by making "general" a separate tab or excluding it from per-background filtering. Fix Issue 6 (always show pagination, disable arrows at boundaries). Document the finding to prevent recurrence.

### 2.2 Issue 4 — Scope Clarification (Corrected)

**Reported:** "User thinks each sidebar item is a separate level."

**What the sidebar currently shows:** Step number circle + section type emoji + truncated section title. The sidebar header says "In this level" (10px uppercase, low contrast).

**Missing:** There is no visible "Step X of Y" counter at the top of the sidebar that grounds the user. The `Progress` counter at the bottom of the sidebar shows `X/Y` but is below the fold on short viewports.

**Fix scope:** Add a prominent "Step X of Y" label at the top of the sidebar panel, directly below "In this level". This is distinct from reordering cards — it is a sidebar perception fix only.

### 2.3 Zero Test Coverage Acknowledgment

The "1996 unit tests" mentioned in earlier planning docs refer to StreamVault, not AI/ML Quest. AI/ML Quest has zero test files and no test framework configured. There is no regression baseline. Every fix in this sprint ships without automated safety — manual test execution is the only gate. Phase 0 includes test framework setup precisely to change this for future sprints.

---

## 3. Architecture Decisions

### Decision A: D2 Diagrams — Replace vs Zoom Modal

**Problem:** D2-generated SVGs are unreadable at `maxWidth: 800px` card width. `min-width: 400px` means on smaller viewports the SVG overflows. The "View full size" link requires a tab switch, breaking flow.

**Option 1 — Replace with React Flow (custom layouts per diagram type)**

- D2 "RAG Architecture Overview" is a DAG → use dagre layout
- D2 "RAG vs Fine-Tuning Decision Tree" is a tree → use top-down tree layout
- Interactive, zoomable, theme-aware, consistent with existing `exploration` card type
- Requires React Flow PoC (see Phase 0, Task P0-3) before committing
- All nodes/edges must be authored in seed data JSON — content authoring overhead

**Option 2 — Add click-to-expand modal (zoom overlay)**

- Keep SVG files, add `<dialog>` overlay triggered on click
- Readable in expanded state; no content re-authoring
- SVG is still static (no interactivity, no theming)
- Adds a modal component and focus-trap logic

**Option 3 — Replace with React Flow only for Level 1; modal fallback for others**

- Hybrid: Level 1 D2 cards are already authored as `d2_diagram` type; convert them to `exploration` type with React Flow data
- Other chapters keep D2 with zoom modal until React Flow PoC is proven

**Decision: Option 3 (hybrid), pending PoC result.**

Rationale: The `.claude/CLAUDE.md` LOCKED diagram strategy already states "In-app diagrams → React Flow". Option 2 alone contradicts that locked decision. Option 1 requires PoC validation (especially decision tree layout). Option 3 implements the locked strategy for Level 1 while using a temporary zoom modal as a safety net for Chapters 2-5. The PoC in Phase 0 will determine whether dagre layout works acceptably for decision trees.

If the PoC fails (dagre decision tree is unreadable), fall back to Option 2 for all D2 types and file a separate architectural ticket to revisit.

### Decision B: PredictionPrompt — Collapse vs Reset

These are pedagogically distinct behaviors. Conflating them in one button was the original design flaw.

**Collapse (UI state):** Hide the revealed answer panel so user can re-read the question. State remains `revealed = true`. Useful for re-testing memory without losing progress tracking.

**Reset (learning action):** Return to unselected + unrevealed state. Appropriate only when the user explicitly wants to retry the prediction as if they hadn't answered. Should be visually secondary to avoid accidental resets.

**Decision:** Implement both as separate UI affordances:

- After reveal: small "Hide answer ▲" button in the answer panel header (collapse)
- After reveal: even smaller "Try again" ghost link at the bottom (reset)
- Collapsed state shows the question again with a "Reveal again →" button

### Decision C: Terms Dictionary Architecture

**Options considered:**

1. **Client-side JSON dictionary** — hardcoded terms object in a new `src/data/glossary.ts`, loaded at build time. Simple, no DB changes.
2. **Database table** — new `quest_glossary_terms` table with term, definition, chapter scope. Supports per-chapter definitions (e.g., "chunk" means different things in RAG vs fine-tuning).
3. **Inline seed data annotations** — terms defined inline in section content as `{term: "vector", definition: "..."}` JSON fields.

**Decision: Client-side JSON dictionary (Option 1) for this sprint.**

Rationale: The scope of terminology tooltips in this sprint is limited to Level 1 terms. A database table is over-engineered for this sprint. Inline annotations require seed data changes to every section that uses a term. A `glossary.ts` file can be expanded to a DB table in a future sprint without breaking the tooltip component's API.

Architecture:

- `src/data/glossary.ts` — exports `Record<string, { definition: string; learnMore?: string }>`
- `src/components/learn/GlossaryTooltip.tsx` — wraps a term span, shows popover on hover/focus
- Terms are matched in rendered text by `MarkdownText.tsx` (or explicitly annotated in section content)
- `localStorage` key `aiquest_tooltip_seen` — set of terms user has already seen; first-use tooltip is more prominent, subsequent uses are lighter
- Tooltip renders in a portal (`document.body`) to avoid React Flow z-index conflicts

---

## 4. Scope Boundaries

### In Scope (This Sprint)

- All 9 P1/P2 issues listed in §1
- Issue 11 (systemic) — handled automatically since fixes are in shared components
- Learning gaps L1, L2, L3 — targeted rewrites in `seed/chapter1-rag.json`
- Analogy "general" latent bug fix
- Sidebar perception fix (Step X of Y label)
- Terms dictionary architecture + Level 1 glossary terms only
- Test framework setup (Vitest + Playwright)
- Mobile acceptance criteria defined and verified for all Phase 1/2 fixes

### Out of Scope (Explicitly Deferred)

- Chapters 2-5 analogy rewrites — Chapter 1 is the only chapter with analogies authored today
- Chapters 2-5 D2 diagram replacement — not authored yet; apply when content is written
- Spaced repetition system — acknowledged structural gap, requires database-level changes, separate sprint
- Full glossary for all 54 levels — Phase 3 delivers Level 1 terms only; expansion is a future sprint
- Per-card learning objectives display in the UI — learning science recommendation, requires UX design and database column additions
- Auth flows, progress persistence, XP system — not touched in this sprint
- Light theme verification — out of scope but flagged for future design review

### Future Sprint Tickets (File After This Sprint)

- `feat/spaced-repetition` — structural gap acknowledged in learning science review
- `feat/per-card-objectives` — add `learning_objective` column to `quest_learn_sections`, display in card header
- `feat/glossary-database` — migrate `glossary.ts` to `quest_glossary_terms` table with chapter scope
- `feat/chapters-2-5-analogies` — rewrite analogies for self-containment when content is authored

---

## 5. Phase 0 — Prerequisites

Must complete before any Phase 1 implementation. Estimated 7-9 hours total.

No Phase 1 code should be written until P0-1 (content audit) and P0-3 (React Flow PoC) are complete.

---

### Task P0-1: Content Audit — Level 1 Terminology and Forward References

**Why prerequisite:** Phase 3 rewrites depend on knowing exactly which terms are undefined and which analogies contain forward references. Doing fixes without this list risks missing occurrences.

**Deliverable:** A markdown checklist (`docs/content-audit-level1.md`) listing:

- Every technical term used in Level 1 before its definition card (sort_order scan)
- Every analogy `breakPoint` or `bridgeText` that references a concept from another level
- Every `bridgeText` that uses undefined jargon without "Think of it as..." framing

**How to execute:**

1. Read all 11 learn sections in `seed/chapter1-rag.json` in sort_order sequence
2. For each technical term encountered, note: first appearance card, definition card (if any)
3. For each analogy, check `familiarConcept` is within the named background domain; check `bridgeText` for forward refs
4. Output the checklist — every item is either "Fix in Phase 3" or "Already OK"

**Acceptance criteria:**

- [ ] Audit document created at `docs/content-audit-level1.md`
- [ ] Every term with first appearance before sort_order=3 (text card) is listed
- [ ] Every analogy with a cross-level reference is identified by `familiarConcept` name
- [ ] Document is reviewed before any Phase 3 work begins

**Estimate:** 2 hours
**Files:** `seed/chapter1-rag.json` (read only), create `docs/content-audit-level1.md`

---

### Task P0-2: Test Framework Setup

**Why prerequisite:** Zero tests exist. Phase 1 fixes change interaction behavior. Without at least a smoke test, regressions are invisible until user testing.

**Deliverable:** Vitest configured for unit tests + Playwright configured for E2E smoke tests. Two smoke tests passing: page load and basic navigation.

**Implementation steps:**

1. Install Vitest and React Testing Library:
   ```
   npm install --save-dev vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event jsdom
   ```
2. Create `vitest.config.ts` at project root:
   ```typescript
   import { defineConfig } from "vitest/config";
   import react from "@vitejs/plugin-react";
   export default defineConfig({
     plugins: [react()],
     test: {
       environment: "jsdom",
       globals: true,
       setupFiles: ["./src/test/setup.ts"],
     },
   });
   ```
3. Create `src/test/setup.ts` with `@testing-library/jest-dom` matchers
4. Install Playwright: `npm install --save-dev @playwright/test` + `npx playwright install chromium`
5. Create `playwright.config.ts` targeting `http://localhost:3003`
6. Write first E2E test: navigate to Level 1, verify page title contains "What is RAG", verify step counter shows "1 of"
7. Write first unit test: render `PredictionPrompt` with mock props, verify "Reveal Answer" button exists

**Acceptance criteria:**

- [ ] `npm run test` runs Vitest and passes (at least 1 unit test)
- [ ] `npm run test:e2e` runs Playwright against localhost and passes (at least 2 tests)
- [ ] CI step added to `package.json` scripts: `"test": "vitest run"`, `"test:e2e": "playwright test"`
- [ ] No existing functionality broken (build passes)

**Contingency (if setup exceeds 6h):**

- Fallback A: Defer Playwright E2E to post-sprint. Ship with Vitest unit tests only + manual checklists as the acceptance gate.
- Fallback B: If Vitest itself is blocked by Next.js App Router mocking issues, use manual testing exclusively for this sprint and file a `feat/test-framework` ticket for a dedicated test setup sprint.
- Decision point: At the 4-hour mark, assess remaining work. If >2h remains, trigger Fallback A.

**Estimate:** 3 hours
**Files created:** `vitest.config.ts`, `playwright.config.ts`, `src/test/setup.ts`, `src/test/unit/PredictionPrompt.test.tsx`, `tests/e2e/level1.spec.ts`

---

### Task P0-3: React Flow Decision Tree PoC

**Why prerequisite:** Decision A requires knowing whether dagre layout produces a readable decision tree before committing to replacing D2 diagrams with React Flow. The RAG Architecture DAG is straightforward; the decision tree is the risk.

**Deliverable:** A working React Flow render of the "RAG vs Fine-Tuning Decision Tree" using dagre layout, verified readable at 800px card width and 450px height.

**Implementation steps:**

1. Install dagre layout adapter if not already present:
   ```
   npm install @dagrejs/dagre
   ```
2. Create a standalone test page at `src/app/poc/decision-tree/page.tsx` (remove after PoC)
3. Implement the RAG vs Fine-Tuning decision tree as React Flow nodes/edges using `elkjs` or `dagre` layout
4. Render at `maxWidth: 800px`, `height: 450px`
5. Verify: all node labels are readable without zoom; decision branches are visually clear; fit-view centers correctly

**Decision gate:** If the decision tree is legible and the branching layout is clear → proceed with Option 3 (React Flow for Level 1 D2 cards). If text overlaps or branches are unclear → fall back to Option 2 (zoom modal for all D2 types) and update Decision A before Phase 1.

**Acceptance criteria:**

- [ ] Decision tree renders at 800px × 450px with no text overlap
- [ ] All branch labels are readable at 1x zoom
- [ ] `fitView` centers the tree without clipping nodes
- [ ] Decision documented in this plan (update Decision A section with outcome)
- [ ] PoC page removed before Phase 1 PRs

**Estimate:** 2 hours
**Files:** `src/app/poc/decision-tree/page.tsx` (temporary), update this plan with outcome

---

### Task P0-4: Verify MarkdownText Rendering Coverage

**Why prerequisite:** GlossaryTooltip `[[term:X]]` syntax only works in content rendered through MarkdownText.tsx. If other components render content through different paths (raw JSX, dangerouslySetInnerHTML), glossary terms will silently not appear.

**Deliverable:** A list of all content rendering paths in learn components, confirming which support `[[term:X]]` and which don't.

**How to execute:**

1. Grep all learn components for content rendering: search for `dangerouslySetInnerHTML`, raw string interpolation in JSX, and components that render `description`/`content`/`text` props
2. For each path found, determine if it goes through MarkdownText.tsx
3. If any path bypasses MarkdownText, either: (a) route it through MarkdownText, or (b) exclude that content from glossary term scope and document the limitation

**Acceptance criteria:**

- [ ] All content rendering paths in learn components are documented
- [ ] Paths that bypass MarkdownText are identified
- [ ] Decision documented: expand MarkdownText coverage or limit glossary scope

**Estimate:** 1 hour
**Files:** Read-only scan of all `src/components/learn/*.tsx`

---

## 6. Phase 1 — P1 Broken / Unusable

Fixes for issues that prevent meaningful use of the level. Estimated 9-11 hours total.

Dependencies: Phase 0 complete (P0-2 for test baseline, P0-3 for Fix 8/9 approach).

---

### Fix 1: PipelineDiagram — Button Styling

**Problem:** Reset, Prev, Next, and Done/Start buttons in `PipelineDiagram.tsx` use raw `text-xs px-2.5 py-1 rounded` classes with `style` overrides. They look like plain text links, not buttons. The design system has a shared `Button.tsx` component and `.btn-3d` class.

**Expert rationale (UI Developer):** The `NavButton` in `CardFlow.tsx` demonstrates the correct pattern — it uses design-system tokens for colors, borders, and hover states via inline style + CSS vars. PipelineDiagram buttons should follow the same pattern. Using `Button.tsx` from `src/components/ui/Button.tsx` is preferred for consistency; if it doesn't support the `xs` size variant needed, extend it rather than duplicating styles.

**Implementation:**

1. Review `src/components/ui/Button.tsx` variants (primary/secondary/danger)
2. Add an `xs` size variant if missing, or use the existing `secondary` variant with a size prop
3. Replace the Reset button (line 463 in PipelineDiagram.tsx) with `<Button variant="secondary" size="xs">`
4. Replace Prev button (line 474) with `<Button variant="secondary" size="xs" disabled={...}>`
5. Replace the Start/Next/Done button (line 487) with `<Button variant="primary" size="xs">` when Start, `<Button variant="secondary" size="xs">` when Next/Done

**Acceptance criteria:**

- [ ] All four pipeline buttons use design-system `Button.tsx` or equivalent styled component
- [ ] Buttons are visually distinguishable from plain text at a glance
- [ ] Start button uses accent color (primary variant) to draw attention
- [ ] `disabled` state is visually distinct (opacity or grayed color) and has `aria-disabled`
- [ ] Hover state uses the standard design system transition (150ms ease-out)
- [ ] `prefers-reduced-motion` honored (no transition if motion reduced)
- [ ] Visual appearance matches existing NavButton in CardFlow

**Estimate:** 1.5 hours
**Files:** `src/components/learn/PipelineDiagram.tsx`, `src/components/ui/Button.tsx` (may need size variant addition)
**Test:** Unit test: render PipelineDiagram in step-through mode, assert buttons have correct class/variant

---

### Fix 2: PipelineDiagram — Done Handler + Collapse/Reset Separation

**Problem:** When on the last step (`step === orderedIds.length - 1`), the `handleNext` function returns `prev` unchanged (lines 151-156). The button label becomes "Done ✓" but it is `disabled` because `step >= orderedIds.length - 1`. The user is stuck.

**Expert rationale (UX Designer):** "Done" and "Reset" are separate concepts. "Done" means "I've finished stepping through this pipeline." "Reset" means "I want to start over." These require separate affordances to avoid confusion. Completing a pipeline should feel like an achievement, not a dead end.

**Two-state model:**

- `step < orderedIds.length - 1`: normal stepping
- `step === orderedIds.length - 1` (completed state): show "Done ✓" as an **enabled** button; clicking it sets `completed = true`
- `completed === true`: show a completion acknowledgment panel (brief, 1-2 lines) with a "Reset" button to start over

**Implementation:**

1. Add `const [completed, setCompleted] = useState(false)` to PipelineDiagram
2. Change Done button: remove `disabled` condition when `step >= orderedIds.length - 1`, instead handle click with `setCompleted(true)`
3. Render a completion state panel when `completed === true`:
   - "Pipeline complete! You've walked through all 5 steps." (using the node count dynamically)
   - "Reset" button to call `handleReset` (which also sets `completed = false`)
4. Reset button in controls bar also sets `completed = false`

**Acceptance criteria:**

- [ ] Clicking "Done ✓" on the last step does not leave the user in a dead-end state
- [ ] A completion acknowledgment is shown after clicking Done
- [ ] "Reset" returns to step -1 (unstarted state), not step 0
- [ ] The Reset button in the controls bar is always visible (before Done is clicked) and sets completed = false
- [ ] Keyboard: pressing Enter on "Done ✓" triggers completion, not silent disabled behavior
- [ ] Screen reader: completion state is announced via the existing `liveRef` pattern

**Estimate:** 1.5 hours
**Files:** `src/components/learn/PipelineDiagram.tsx`
**Test:** Unit test: (a) step sequence advances correctly from -1 → 0 → ... → n-1; (b) no stale state from closure after useEffect dep array fix — verify keyboard handler uses current step value; (c) click Done on last step → completion panel renders; (d) Reset from completed state returns to step -1

---

### Fix 3: PredictionPrompt — Collapse and Reset States

**Problem:** `PredictionPrompt.tsx` is one-way — once `revealed = true`, there is no path back. The component stays permanently expanded.

**Expert rationale (UX Designer, Learning Scientist):** Collapse and reset are pedagogically distinct.

- **Collapse:** "I've seen the answer; let me re-read the question." Doesn't erase progress.
- **Reset:** "I want to try predicting again from scratch." Erases the selected option and reveal state.

Both are valid learning behaviors. The `CardFlow` "Next" button navigation should also collapse (not reset) the prediction so the next time the user navigates back, they can optionally reveal again.

**Implementation:**

Add `const [collapsed, setCollapsed] = useState(false)` state.

When `revealed === true && collapsed === false` (expanded answer):

- Show answer panel as currently implemented
- Add "Hide answer ▲" button inside the answer panel header (secondary, small)
- Add "Try again" ghost text button below the answer panel

When `revealed === true && collapsed === true` (question re-shown):

- Show question text and options (options are disabled/display-only showing the previously selected)
- Show a "Reveal again →" button (primary style)
- Show a faint "Reset prediction" ghost link

When `revealed === false` (initial state): no change from current behavior.

On CardFlow "Next" navigation: collapse (not reset) via an optional `onNavigateAway` prop if needed, or simply let the state persist — the user returns to see the collapsed view.

**Acceptance criteria:**

- [ ] After reveal: "Hide answer ▲" button visible; clicking it hides the answer panel and re-shows the question
- [ ] After reveal: "Try again" link resets to `revealed = false, selected = null`
- [ ] Collapsed state: "Reveal again →" button re-expands the answer
- [ ] Collapsed state: previously selected option is shown as disabled selection (not interactive)
- [ ] Animation: reveal panel uses `animate-fade-up` (existing class); collapse is instant or uses `animate-fade-down` if that class exists
- [ ] `prefers-reduced-motion`: skip animation, apply state change immediately
- [ ] Keyboard: Tab order reaches all three affordances (Hide, Try again, Reveal again)
- [ ] ARIA: answer panel has `aria-expanded` on the container; collapse/expand toggles it

**Estimate:** 2 hours
**Files:** `src/components/learn/PredictionPrompt.tsx`
**Test:** Unit test: click Reveal, assert answer visible; click "Hide answer", assert answer hidden; click "Reveal again", assert answer visible again; click "Try again", assert returned to initial state

---

### Fix 5/6: AnalogyPanel — Pagination and General Items

**Problem (Issue 5 — corrected):** The `filtered` array includes `background === selectedBg || background === "general"`. This is a latent bug — if any analogy has `background: "general"`, it silently appears in every tab's rotation.

**Problem (Issue 6):** When `filtered.length === 1` (e.g., DevOps with 1 analogy), pagination controls are hidden by the `filtered.length > 1` guard. User sees no navigation affordance and cannot tell if content is missing.

**Expert rationale (UX Designer):** Single-item pagination should still show position context ("1 of 1") to reassure users no items are hidden. The "general" mixing behavior, if undocumented, is a bug waiting to surface.

**Implementation:**

1. **General items fix:** Add a "General" tab explicitly when `backgrounds.includes("general")` (or when any analogy has `background: "general"`). When "General" tab is selected, show only `background === "general"` items. Remove the `|| a.background === "general"` from the `filtered` expression in all tabs.

2. **Single-item pagination:** Render the pagination row when `filtered.length >= 1`. For single-item tabs, show "1 of 1" counter with disabled arrows (visible but non-interactive). This signals "there is exactly one analogy here" rather than "pagination is missing."

3. **Arrow disable states:** Change arrow buttons from wrap-around (currently `prev <= 0 → filtered.length - 1`) to bounded: `prev` button disabled at index 0, `next` button disabled at last index. Wrap-around is confusing in a short list.

**Acceptance criteria:**

- [ ] "General" analogies appear ONLY in a "General" tab, never mixed into other background tabs
- [ ] Pagination controls are visible for tabs with 1 item; arrows are disabled (not hidden)
- [ ] A "1 of 1" counter is shown for single-analogy tabs
- [ ] Prev arrow disabled at first item; Next arrow disabled at last item (no wrap-around)
- [ ] Switching background tabs resets index to 0 (existing behavior, no regression)
- [ ] If zero analogies match a background (edge case): tab does not render
- [ ] Mobile: pagination controls are touch-target sized (minimum 44x44 CSS px) per WCAG 2.5.5

**Estimate:** 1.5 hours
**Files:** `src/components/learn/AnalogyPanel.tsx`
**Test:** Unit test: render with 1 DevOps analogy, assert pagination row visible with disabled arrows; render with 1 general + 2 backend, assert General tab appears separately; assert backend tab shows only 2 items

---

### Fix 7: React Flow Exploration Sizing

**Problem:** `ExplorationWrapper` constrains the React Flow canvas to `height: 450px` on desktop and `350px` on tablet. When this is inside the `maxWidth: 800px` CardFlow container, the effective canvas is narrow. Nodes compress and overlap.

**Expert rationale (UI Developer):** React Flow requires a container with explicit dimensions. The current `window.innerWidth` listener is prone to SSR mismatch (initial `1024` default). A `ResizeObserver` on the container element is more accurate. Full-width treatment (breaking out of `maxWidth: 800px`) is the correct solution for exploration cards.

**Implementation:**

1. In `CardFlow.tsx`, for cards where `section.sectionType === "exploration"`, remove the `maxWidth: 800px` constraint. Allow exploration cards to span the full available width.

2. In `ExplorationWrapper.tsx`, replace the `window.innerWidth` + resize listener approach with a `ResizeObserver` on the wrapper `<div>`:

   ```typescript
   const containerRef = useRef<HTMLDivElement>(null);
   useEffect(() => {
     if (!containerRef.current) return;
     const ro = new ResizeObserver((entries) => {
       const width = entries[0].contentRect.width;
       setContainerWidth(width);
     });
     ro.observe(containerRef.current);
     return () => ro.disconnect();
   }, []);
   ```

3. Adjust height breakpoints: desktop (`width >= 768`): `500px`; tablet (`width >= 480`): `400px`; mobile: static fallback.

4. Mobile behavior (existing): static fallback message or `staticFallbackUrl` image. This sprint verifies this works correctly (see Test Plan §10).

**Mobile PoC acceptance criteria (Issue 10 scoped):** At viewport 375px × 812px (iPhone 14 portrait), the exploration card must either: (a) show the static fallback image if `staticFallbackUrl` is provided, or (b) show the "View on a larger screen" message with the section `description` text. It must NOT show a blank panel or a broken React Flow instance.

**Acceptance criteria:**

- [ ] Exploration cards break out of the `maxWidth: 800px` constraint in CardFlow
- [ ] `ResizeObserver` used instead of `window.innerWidth` polling
- [ ] Desktop (>= 768px): canvas height is 500px minimum
- [ ] Tablet (>= 480px): canvas height is 400px minimum
- [ ] Mobile (< 480px): static fallback shown — either image or descriptive text message
- [ ] No SSR hydration mismatch (initial render matches server render)
- [ ] `fitView` produces a centered, unclipped view on initial render

**Estimate:** 2 hours
**Files:** `src/components/learn/ExplorationWrapper.tsx`, `src/components/level/CardFlow.tsx`
**Test:** Unit test: mount ExplorationWrapper with a mock ResizeObserver, trigger resize to 400px, assert height changes to tablet value. E2E: navigate to exploration step, assert canvas height >= 400px

---

### Fix 8/9: D2 Diagram Rendering (Architecture and Decision Tree)

**Dependency:** Requires P0-3 (React Flow PoC) result.

**Problem:** `DiagramViewer` renders SVG at `min-width: 400px` inline. At 800px card width, complex SVGs (RAG Architecture, Decision Tree) have unreadable text. No zoom or expand affordance beyond "View full size" (opens new tab, breaks flow).

**Implementation depends on P0-3 outcome:**

**If PoC succeeds (React Flow decision tree is readable):**

Convert both Level 1 D2 sections to `exploration` type:

1. Author the RAG Architecture Overview as React Flow nodes/edges in `seed/chapter1-rag.json` (dagre layout)
2. Author the RAG vs Fine-Tuning Decision Tree as React Flow nodes/edges (top-down tree layout)
3. Change `section_type` from `d2_diagram` to `exploration` for both sections
4. `DiagramViewer.tsx` is NOT removed — it is still used by other levels; it receives a click-to-expand enhancement (see below)

**If PoC fails (React Flow decision tree is unreadable):**

Add click-to-expand modal to `DiagramViewer.tsx`:

1. Add `const [expanded, setExpanded] = useState(false)` state
2. Clicking the SVG container opens a `<dialog>` fullscreen overlay
3. Dialog shows the SVG at `width: 90vw, height: 85vh` with `overflow: auto`
4. Dialog has a close button and closes on Escape key (focus-trapped)
5. Replace "View full size" link with the click-to-expand trigger

**Regardless of PoC outcome, add to DiagramViewer:** A visible "Click to expand" hint below the diagram (the "View full size" link is too subtle and requires a tab switch).

**Acceptance criteria (if React Flow path):**

- [ ] Level 1 D2 sections (sort_order 6, 7) render as React Flow explorations
- [ ] All nodes and edge labels readable at 800px width without zooming
- [ ] `fitView` produces a complete, unclipped view on mount
- [ ] Decision tree branching is visually clear (left/right branches distinguishable)
- [ ] Seed data updated in `seed/chapter1-rag.json`

**Acceptance criteria (if modal path):**

- [ ] Clicking the diagram opens a fullscreen dialog
- [ ] Dialog shows full SVG at 90vw × 85vh
- [ ] Dialog closes on Escape key
- [ ] Focus is trapped inside dialog while open (WCAG 2.1 §2.1.2)
- [ ] Dialog has `role="dialog"` and `aria-label` matching the diagram title

**Estimate:** 2-3 hours (React Flow path adds seed data authoring time)
**Files:** `src/components/learn/DiagramViewer.tsx`, `seed/chapter1-rag.json` (if React Flow path), `src/components/learn/ExplorationWrapper.tsx` (no change needed)

---

## 7. Phase 2 — P2 Confusing / Misleading

Fixes for issues that confuse users but don't prevent use. Estimated 4-5 hours total.

Dependencies: Phase 0, Phase 1 complete.

---

### Fix 4 + Issue 4 Scope: Sidebar Step X of Y Indicator

**Problem:** Users perceive sidebar items as separate levels rather than steps within a level. The "In this level" header label is 10px, uppercase, low contrast. The progress counter is at the bottom of the sidebar, below the fold on short viewports.

**Fix (sidebar perception — NOT card reorder):** Add a prominent "Step X of Y" contextual indicator directly below the "In this level" header in `StepOutline.tsx`.

**Implementation:**

1. In `StepOutline.tsx`, in the header section (lines 284-302), add below the "In this level" label:
   ```tsx
   <p style={{ fontSize: "12px", color: accentColor, fontWeight: 600 }}>
     Step {Math.min(currentStep + 1, totalCount)} of {totalCount}
   </p>
   ```
2. The existing bottom progress bar (`X/Y` counter) remains as secondary reinforcement.
3. Consider adding a subtle "← within Level X" sub-label below the title in the card area (in `LevelPageClient` breadcrumb area, not the header).

**Note on card reorder (Issue 4 second part):** The user thought sidebar items were separate levels partly because the first card shown is a Pipeline Diagram — a complex visual — rather than a text orientation. Card reorder is addressed in Phase 3, Fix 9, using a learning-science-driven approach, not a blanket reversal.

**Acceptance criteria:**

- [ ] Sidebar shows "Step X of Y" prominently at top, updating as user navigates
- [ ] The label uses the chapter accent color to be visually connected to progress
- [ ] On mobile (sidebar hidden), the CardFlow "X of Y" counter in the bottom nav is sufficient
- [ ] Step counter reads "Step 1 of 12" not "Step 0 of 12" (1-indexed)

**Estimate:** 1 hour
**Files:** `src/components/level/StepOutline.tsx`
**Test:** Unit test: render StepOutline at step 3 of 12, assert "Step 4 of 12" text is present (1-indexed)

---

### Fix 10: Level Header — Context Sensitivity

**Problem:** The level header (title, subtitle, hook quote) is rendered in `page.tsx` as a server-side static block above `LevelPageClient`. It displays "What is RAG?" with its hook quote on every card, including cards 2-11 where the user is deep into exercises. The header feels disconnected.

**Expert rationale (UX Designer):** The hook quote serves its purpose on first arrival. After the user starts navigating, the header real estate is better used showing which section they are on. The solution is not to remove the header but to collapse it progressively.

**Implementation:**

Option A (server-only, simpler): Make the hook quote collapsible via CSS `details/summary` — the hook is inside a `<details open>` that the user can collapse. No client state needed.

Option B (client-aware, preferred): Pass `currentStep` from `LevelPageClient` up... but `page.tsx` is a Server Component and cannot receive client state. The header must move into `LevelPageClient` to be step-aware.

**Decision: Option B, move header into LevelPageClient.**

1. Extract the header JSX from `page.tsx` lines 289-412 into a new component `LevelHeader.tsx` at `src/components/level/LevelHeader.tsx`
2. Accept `currentStep` as a prop
3. When `currentStep === 0`: show full header (title + subtitle + hook quote) — same as current
4. When `currentStep > 0`: show compact header (title + level badge only, ~40px tall) — hook quote collapses with a smooth height transition
5. Pass `level`, `chapter`, `accentColor`, `currentStep`, `totalLevels` from `LevelPageClient` to `LevelHeader`
6. In `page.tsx`, pass the level/chapter data as props to `LevelPageClient`, which now renders the header internally

**Session persistence:** Use `sessionStorage` to remember if user has seen the hook quote. If they refresh, show it again on step 0.

**Returning user behavior:**

- Header state uses `sessionStorage` (per-tab, not cross-session)
- On fresh page load (new tab/session): header always starts expanded (full header with hook quote)
- On within-session navigation: header respects last-seen state (collapsed if user navigated past step 0)
- On browser refresh: sessionStorage persists, so header stays collapsed if it was collapsed
- On new session (cleared sessionStorage): header resets to expanded
- This prevents orientation loss for returning learners while preserving the collapse behavior within a session.

**Acceptance criteria:**

- [ ] On step 0: full header visible (title + subtitle + hook quote)
- [ ] On step 1+: compact header (title + level badge only, hook collapsed)
- [ ] Transition between states is smooth (height transition, not jump) and respects `prefers-reduced-motion`
- [ ] Header collapse does not cause layout shift that scrolls the card content
- [ ] Compact header remains sticky at top of viewport on desktop
- [ ] Breadcrumb navigation remains visible in both states

**Estimate:** 2 hours
**Files:** `src/app/chapters/[slug]/levels/[levelNum]/page.tsx`, `src/components/level/LevelPageClient.tsx`, new file `src/components/level/LevelHeader.tsx`
**Test:** Unit test: render LevelHeader at step=0, assert hook quote visible; at step=1, assert hook quote has collapsed class; E2E: navigate from step 0 to step 1, assert header shrinks

---

### Fix 11 (Systemic): All fixes in Phase 1/2 propagate to all levels

No additional work needed. All fixed components (`PipelineDiagram`, `PredictionPrompt`, `AnalogyPanel`, `ExplorationWrapper`, `DiagramViewer`) are shared. Once fixed in Phase 1, all levels benefit.

**Verification task:** After Phase 1 complete, navigate to Level 2 and Level 5 and verify pipeline/prediction components render correctly. Document in test plan.

---

## 8. Phase 3 — Learning Methodology

Content changes and new components for pedagogy improvements. Estimated 6-8 hours total.

Dependencies: Phase 0 (P0-1 content audit complete), Phase 1 and 2 complete.

---

### Fix L1/L2: Terminology Tooltips (GlossaryTooltip Component)

**Problem:** "768-dim", "vector", "embedding", "cosine similarity", "K chunks" appear in the Pipeline Diagram (step 1) before any definition. Users encounter expert terminology without human context.

**Expert rationale (Learning Scientist):** First-use tooltips should be more prominent; subsequent uses should be lightweight. A persistent glossary (accessible at any time) respects that learners may encounter terms out of order. Tooltips must not interfere with React Flow interaction (use portals).

**Scope for this sprint:** Level 1 terms only. The architecture is built for expansion.

**Terms dictionary (initial set for Level 1):**

- `vector` — A list of numbers that represents the "meaning" of a piece of text. Example: "cat" might become [0.2, 0.8, 0.1, ...]
- `embedding` — The process of converting text into a vector. Think of it as translating words into coordinates in a meaning-space.
- `cosine similarity` — How close two vectors are in direction. 1.0 = identical meaning, 0.0 = unrelated. Like measuring the angle between two arrows.
- `768-dim` / `1536-dim` — The number of numbers in a vector. More dimensions = more nuance captured. 768 is OpenAI ada-002; 1536 is text-embedding-3-small.
- `chunk` — A piece of text (usually a paragraph or page section) split from a larger document before embedding.
- `K chunks` — The top K most relevant chunks retrieved from the vector database. K is typically 3-10.
- `BM25` — A keyword search algorithm. Stands for "Best Match 25". Counts word frequency, ignores meaning.
- `backoff` — Falling back to a simpler method when the preferred method fails. In RAG: using keyword search when vector search returns low-confidence results.

**Implementation:**

1. Create `src/data/glossary.ts`:

   ```typescript
   export interface GlossaryTerm {
     definition: string; // plain English, max 2 sentences
     example?: string;   // optional "Think of it as..."
   }
   export const GLOSSARY: Record<string, GlossaryTerm> = { ... }
   ```

2. Create `src/components/learn/GlossaryTooltip.tsx`:
   - Accepts `term: string`, `children: ReactNode`
   - Renders `children` wrapped in a `<span>` with a subtle underline dotted style
   - On hover/focus: show a popover (rendered via `ReactDOM.createPortal` to `document.body`)
   - First-use detection: check `localStorage.getItem('aiquest_tooltip_seen')` (JSON set of terms)
   - First use: popover has accent border + "New term" badge; subsequent uses: lighter popover
   - Close on blur, click outside, Escape key
   - ARIA: `role="tooltip"`, `aria-describedby` on the trigger span

   **Mobile interaction model:**
   - Detect touch devices via `@media (hover: none)` or `'ontouchstart' in window`
   - Touch: tap on term to show tooltip; tap anywhere outside to dismiss
   - Terms are ALWAYS re-accessible — tapping/clicking a previously-seen term shows the tooltip again (lighter styling without "New term" badge)
   - First-use badge ("New term") shown only on first encounter per term
   - Tooltip remains accessible on demand for all subsequent uses — the "first-use only" constraint applies to the badge prominence, not tooltip availability

3. Mark terms in `MarkdownText.tsx` or in section content: Since MarkdownText renders arbitrary content, the cleanest approach for this sprint is to manually wrap terms in section content using a special syntax `[[term:vector]]` that `MarkdownText.tsx` parses and converts to `<GlossaryTooltip term="vector">vector</GlossaryTooltip>`. This requires a small parser addition to `MarkdownText.tsx`.

4. Add term annotations to Level 1 seed data Pipeline Diagram description fields and text section.

**Acceptance criteria:**

- [ ] `src/data/glossary.ts` exists with all 8 Level 1 terms defined
- [ ] `GlossaryTooltip.tsx` renders tooltip via portal (no z-index conflict with React Flow)
- [ ] First-use tooltip is visually more prominent than repeat-use tooltip
- [ ] Tooltip closes on Escape, blur, and click outside
- [ ] `prefers-reduced-motion`: tooltip appears immediately (no fade animation)
- [ ] ARIA: tooltip element has `role="tooltip"`, trigger has `aria-describedby` pointing to tooltip id
- [ ] Level 1 Pipeline Diagram step: "vector" and "embedding" are tooltip-annotated
- [ ] Level 1 text section: "cosine similarity", "K chunks", "backoff" are tooltip-annotated
- [ ] `[[term:X]]` syntax parsed in `MarkdownText.tsx`

**Estimate:** 3 hours
**Files:** `src/data/glossary.ts` (new), `src/components/learn/GlossaryTooltip.tsx` (new), `src/components/learn/MarkdownText.tsx`, `seed/chapter1-rag.json`
**Test:** Unit test: render GlossaryTooltip, hover trigger, assert tooltip text visible and has role="tooltip"; test first-use vs repeat-use rendering; test Escape closes tooltip

---

### Fix L3: Analogy Self-Containment Rewrites

**Problem:** Content audit (P0-1) will identify specific analogies that reference concepts from other levels. The known case is the B-tree analogy in the Backend tab, which references Vector Databases (Level 4).

**Expert rationale (Learning Scientist):** An analogy must be self-contained within the user's existing knowledge domain. It can assume: "you know SQL", "you know how Docker works", "you know what a build step is". It must not assume: "you know what a vector database is" (that's what this level is teaching).

**Implementation (after P0-1 audit):**

For each analogy flagged in the content audit:

1. Remove the forward reference from `bridgeText` and `breakPoint`
2. Rewrite using only concepts the user already knows from their named background
3. The new analogy must map to the same concept (`newConcept`) — only the familiar side changes

**Rewrite heuristic:** If the analogy contains the phrase "like [Level N concept]" or references a specific tool taught later, replace it with a more primitive concept from the same domain. Example: instead of "like a vector database index", use "like a Redis sorted set by score" (Backend domain, tool they likely know).

**Acceptance criteria:**

- [ ] All analogies flagged in `docs/content-audit-level1.md` are rewritten
- [ ] No analogy `bridgeText` or `breakPoint` references a concept from Levels 2-54
- [ ] Rewritten analogies reviewed against the original to verify they still map to the same `newConcept`
- [ ] Seed data updated in `seed/chapter1-rag.json`
- [ ] Content audit document updated to mark fixed items

**Estimate:** 1.5 hours
**Files:** `seed/chapter1-rag.json`, `docs/content-audit-level1.md` (update)
**Test:** Manual review: each rewritten analogy is read by a person unfamiliar with the later levels to verify it makes sense without prior context.

---

### Fix 9: Card Order — Pedagogy-Driven Reorder for Level 1

**Problem:** Current Level 1 sort order: Pipeline Diagram (1), Prediction (2), Text explanation (3). The user encounters jargon-heavy visual before any orientation text.

**Expert rationale (Learning Scientist):** The Predict-Instruct-Predict (PIP) pattern is pedagogically valid for users who have some baseline. For Level 1 users arriving with zero RAG context, the pipeline diagram front-loads jargon they cannot interpret. The fix is not to blanket-reorder all levels — PIP may be correct for Levels 2-11. Level 1 specifically needs an orientation text first.

**Proposed Level 1 sort order (after reorder):**

| sort_order | type        | title                                  | Rationale                                    |
| ---------- | ----------- | -------------------------------------- | -------------------------------------------- |
| 1          | text        | What is RAG?                           | Orient the user before showing any diagram   |
| 2          | prediction  | Predict: Keyword vs Semantic           | Now user has context to predict meaningfully |
| 3          | diagram     | The RAG Pipeline                       | Diagram now reinforces what they just read   |
| 4          | analogy     | RAG Concepts You Already Know          | Bridge after explanation                     |
| 5          | exploration | RAG Pipeline Data Flow                 | Interactive reinforcement                    |
| 6          | exploration | RAG Architecture Overview              | (Was d2_diagram, converted per Fix 8/9)      |
| 7          | exploration | RAG vs Fine-Tuning Decision Tree       | (Was d2_diagram, converted per Fix 8/9)      |
| 8          | prediction  | Predict: What Happens with Bad Chunks? | Deeper prediction after full context         |
| 9          | comparison  | Keyword Search vs Semantic Search      | Compare after understanding both             |
| 10         | callout     | Enterprise Skills Bridge               | Motivational close                           |
| 11         | prediction  | Predict: Updating Knowledge            | Final synthesis prediction                   |

**Decision note:** This reorder is LEVEL 1 ONLY. Levels 2-11 are not reordered in this sprint. The learning scientist's guidance is that PIP order is appropriate for users with domain background — only Level 1, which teaches foundational concepts, needs orientation-first ordering.

**Implementation:**

1. Update `sort_order` values in `seed/chapter1-rag.json` for Level 1 learn sections
2. Run seed script to update database
3. Verify CardFlow renders in new order

**Acceptance criteria:**

- [ ] Level 1 opens with the text explanation card, not the pipeline diagram
- [ ] sort_order values in seed data updated
- [ ] Database reflects new order after seed run
- [ ] No other level's sort_order is changed
- [ ] CardFlow, StepOutline, and page navigation all reflect new order

**Estimate:** 1 hour
**Files:** `seed/chapter1-rag.json`, run `npx tsx seed/seed.ts` (or equivalent seed command)
**Test:** E2E: load Level 1, assert first card title contains "What is RAG?" (text), assert second card is prediction type

---

## 9. Risk Register

| #   | Risk                                                                                                                             | Likelihood | Impact | Mitigation                                                                                                                                                                                                                                                                               |
| --- | -------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | React Flow decision tree PoC fails — dagre layout unreadable at 800px                                                            | Medium     | Medium | P0-3 is a gate before Fix 8/9. If PoC fails, fall back to zoom modal. Document in Decision A before Phase 1 begins.                                                                                                                                                                      |
| R2  | GlossaryTooltip portal conflicts with React Flow SVG layer z-index                                                               | Low        | Low    | Portal renders to `document.body`, above all stacking contexts. Test on the exploration step specifically. If conflict occurs, use a fixed-position tooltip instead of absolute.                                                                                                         |
| R3  | Moving LevelHeader into LevelPageClient breaks SSR/SEO (page.tsx is a Server Component)                                          | Medium     | High   | The header must remain in `page.tsx` as a Server Component for SEO (title, hook quote indexed). The solution: pass level/chapter data as serializable props to LevelPageClient, render the full header server-side on initial load, use a client wrapper only for the collapse behavior. |
| R4  | Seed data reorder (Fix 9) conflicts with user progress state in localStorage                                                     | Low        | Medium | `aiquest_state` in localStorage tracks progress by `levelId + stepIndex`. After reorder, step indices change. Clear progress state for Level 1 after seed update. Document in deployment notes.                                                                                          |
| R5  | ZERO test coverage — no regression safety net                                                                                    | High       | High   | Phase 0, Task P0-2 is mandatory. Any Phase 1 fix is paired with at least one unit test. No fix ships without its test. Acknowledge: tests are written alongside fixes, not before (no TDD baseline exists yet).                                                                          |
| R6  | `[[term:X]]` syntax in MarkdownText creates a parser maintenance burden                                                          | Low        | Low    | Keep the parser minimal: a single regex replace before markdown rendering. Document the syntax in a comment in MarkdownText.tsx. If it grows beyond 20 terms, migrate to a richer annotation format.                                                                                     |
| R7  | Analogy rewrite introduces new inaccuracies                                                                                      | Low        | Medium | Each rewritten analogy is verified: (1) maps to the same `newConcept`, (2) uses only domain-appropriate familiar concepts, (3) `breakPoint` is updated to reflect the new mapping.                                                                                                       |
| R8  | PipelineDiagram keyboard listener uses `window.addEventListener` without cleanup dependency array (line 193 — missing dep array) | High       | Low    | The `useEffect` at line 175-193 has no dependency array — it re-adds the listener on every render. This is a pre-existing bug. Fix as part of Fix 1/2: add `[]` dependency array and use `useCallback` for handlers.                                                                     |

---

## 10. Test Plan

### Test Framework

- **Unit tests:** Vitest + React Testing Library — set up in Phase 0 (P0-2)
- **E2E tests:** Playwright — set up in Phase 0 (P0-2)
- **Manual testing:** Required for visual/interaction checks not automatable

### Acceptance Gate

Before any Phase is considered complete:

1. All acceptance criteria checkboxes for every fix in the phase are checked
2. All unit tests for that phase pass (`npm run test`)
3. E2E smoke tests pass (`npm run test:e2e`)
4. Manual checklist below is walked through on desktop + mobile

### Unit Tests to Write (per fix)

| Fix       | Test case                           | What to assert                                                                                                                                                 |
| --------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fix       | Test case                           | Min Assertions                                                                                                                                                 |
| -----     | -----------                         | ----------------                                                                                                                                               |
| Fix 1     | `PipelineDiagramButtons.test.tsx`   | (a) Buttons render with Button component variant, (b) disabled state has aria-disabled, (c) Start button uses primary variant                                  |
| Fix 2     | `PipelineDiagramDone.test.tsx`      | (a) Click Done on last step → completion panel, (b) Reset → step = -1, (c) step sequence -1→0→...→n-1 correct, (d) no stale closure after useEffect fix        |
| Fix 3     | `PredictionPromptCollapse.test.tsx` | (a) Reveal → answer shown, (b) Hide answer → answer hidden, (c) Reveal again → answer shown, (d) Try again → initial state, (e) aria-expanded toggles          |
| Fix 5/6   | `AnalogyPanelGeneral.test.tsx`      | (a) 1 devops analogy → disabled arrows visible, (b) General tab appears separately, (c) Backend tab shows only backend items, (d) tab switch resets index      |
| Fix 7     | `ExplorationWrapperResize.test.tsx` | (a) 400px width → tablet height, (b) 800px → desktop height, (c) <480px → static fallback shown                                                                |
| Fix 4     | `StepOutlineCounter.test.tsx`       | (a) "Step 4 of 12" at step=3, (b) 1-indexed not 0-indexed, (c) updates on step change                                                                          |
| Fix 10    | `LevelHeaderCollapse.test.tsx`      | (a) step=0 → hook quote visible, (b) step=1 → collapsed, (c) transition respects prefers-reduced-motion                                                        |
| Fix L1/L2 | `GlossaryTooltip.test.tsx`          | (a) Hover → tooltip visible with role="tooltip", (b) Escape closes, (c) first-use badge shown, (d) repeat-use lighter styling, (e) tap trigger on touch device |
| Fix 9     | (E2E only)                          | First card title contains "What is RAG?"                                                                                                                       |

### E2E Tests to Write

| Test                                | Steps                                                                                              | Assertion                                                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `level1-navigation.spec.ts`         | Load `/chapters/rag-pipeline/levels/1`; click Next 3 times                                         | URL stays on level 1; step counter shows "4 of 12"; sidebar step 4 is active |
| `level1-card-order.spec.ts`         | Load Level 1; check first card                                                                     | Card title contains "What is RAG?" (text type)                               |
| `level1-prediction.spec.ts`         | Load Level 1; navigate to Prediction card; click an option; click "Reveal Answer"                  | Answer panel visible; "Hide answer" button visible                           |
| `level1-pipeline-done.spec.ts`      | Load Level 1; navigate to Pipeline card; click Start; click Next 4 times to reach Done; click Done | Completion panel visible; "Reset" button visible                             |
| `level1-analogy-tabs.spec.ts`       | Load Level 1; navigate to Analogy card; click "DevOps" tab                                         | Pagination shows "1 of 1"; prev/next arrows are disabled                     |
| `level1-exploration-size.spec.ts`   | Load Level 1 at 1280px viewport; navigate to Exploration card                                      | Canvas element height >= 400px                                               |
| `level1-mobile-exploration.spec.ts` | Load Level 1 at 375px viewport; navigate to Exploration card                                       | Static fallback text or image visible (not blank)                            |
| `level1-header-collapse.spec.ts`    | Load Level 1; observe header; click Next                                                           | Hook quote not visible on step 2                                             |

### Manual Test Checklist

Walk through this checklist on desktop (1280px) and mobile (375px) after each phase:

**Phase 1 Manual Checklist:**

- [ ] Pipeline buttons visually match design system (Button component style)
- [ ] Click "Done" on last pipeline step — completion panel appears, not dead end
- [ ] PredictionPrompt: reveal, collapse, reveal again, try again — all states work
- [ ] AnalogyPanel DevOps tab: shows "1 of 1" with disabled arrows
- [ ] AnalogyPanel Backend tab: arrows step through 4 items, disable at ends
- [ ] React Flow exploration card: canvas fills available width, nodes are not overlapping
- [ ] D2 diagram: either converted to React Flow (readable) or has expand affordance (zoom modal opens, closes on Escape)
- [ ] On mobile (375px): exploration card shows fallback, not blank panel

**Phase 2 Manual Checklist:**

- [ ] Sidebar "Step X of Y" label visible and updates when navigating
- [ ] Level header collapses to compact form after navigating away from step 0
- [ ] Level header collapse does not cause layout jump

**Phase 3 Manual Checklist:**

- [ ] Level 1 opens with text card (orientation first)
- [ ] Hovering "vector" in text section shows tooltip with plain-English definition
- [ ] First hover shows "New term" badge; second hover shows lighter tooltip
- [ ] Tooltip closes on Escape and click outside
- [ ] B-tree analogy (if rewritten) does not mention Vector Databases
- [ ] All analogy `breakPoint` texts verified self-contained

### Definition of Done

This sprint is complete when:

1. All acceptance criteria in Phases 0-3 are checked
2. All unit tests pass
3. All E2E tests pass
4. Manual checklists passed on desktop and mobile
5. Level 1 walk-through with a fresh user produces no "I'm stuck" moments
6. All seed data changes committed and re-seeded to production DB
7. PR merged and deployed to `https://quest.srinivaskotha.uk`

---

## Summary: Hour Estimates

| Phase     | Tasks                                                                 | Estimated Hours |
| --------- | --------------------------------------------------------------------- | --------------- |
| Phase 0   | P0-1 Content Audit, P0-2 Test Setup, P0-3 React Flow PoC              | 7 hours         |
| Phase 1   | Fix 1, 2, 3, 5/6, 7, 8/9                                              | 10 hours        |
| Phase 2   | Fix 4, 10                                                             | 3 hours         |
| Phase 3   | Fix L1/L2 (Tooltips), Fix L3 (Analogy rewrites), Fix 9 (Card reorder) | 6 hours         |
| **Total** |                                                                       | **~26 hours**   |

Sprint cadence recommendation: Phase 0 in one session (gated), Phase 1 over two sessions (fixes are independent after PoC), Phase 2 + Phase 3 in one session each.
