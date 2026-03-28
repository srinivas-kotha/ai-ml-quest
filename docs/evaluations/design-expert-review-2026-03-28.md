# Design Expert Review Panel — AI/ML Quest Redesign PRD

> Date: 2026-03-28
> Panelists: Senior UX Designer, Typography Director, Motion Design Lead, CRO Specialist
> Overall Verdict: CONDITIONAL APPROVE (16 must-fix items)

---

## Panel Summary

The PRD establishes a strong design direction — the navy-purple palette, gold accent pairing, and serif/sans typography split are all the right calls for an expert-level learning product. The panel's 16 must-fix items are refinements to an already solid foundation, not fundamental redirections.

---

## Expert 1: Senior UX Designer

**Verdict:** Conditional Approve

### Must Fix

1. **(C1) Reorder landing sections** — Current order leads with Value Props before showing the product. Chapters bento grid should appear immediately after the hero so users see _what_ they're learning before being sold on _why_. Revised order: Hero → Chapters Bento Grid → How It Works → Game Types → Value Props.

2. **(C2) Anonymous journey first** — Auth prompt on page load (or before any content) is a conversion killer for expert users. Level 1 of every chapter must be fully accessible without login. Auth prompt should appear only on first progress save, not on page load.

3. **(C3) WCAG muted text failure** — `--color-text-muted: #6b6b80` on `#1a1a2e` background fails WCAG AA (contrast ratio 3.2:1, minimum 4.5:1 required). Fix: bump to `#8a8aa8` (contrast 4.6:1, passes AA).

### Nice to Have

- Add "skip to content" link for keyboard navigation.
- Reduce hero stats row to 2 items (quality > quantity signal for expert audience).
- Consider "Resume where you left off" persistent banner for returning users (post-auth).

### What They Loved

- Bento grid layout for chapters — breaks "6 identical cards" anti-pattern effectively.
- 3D button press spec is the right call; Brilliant.org reference gives the team a clear target.
- Lock state spec (blur + dim + overlay) is polished. Most redesigns forget locked state.

---

## Expert 2: Typography Director

**Verdict:** Conditional Approve

### Must Fix

1. **(T2) Hero font clamp too large** — `clamp(56px, 7vw, 96px)` produces 96px on wide monitors. At 96px, DM Serif Display becomes poster text — impressive on a billboard, uncomfortable for 30 minutes of reading. Reduce max: `clamp(40px, 5.5vw, 88px)`. This still scales beautifully while staying comfortable.

2. **(T3) Progress bar overflow clip** — The spring overshoot animation (`cubic-bezier(0.34, 1.56, 0.64, 1)`) causes the fill to visually exceed 100% width before snapping back. The container needs `overflow: hidden` or the overshoot clips outside the bar chrome. Without this, the spring feels broken, not satisfying.

3. **(T4) `transition: all` is an anti-pattern** — Card hover uses `transition: all 200ms ease-out`. `transition: all` forces the browser to check ~300 CSS properties every frame. On lower-end hardware (Fire TV, older laptops), this causes jank. Replace with: `transition: transform 200ms ease-out, box-shadow 200ms ease-out, border-color 200ms ease-out`.

4. **(T1) Replace DM Serif Display with Instrument Serif** — DM Serif Display is a quality font but it has a flaw at the target use case: the italic variant is underwhelming. Instrument Serif (Google Fonts, same licensing, same weight) has a much more expressive italic that pairs beautifully with body copy. Critical for the hero treatment "AI/ML _Quest_" where the italic on "Quest" adds personality. Usage rule: Instrument Serif italic variant on hero "Quest" wordmark. Minimum size: 20px (below that, use DM Sans). Fallback stack: `'Instrument Serif', 'Garamond', 'Georgia', serif`.

### Nice to Have

- Consider `font-variant-numeric: oldstyle-nums` for the XP counter for a more editorial feel.
- Chapter card subtitle (14px DM Sans) at `letter-spacing: 0.01em` for a slightly more airy feel.
- Eyebrow standardize to `letter-spacing: 0.25em` (currently spec says `3px` which is an absolute value, not scalable).

### What They Loved

- Negative letter-spacing on display type (`-0.75px` at 48px+) — this is what separates intentional typography from generated content.
- DM Serif Display + DM Sans pairing: same family, opposites in style. Clean brief.
- The decision to NOT use Inter is the right call; this alone differentiates from 80% of dev tools.

---

## Expert 3: Motion Design Lead

**Verdict:** Approve with Fixes

### Must Fix

1. **(M1) Expand reduced-motion spec** — `prefers-reduced-motion` currently says "no animations." That's the wrong interpretation. The spec should be: disable stagger entrances, card lift, confetti, and XP counter roll. Simplify (not remove): opacity transitions become instant, progress fill becomes linear (no spring). Keep: 3D button press — it provides critical functional feedback for users who can't see subtle state changes.

2. **(M2) Radial glow mouse tracking: touch/coarse guard** — The hero background radial glow that tracks mouse position will fire constantly on touch devices where `pointermove` is generated by touch. On tablets, this drains battery and causes layout thrash. Gate initialization to: `window.matchMedia('(hover: hover) and (pointer: fine)')`. Fine pointer = mouse. Coarse pointer = touch/stylus.

3. **(M3) Confetti scale threshold** — Firing full confetti on every level completion is motivating at level 1 and annoying by level 10. Scale: 30% particle count on individual level completion, 100% on chapter completion. This preserves the delight moment for meaningful milestones.

### Nice to Have

- Add `will-change: transform` to chapter cards (only during hover, removed on mouseleave) to promote to GPU layer before lift begins.
- Level complete modal scale-in: consider `cubic-bezier(0.34, 1.56, 0.64, 1)` (same spring as progress bar) for visual consistency.
- XP counter: add `font-variant-numeric: tabular-nums` to prevent layout shift as numbers increase width.

### What They Loved

- 3D button press spec is excellent. The 80ms `ease-out` timing is exactly right for tactile response.
- Spring on progress bar (`cubic-bezier(0.34, 1.56, 0.64, 1)`) is a great choice — motivating overshoot then satisfying snap.
- Nav glass opacity increasing on scroll is well-specified. The detail about starting at 0.7 is important — too many specs just say "becomes opaque on scroll."

---

## Expert 4: CRO Specialist

**Verdict:** Conditional Approve

### Must Fix

1. **(CR1) Add social proof anchoring for the target audience** — Expert-level engineers are deeply skeptical of EdTech marketing. "Built for senior engineers" in the hero copy alone won't convert. Add a tech logo strip below the hero subtitle: "Built for engineers working with: [HuggingFace] [LangChain] [PyTorch] [Ollama] [pgvector]". These logos are instant credibility signals to the exact audience. No testimonials needed — tool recognition is enough.

2. **(CR2) Second CTA placement** — The bento grid is scroll depth ~800px on desktop. There's no CTA between the hero and that depth. Users who respond to the chapters content (visual learners, explorers) need a conversion point immediately below the bento grid. Add a second "Start Learning" CTA directly below the chapter grid.

3. **(CR3) Hero subtitle copy is too generic** — "Built for senior engineers who already know Python" sounds like every other dev tool. The unique value is the assumption of expertise. Sharpen: "The AI/ML course that doesn't start at 'what is a neural network.'" This is the negative sell — it qualifies out beginners and qualifies in experts in the same sentence. A/B variant: "53 levels. No hello world. No basics you already know."

### Nice to Have

- Add estimated time-to-first-win: "First level takes 8 minutes." Reduces activation hesitation.
- Consider a "Recently active" counter in the stats row ("127 engineers learning this week").
- Chapter lock state: show a preview of locked chapter content (blurred text snippet) rather than just the lock icon. Curiosity gap increases unlock motivation.

### What They Loved

- Stats row in hero (54 Levels | 5 Chapters | 8 Game Types) — specificity signals real product.
- Bento grid hierarchy: first chapter spanning 2 columns creates a visual entry point without telling users "start here."
- Gold CTA color choice — anchors conversion action to the same color as XP rewards. Subconscious association: gold = progress.

---

## Consolidated Action List

All 16 must-fix items. Priority: High = blocks quality bar, Medium = improves significantly.

| ID  | Item                                                                                       | Priority | Source      | Status  |
| --- | ------------------------------------------------------------------------------------------ | -------- | ----------- | ------- |
| C1  | Reorder landing sections: Hero → Chapters → How It Works → Game Types → Value Props        | High     | UX Designer | PENDING |
| C2  | Anonymous journey: Level 1 free, auth on first progress save only                          | High     | UX Designer | PENDING |
| C3  | Fix `--color-text-muted`: `#6b6b80` → `#8a8aa8` (WCAG AA pass)                             | High     | UX Designer | PENDING |
| T1  | Replace DM Serif Display with Instrument Serif (better italic, same license)               | High     | Typography  | PENDING |
| T2  | Hero H1 clamp: `clamp(56px, 7vw, 96px)` → `clamp(40px, 5.5vw, 88px)`                       | Medium   | Typography  | PENDING |
| T3  | Progress bar container: add `overflow: hidden`                                             | Medium   | Typography  | PENDING |
| T4  | Card hover: replace `transition: all` with explicit properties                             | High     | Typography  | PENDING |
| D1  | Eyebrow letter-spacing: standardize to `0.25em` (remove `3px` absolute)                    | Medium   | Typography  | PENDING |
| D2  | Font switch complete: all DM Serif Display refs → Instrument Serif                         | High     | Typography  | PENDING |
| D3  | Darken base bg: `#1a1a2e` → `#1c1535`, update full card tier delta                         | Medium   | Typography  | PENDING |
| M1  | Expand reduced-motion spec: disable list, simplify list, keep list                         | High     | Motion      | PENDING |
| M2  | Radial glow: gate init to `(hover: hover) and (pointer: fine)`                             | High     | Motion      | PENDING |
| M3  | Confetti scale: 30% on level complete, 100% on chapter complete                            | Medium   | Motion      | PENDING |
| CR1 | Add tech logo strip (HuggingFace, LangChain, PyTorch, Ollama, pgvector)                    | High     | CRO         | PENDING |
| CR2 | Add second "Start Learning" CTA below chapters bento grid                                  | High     | CRO         | PENDING |
| CR3 | Update hero subtitle: "The AI/ML course that doesn't start at 'what is a neural network.'" | High     | CRO         | PENDING |

---

## Panel Agreement: Light/Dark Mode

**Unanimous recommendation:** Implement both light and dark modes from the start.

The dark mode is well-designed. However, a significant portion of expert engineers (especially those in well-lit office environments or using laptops at outdoor venues) default to light mode. Shipping dark-only is a conversion barrier for that segment.

**Recommended approach:** Option C — System preference default, user override via toggle. The light mode should use a warm cream background (`#FAFAF7`) rather than clinical white. All chapter accent colors are verified to pass WCAG AA on both backgrounds.
