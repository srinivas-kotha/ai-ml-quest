# UX Polish Sprint — Level Page Issues

> Created: 2026-03-30
> Status: PLANNING (needs grill + phase-evaluator before implementation)
> Context: User tested Level 1 after UX redesign (PR #47), found 11 issues + 3 learning methodology gaps

## User Feedback (Raw — 11 Issues)

### P1 — Broken / Unusable

**Issue 1: Pipeline diagram buttons look stale**

- Reset, Prev, Next, Done buttons have no styling — look like plain text
- Need modern button components matching the design system

**Issue 2: Pipeline "Done" button disabled on step 5**

- After reaching the last pipeline step, "Done" is grayed out with no handler
- User is stuck — no way to dismiss or proceed

**Issue 3: After "Reveal Answer" on prediction, no close/back**

- Once answer is revealed, the expanded state has no way to collapse or return
- Need a close/collapse button or auto-collapse on "Next" navigation

**Issue 5: Analogy arrows go to wrong content**

- Prev/next arrows below the analogy navigate to a DIFFERENT concept
- Expected: stay within the selected background tab (Backend/Frontend/DevOps)
- Actual: arrows cycle through ALL analogies regardless of tab selection

**Issue 6: DevOps tab has no prev/next arrows**

- Some backgrounds have fewer analogies than others
- When a background has only 1 analogy, no pagination shows — user thinks content is missing

**Issue 7: React Flow exploration (step 5) is tiny**

- React Flow is compressed into ~800px card width
- Nodes are barely visible, controls (zoom/pan) are squished
- Need full-width treatment or larger minimum height

**Issue 8: D2 Architecture diagram (step 6) is micro-sized**

- SVG renders at tiny size inside the card container
- Text in the SVG is unreadable without "View full size" click
- Need either: larger rendering, zoom capability, or replace with React Flow

**Issue 9: D2 Decision Tree (step 7) same micro-size issue**

- Same problem as Issue 8 — SVG too small in card width

### P2 — Confusing / Misleading

**Issue 4: Order confusion — Predict before Explain**

- Card 1: Pipeline Diagram, Card 2: Prediction Prompt, Card 3: "What is RAG?" text
- User thought each sidebar item was a separate LEVEL (not sections within Level 1)
- Header still says "What is RAG?" but first content shown is a pipeline diagram — disorienting

**Issue 10: "What is RAG?" header visible on ALL levels**

- The level header (title + hook quote) is ABOVE the CardFlow
- When user navigates steps, the header stays static — doesn't reflect current card
- User asked "what is the use of it?" — header feels disconnected from card content

**Issue 11: Issues repeat across all levels**

- All levels have the same pipeline/D2/React Flow sizing problems
- Systematic fix needed, not per-level patches

## Learning Methodology Gaps

**L1: Terms used before defined**

- "768-dim", "1536-dim", "vector", "embedding" appear in Pipeline Diagram (step 1) before the text explanation (step 3)
- User doesn't know what these mean yet — the Predict-Instruct-Predict order front-loaded too much jargon

**L2: Expert terminology without human context**

- "cosine similarity", "K chunks", "backoff" — presented as if user already knows them
- Need more "human-style" explanations: "Think of it as..." before the technical term

**L3: Cross-level references don't work**

- B-tree analogy in Level 1 references a concept explained in Level 4 (Vector Databases)
- Analogy should be self-contained — don't reference content the user hasn't seen yet

## Proposed Fixes

### Architecture Decision: Replace D2 Diagrams with React Flow

D2 static SVGs are unreadable at card width. Two options:

1. **Replace with React Flow** — interactive, zoomable, theme-aware (RECOMMENDED)
2. **Add zoom/expand modal** — click diagram to see full-size overlay

Decision: Replace D2 with React Flow for in-app display. Keep D2 files for documentation only.
(This aligns with the LOCKED diagram strategy in CLAUDE.md)

### Fix List (ordered by implementation)

1. **Fix analogy pagination** — arrows should cycle within selected background, not across all
2. **Fix PredictionPrompt** — add collapse/reset after reveal
3. **Fix PipelineDiagram buttons** — modern styled buttons, fix Done handler
4. **Replace D2 DiagramViewer with React Flow** — convert d2_diagram sections to exploration sections
5. **Fix React Flow sizing** — increase min-height, add full-width mode for exploration cards
6. **Simplify level header** — collapse or hide the hook quote after user starts navigating cards
7. **Add terminology tooltips** — first use of technical terms gets a hover tooltip with plain English
8. **Rewrite analogies for self-containment** — don't reference concepts from other levels
9. **Reorder cards** — move text explanation BEFORE first prediction (undo PIP for Level 1 at least)
10. **Mobile responsiveness audit** — test all fixes on mobile viewports

## Next Steps

1. Grill this plan with UX Designer + UI Developer + Learning Scientist
2. Run phase-evaluator pre-implementation
3. Implement in priority order (P1 first)
4. Test all 10 levels after each fix batch
5. Deploy + get user feedback again

## Files to Modify

- `src/components/learn/AnalogyPanel.tsx` — pagination fix (#5, #6)
- `src/components/learn/PredictionPrompt.tsx` — collapse after reveal (#3)
- `src/components/learn/PipelineDiagram.tsx` — button styling + Done handler (#1, #2)
- `src/components/learn/DiagramViewer.tsx` — may be removed if replaced by React Flow
- `src/components/learn/ExplorationWrapper.tsx` — sizing (#7)
- `src/components/level/CardFlow.tsx` — card width for exploration type (#7)
- `src/app/chapters/[slug]/levels/[levelNum]/page.tsx` — header behavior (#10)
- `seed/chapter1-rag.json` — card order, content rewrites (#4, L1-L3)
