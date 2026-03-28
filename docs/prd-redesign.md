# AI/ML Quest — Visual Redesign PRD

> Status: Draft
> Author: Srinivas Kotha
> Created: 2026-03-28
> Source of Truth: docs/design-research.md

---

## 1. Problem Statement

The current AI/ML Quest looks like every generic dark AI template. Users say "by seeing it I feel not to learn" and "I hate this AI look theme." The design uses Inter font on near-black background (#09090b) with teal accents — indistinguishable from thousands of Tailwind dark mode demos.

The core failure: every design choice was the default. No choice signals intent. The result is a product that looks like it was built with a starter kit and never designed.

---

## 2. Design Direction

Inspired by Boot.dev (warm RPG feel) + Brilliant.org (playful seriousness) + DataCamp (dark navy premium). NOT another dark AI template.

**Positioning:** No EdTech platform today combines "enterprise/expert-level" with "warm and engaging." DataCamp is premium but cold. Boot.dev is engaging but junior-focused. AI/ML Quest v2 targets senior engineers — the design should feel like the intersection of O'Reilly books (authoritative) and a well-crafted game UI (engaging).

---

### 2.1 Color System

```css
/* Core backgrounds — navy-purple, NOT black */
--color-bg-primary: #1a1a2e; /* Body background — deep navy-purple */
--color-bg-surface: #25253e; /* Elevated cards and panels */
--color-bg-card: #2a2a45; /* Interactive cards */
--color-bg-card-hover: #32325a; /* Card hover state */
--color-bg-overlay: rgba(26, 26, 46, 0.8); /* Glass overlay */

/* Borders */
--color-border: rgba(255, 255, 255, 0.08);
--color-border-subtle: rgba(255, 255, 255, 0.04);

/* Text — warm white, not blue-white */
--color-text-primary: #f0f0f5;
--color-text-secondary: #a0a0b8;
--color-text-muted: #6b6b80;

/* Accents */
--color-accent-gold: #ffb800; /* Primary: XP, CTAs, achievements — knowledge signal */
--color-accent-teal: #00c9a7; /* Secondary: AI/ML concept signal */
--color-accent-error: #ff6b6b; /* Warm red, not harsh */
--color-accent-success: #4ade80; /* Green for correct answers */
```

**Rationale:** #1a1a2e is unmistakably navy-purple — it reads as a chosen color, not a default. Gold #FFB800 signals knowledge and achievement (Boot.dev, Codecademy all use yellow/gold). This is a complementary color pair (cool bg + warm accent) — strong visual identity.

---

### 2.2 Typography

| Role                     | Font             | Weight   | Source                |
| ------------------------ | ---------------- | -------- | --------------------- |
| Display / Hero           | DM Serif Display | 400      | Google Fonts (free)   |
| Chapter names            | DM Serif Display | 400      | Google Fonts (free)   |
| Section headings (h2-h3) | DM Serif Display | 400      | Google Fonts (free)   |
| Body text                | DM Sans          | 400, 500 | Google Fonts (free)   |
| UI elements / buttons    | DM Sans          | 500      | Google Fonts (free)   |
| Code blocks              | JetBrains Mono   | 400      | Existing — keep as-is |

**Letter-spacing rules:**

- Display type 48px+: `-0.75px`
- Headings 24-48px: `-0.5px`
- Body 16-24px: `0px` (default)
- UI / labels: `0.5px` to `1px` (slightly opened)

**Why DM Serif Display:** A serif display font for headings is the single most differentiating change we can make. Every competitor uses sans-serif headers. DM Serif Display has warmth without feeling academic or dated. It pairs naturally with DM Sans body text (same family, opposite styles).

**Why NOT Inter:** 80% of web apps use Inter. We cannot differentiate with it.

---

### 2.3 Layout

- **Max content width:** 1200px, centered with auto margins
- **Section spacing:** 80px between major sections, 40px between sub-sections
- **Card border-radius:** 16px (friendly and approachable — Codecademy standard)
- **Button border-radius:** 10px for primary, 8px for secondary

**Hub page grid (bento layout):**

```
[ Chapter 1 — 2 cols    ] [ Chapter 2 ]
[ Chapter 3 ] [ Chapter 4 ] [ Chapter 5]
[    Capstone — 2 cols                ]
```

First chapter and Capstone span 2 columns to create hierarchy. Middle chapters are equal-weight. This breaks the "6 identical cards in a row" anti-pattern.

---

### 2.4 Animations and Interactions

All timings use `ease-out` unless noted. No animations on users with `prefers-reduced-motion`.

**Card hover:**

```css
transform: translateY(-6px);
box-shadow: 0 20px 60px rgba(255, 184, 0, 0.15); /* gold glow */
border-color: rgba(255, 184, 0, 0.3);
transition: all 200ms ease-out;
```

**Page entrance (staggered fade-up):**

```css
/* Each element: opacity 0 → 1, translateY(24px → 0) */
/* 500ms ease-out, 60ms delay increment between elements */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**3D button press:**

```css
/* Normal state */
box-shadow: 0 4px 0 #cc9300; /* darker gold */

/* :active state */
box-shadow: 0 0 0 #cc9300;
transform: translateY(4px);
transition: all 80ms ease-out;
```

**Progress bar fill:**

```css
transition: width 800ms cubic-bezier(0.34, 1.56, 0.64, 1);
/* Overshoot spring: goes slightly past target, snaps back */
```

**XP counter roll-up:**

- `requestAnimationFrame` loop, 800ms total
- Number counts from `previousXP` to `newXP`
- Gold flash on completion: `box-shadow: 0 0 24px rgba(255, 184, 0, 0.6)` for 400ms

**Level complete:**

- `canvas-confetti` (~1KB gzipped) burst
- Modal: `scale(0.8) → scale(1)`, 300ms cubic-bezier spring
- Gold number flash on XP gain

**Nav glass effect on scroll:**

```css
/* Starts at opacity 0.7, increases to 0.95 as user scrolls */
background: rgba(26, 26, 46, var(--nav-bg-opacity));
backdrop-filter: blur(16px);
```

**Tab switch:** Crossfade 200ms opacity.

---

### 2.5 Component Design

#### Hero Section

```
[Eyebrow] INTERACTIVE LEARNING PLATFORM    ← gold, letterspacing 3px, 12px
[H1] AI/ML Quest                          ← DM Serif Display, 64-80px
[Subtitle] Built for senior engineers...  ← DM Sans 20px, text-secondary
[CTA row] [Start Free →] [View Syllabus]  ← 3D press primary, ghost secondary
[Stats] 54 Levels  |  5 Chapters  |  8 Game Types ← accent number, muted label
```

- Eyebrow: `DM Sans`, `#FFB800`, `letter-spacing: 3px`, `font-size: 12px`, `font-weight: 500`
- H1: `DM Serif Display`, `64px` desktop / `40px` mobile, `letter-spacing: -0.75px`
- CTA primary: gold bg, white text, 3D press shadow, `border-radius: 10px`
- Stats row: large number in gold (#FFB800), label in text-muted

#### Chapter Cards

Visual anatomy (top to bottom):

```
┌─────────────────────────────────────┐
│ ████ [faded chapter num in bg: 120px, opacity 0.04]
│                              [lock?]
│ [icon in colored circle]
│                        [progress ring SVG]
│ Chapter 1                           ← DM Serif Display, 22px
│ RAG Pipeline                        ← DM Sans, 14px, text-secondary
│ 12 levels  ·  ~3 hrs               ← text-muted, 12px
└─────────────────────────────────────┘
```

- Left border: 4px solid, chapter accent color
- Faded chapter number: `position: absolute`, `font-size: 120px`, `opacity: 0.04`, `pointer-events: none`
- Progress ring: SVG `circle` with `stroke-dasharray` animated fill
- Hover: `translateY(-6px)` + gold glow shadow + right arrow slides 4px right
- Lock state: `filter: blur(2px)`, card opacity 0.5, lock icon overlay

Chapter accent colors:

- Chapter 1 (RAG): `#3B82F6` (blue)
- Chapter 2 (Local SLM): `#8B5CF6` (purple)
- Chapter 3 (ML Monitoring): `#F59E0B` (amber)
- Chapter 4 (Fine-Tuning): `#10B981` (emerald)
- Chapter 5 (Multimodal): `#EC4899` (pink)
- Capstone: `#FFB800` (gold)

#### Landing Sections

**"What is this?" (Value props, 3 cards):**

- Glass bg on hover: `rgba(255,255,255,0.03)` + border opacity increase
- Icon: colored circle 48px, DM Serif Display title, DM Sans body

**"How it works" (3 steps):**

- Step number: large gold badge, 40px, DM Serif Display
- Step title: DM Serif Display 20px
- Connector: dashed line between steps (desktop only)

**"8 ways to learn" (game type grid, 2×4):**

- Each tile: icon (40px) + game type name
- Subtle hover: border brightens, icon scales 1.1
- Layout: CSS Grid, `grid-template-columns: repeat(4, 1fr)` desktop, 2 cols mobile

**Chapters bento grid:**

- As described in section 2.3 layout

#### Navigation

```
[AI/ML Quest]               [Sign In]  [Start Learning →]
```

- Height: 60px
- Background: `rgba(26, 26, 46, 0.8)` + `backdrop-filter: blur(16px)`
- Logo: `DM Serif Display`, warm white, NO gradient text
- Sign in: ghost button with `border: 1px solid rgba(255,255,255,0.2)`, gold border on hover
- CTA: gold bg, 3D press
- Sticky at top, background opacity increases with scroll

#### Level Page

**Hook (editorial pull-quote):**

```
┌─ [accent border 4px left] ─────────────┐
│ " The real problem with               │
│   hallucination isn't that...   "     │
│ — Level 1.1 · RAG Pipeline            │
└────────────────────────────────────────┘
```

- Large opening `"` glyph: DM Serif Display, 80px, gold, absolute positioned
- Quote text: DM Serif Display, 22px, text-primary
- Attribution: DM Sans, 12px, text-muted

**Learn panel:**

- Solid `--color-bg-surface` background (not glass — readability critical here)
- Content: DM Sans 16px, 1.6 line-height

**Game panel:**

- Background: `--color-bg-card`
- Top stripe: 4px solid, chapter accent color
- Game title: DM Sans 14px, text-muted, uppercase, letterspacing 1px
- Game content: varies by game type

**Key insight callout:**

```
┌─ [lightbulb icon] KEY INSIGHT ──────────┐
│ Content here...                        │
└────────────────────────────────────────┘
```

- Background: `rgba(255, 184, 0, 0.08)` (very subtle gold tint)
- Left border: 4px solid `#FFB800`
- Label: DM Sans 11px, gold, uppercase, letterspacing 1.5px

---

### 2.6 What We Are NOT Doing (Scope Boundaries)

| Item                 | Decision | Reason                                              |
| -------------------- | -------- | --------------------------------------------------- |
| Mascot/character     | No       | Too much design work for this sprint                |
| Custom font purchase | No       | DM Serif Display + DM Sans are free on Google Fonts |
| RPG inventory system | No       | Our XP + progress system stays as-is                |
| Light mode           | No       | Dark-only for now — but warm dark, not cold         |
| Figma designs first  | No       | Code-first, iterate in browser                      |
| Functional changes   | No       | This PRD is visual redesign only                    |
| New game types       | No       | All 8 existing game types unchanged                 |

---

## 3. Acceptance Criteria

### AC-1: Typography

- [ ] DM Serif Display loaded via `next/font/google` (or equivalent) and applied to: hero H1, chapter card titles, section headings (h2-h3), level page hook
- [ ] DM Sans loaded and applied to: body text, UI elements, buttons, labels
- [ ] JetBrains Mono retained for all code blocks
- [ ] Letter-spacing: `-0.75px` on 48px+ display type, `-0.5px` on 24-48px headings
- [ ] No Inter or Roboto rendered in the final page (verify via browser DevTools > Fonts)

### AC-2: Color System

- [ ] Body background renders as `#1a1a2e` (navy-purple — NOT #09090b or #111)
- [ ] Card backgrounds: `#25253e` (surface) → `#2a2a45` (card) → `#32325a` (hover)
- [ ] Primary CTA and XP numbers use gold `#FFB800`
- [ ] Chapter cards have chapter-specific 4px left border (6 distinct colors)
- [ ] No pure black (`#000`, `#111`, `#09090b`, `#0a0a0f`) anywhere in the rendered page

### AC-3: Layout

- [ ] All content constrained to max-width 1200px with `margin: 0 auto`
- [ ] Hub page renders bento grid (first chapter 2-col span, capstone 2-col span)
- [ ] All cards use 16px border-radius
- [ ] Section spacing: 80px between major sections, 40px between sub-sections

### AC-4: Animations

- [ ] Card hover: `translateY(-6px)` + gold glow shadow in 200ms
- [ ] Page elements entrance: staggered fade-up (60ms increment, 500ms duration)
- [ ] Primary CTA has 3D press effect (shadow shifts on :active, translateY(4px))
- [ ] Progress bars animate with spring overshoot (`cubic-bezier(0.34, 1.56, 0.64, 1)`)
- [ ] XP counter rolls up with requestAnimationFrame (800ms)
- [ ] Level complete triggers confetti + modal scale-in
- [ ] All animations respect `prefers-reduced-motion: reduce`

### AC-5: Components

- [ ] Hero: DM Serif Display title, gold eyebrow, gold CTA with 3D press, stats row
- [ ] Chapter cards: faded bg number, 4px accent left border, serif title, progress ring, hover lift + arrow slide
- [ ] Locked chapters: blurred + dimmed + lock icon overlay
- [ ] Nav: glass effect (blur 16px), serif logo, 60px height, opacity increases on scroll
- [ ] Landing sections: value props (3 cards), how it works (3 steps with gold numbers), game types grid (2×4)
- [ ] Level page: editorial hook pull-quote, solid learn panel, accent-stripe game panel, gold key insight callout

### AC-6: Responsiveness

- [ ] Mobile (< 640px): single column, hero H1 at 40px, stacked nav (hamburger or minimal)
- [ ] Tablet (640-1024px): 2-column card grid
- [ ] Desktop (1024px+): full bento layout, 3-4 column grids
- [ ] No horizontal scroll at any breakpoint

### AC-7: Performance

- [ ] Lighthouse Performance score > 85 on desktop
- [ ] Fonts loaded with `font-display: swap` (no invisible text during load)
- [ ] No Cumulative Layout Shift (CLS) > 0.1 from font loading
- [ ] Lazy-load below-the-fold heavy components

### AC-8: No Regressions

- [ ] All 8 game types render and accept input correctly
- [ ] Auth flow (sign in / sign up) still works
- [ ] Progress saving works (DB + localStorage)
- [ ] All 54 levels in all 5 chapters + capstone accessible
- [ ] XP system awards points correctly after level completion
- [ ] Level unlock logic unchanged

---

## 4. Sprint Plan

### Sprint 1: Foundation (~4 hours)

1. Update `next.config.js` / `layout.tsx` — add DM Serif Display + DM Sans via `next/font/google`
2. Replace `globals.css` CSS custom properties with new color system
3. Add typography scale classes (`.display`, `.heading`, `.body`)
4. Add animation keyframes and utility classes (fade-up, stagger)
5. Add 3D button press CSS
6. Add spring progress bar animation
7. Verify: `npm run build` passes, no TypeScript errors, no visual regressions on existing pages

**Commit gate:** Build passes, fonts render in browser, backgrounds are navy-purple (not black).

### Sprint 2: Hub Page Redesign (~3 hours)

1. Hero section (serif title, gold eyebrow, stats row, 3D CTA)
2. "What is this" value props section (3 cards, glass hover)
3. "How it works" steps section (gold step numbers)
4. Game types showcase (2×4 grid)
5. Chapter bento grid layout
6. Chapter card component (serif title, faded bg number, accent border, progress ring, hover lift)
7. Locked chapter state

**Commit gate:** Hub page matches AC-2 through AC-5 chapter cards. Mobile responsive.

### Sprint 3: Navigation + Chapter Page (~2 hours)

1. Nav component redesign (glass bg, serif logo, scroll opacity, 60px height)
2. Chapter page header (accent-colored, chapter title in serif)
3. Level list items redesign (consistent with chapter card style)
4. Breadcrumb styling

**Commit gate:** Nav renders correctly on all pages. Chapter page scrolls without issues.

### Sprint 4: Level Page + Learn Components (~3 hours)

1. Editorial hook pull-quote styling
2. Learn panel (solid surface bg, proper line-height)
3. Game panel (accent top stripe per chapter color)
4. Key insight callout (gold tint bg, gold border)
5. Code block styling (JetBrains Mono, subtle bg)
6. XP counter roll-up animation
7. Level complete confetti + modal

**Commit gate:** All 8 game types still function correctly. Level complete XP awards correctly.

### Sprint 5: Polish + Deploy (~2 hours)

1. Responsive breakpoints: test mobile 375px, tablet 768px, desktop 1440px
2. `prefers-reduced-motion` media query applied to all animations
3. Lighthouse Performance audit — fix anything below 85
4. Fix any visual regressions found in full game test
5. Update Docker image, deploy to production
6. Screenshot documentation (hub, chapter, level pages at 3 breakpoints)

**Commit gate:** Lighthouse > 85, all AC items checked off, deployed to production.

---

## 5. Team

| Role                  | Model  | Responsibility                                                                 |
| --------------------- | ------ | ------------------------------------------------------------------------------ |
| Architect / PRD owner | Opus   | PRD enforcement, acceptance criteria validation, quality gates between sprints |
| Frontend Agent        | Sonnet | Implementation — one sprint at a time, commits to feature branch               |
| Quality Reviewer      | Sonnet | Post-sprint visual + code review, checks AC items, flags regressions           |

Workflow: Architect reviews each sprint's output against acceptance criteria before approving the next sprint. No sprint starts until previous sprint's commit gate is met.

---

## 6. Risks and Mitigations

| Risk                                                   | Likelihood | Impact | Mitigation                                                              |
| ------------------------------------------------------ | ---------- | ------ | ----------------------------------------------------------------------- |
| DM Serif Display renders poorly at small sizes         | Medium     | Medium | Use DM Sans for anything under 20px; fallback: Instrument Serif         |
| Navy-purple #1a1a2e feels too saturated / gamey        | Low        | Medium | Test in browser first; if too saturated, desaturate to #1e1e2e          |
| 3D button press feels gimmicky                         | Low        | Low    | Use Brilliant.org as reference; if too much, reduce shadow depth to 2px |
| Redesign breaks game input (keyboard shortcuts, focus) | Medium     | High   | Full game test after EACH sprint, not just at end                       |
| Font loading causes Cumulative Layout Shift            | Medium     | Medium | `font-display: swap` + size fallback (ascent-override, etc.)            |
| Canvas-confetti adds meaningful bundle size            | Low        | Low    | It's ~1KB gzipped; non-issue                                            |
| Gold #FFB800 fails WCAG contrast on surface bg         | Low        | High   | Test: gold on #25253e = 5.8:1 (passes AA). Verify after implementation. |

---

## 7. References

- Design research: `docs/design-research.md`
- Current implementation: `src/` (Next.js / vanilla JS)
- PRD v2 (functionality): `docs/prd-v2.md`
- Execution plan: `docs/execution-plan.md`
- Live site: https://quest.srinivaskotha.uk
