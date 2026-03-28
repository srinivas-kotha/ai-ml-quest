# AI/ML Quest — Visual Redesign PRD

> Status: Updated — Expert Panel Reviewed 2026-03-28
> Author: Srinivas Kotha
> Created: 2026-03-28
> Updated: 2026-03-28 — Applied 16 expert panel findings + light/dark dual mode
> Source of Truth: docs/design-research.md
> Expert Review: docs/evaluations/design-expert-review-2026-03-28.md

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

#### Dark Mode Tokens (default)

```css
[data-theme="dark"] {
  /* Core backgrounds — saturated purple-navy, NOT black */
  --color-bg-primary: #1c1535; /* Body background — saturated purple-navy (D3: was #1a1a2e) */
  --color-bg-surface: #251e40; /* Elevated cards and panels */
  --color-bg-card: #2d2550; /* Interactive cards */
  --color-bg-card-hover: #362e5e; /* Card hover state */
  --color-bg-overlay: rgba(28, 21, 53, 0.9); /* Glass overlay */

  /* Borders */
  --color-border: rgba(255, 255, 255, 0.08);
  --color-border-subtle: rgba(255, 255, 255, 0.04);

  /* Text — warm white, not blue-white */
  --color-text-primary: #f0f0f5;
  --color-text-secondary: #a0a0b8;
  --color-text-muted: #8a8aa8; /* C3 FIX: was #6b6b80 (3.2:1 fail), now #8a8aa8 (4.6:1 WCAG AA pass) */

  /* Accents */
  --color-accent-gold: #ffb800; /* Primary: XP, CTAs, achievements — knowledge signal */
  --color-accent-teal: #00c9a7; /* Secondary: AI/ML concept signal */
  --color-accent-error: #ff6b6b; /* Warm red, not harsh */
  --color-accent-success: #4ade80; /* Green for correct answers */
  --color-code-bg: #1a1330;
}
```

**Card tier delta (D3):** Wide contrast steps between bg levels are intentional — primary → surface → card → hover spans 40+ lightness points so depth reads clearly without border reliance.

**Rationale:** `#1c1535` is more saturated than the original `#1a1a2e`, pushing further into purple-navy territory. Reads as a deliberate color choice, not a dark gray default. Gold #FFB800 signals knowledge and achievement (Boot.dev, Codecademy all use yellow/gold). Complementary pair (cool bg + warm accent) — strong visual identity.

---

### 2.2 Typography

| Role                     | Font             | Weight    | Source                |
| ------------------------ | ---------------- | --------- | --------------------- |
| Display / Hero           | Instrument Serif | 400, 400i | Google Fonts (free)   |
| Chapter names            | Instrument Serif | 400       | Google Fonts (free)   |
| Section headings (h2-h3) | Instrument Serif | 400       | Google Fonts (free)   |
| Body text                | DM Sans          | 400, 500  | Google Fonts (free)   |
| UI elements / buttons    | DM Sans          | 500       | Google Fonts (free)   |
| Code blocks              | JetBrains Mono   | 400       | Existing — keep as-is |

**Instrument Serif usage rules (D2):**

- Use italic variant on "Quest" in hero wordmark: AI/ML _Quest_
- Minimum size: Instrument Serif ≥ 20px only. Below 20px, use DM Sans.
- Fallback stack: `'Instrument Serif', 'Garamond', 'Georgia', serif`

**Letter-spacing rules (D1):**

- Display type 48px+: `-0.75px`
- Headings 24-48px: `-0.5px`
- Body 16-24px: `0px` (default)
- UI / labels: `0.25em` (standardized — do NOT use absolute `px` values for eyebrow/caps labels)

**Why Instrument Serif:** A serif display font for headings is the single most differentiating change we can make. Every competitor uses sans-serif headers. Instrument Serif has a particularly expressive italic variant — critical for the "AI/ML _Quest_" hero wordmark treatment. Pairs naturally with DM Sans body text.

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

All timings use `ease-out` unless noted.

**Reduced motion (M1):** Users with `prefers-reduced-motion: reduce` get:

- Disabled: stagger entrances, card lift (`translateY`), confetti, XP counter roll
- Simplified (not removed): opacity transitions become instant (0ms), progress fill uses linear (no spring)
- Kept: 3D button press (provides functional feedback — critical for users who can't see subtle state changes)

**Card hover (T4):**

```css
transform: translateY(-6px);
box-shadow: 0 20px 60px rgba(255, 184, 0, 0.15); /* gold glow */
border-color: rgba(255, 184, 0, 0.3);
/* T4 FIX: explicit properties only — transition:all checks ~300 CSS props per frame */
transition:
  transform 200ms ease-out,
  box-shadow 200ms ease-out,
  border-color 200ms ease-out;
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

**Progress bar fill (T3):**

```css
/* Container: T3 FIX — overflow:hidden required for spring overshoot animation */
/* Without this, the fill visually exceeds 100% width before snapping back */
.progress-bar-container {
  overflow: hidden;
}
.progress-bar-fill {
  transition: width 800ms cubic-bezier(0.34, 1.56, 0.64, 1);
  /* Overshoot spring: goes slightly past target, snaps back */
}
```

**XP counter roll-up:**

- `requestAnimationFrame` loop, 800ms total
- Number counts from `previousXP` to `newXP`
- Gold flash on completion: `box-shadow: 0 0 24px rgba(255, 184, 0, 0.6)` for 400ms

**Level complete (M3):**

- `canvas-confetti` (~1KB gzipped) burst — scale by milestone:
  - Individual level complete: 30% particle count
  - Chapter complete: 100% particle count (full burst)
- Modal: `scale(0.8) → scale(1)`, 300ms cubic-bezier spring
- Gold number flash on XP gain

**Nav glass effect on scroll:**

```css
/* Starts at opacity 0.7, increases to 0.95 as user scrolls */
background: rgba(28, 21, 53, var(--nav-bg-opacity));
backdrop-filter: blur(16px);
```

**Tab switch:** Crossfade 200ms opacity.

---

### 2.5 Component Design

#### Hero Section

```
[Eyebrow] INTERACTIVE LEARNING PLATFORM    ← gold, letter-spacing 0.25em, 12px
[H1] AI/ML Quest                          ← Instrument Serif, clamp(40px, 5.5vw, 88px)
[Subtitle] The AI/ML course that doesn't  ← DM Sans 20px, text-secondary
           start at 'what is a neural network.'
[CTA row] [Start Free →] [View Syllabus]  ← 3D press primary, ghost secondary
[Stats] 54 Levels  |  5 Chapters  |  8 Game Types ← accent number, muted label
[Logo strip] Built for engineers working with:
             [HuggingFace] [LangChain] [PyTorch] [Ollama] [pgvector]
```

- Eyebrow: `DM Sans`, `#FFB800`, `letter-spacing: 0.25em` (D1 fix — was `3px` absolute), `font-size: 12px`, `font-weight: 500`
- H1: `Instrument Serif`, `clamp(40px, 5.5vw, 88px)` (T2 fix — was `clamp(56px, 7vw, 96px)`, 96px was too large), `letter-spacing: -0.75px`
- H1 wordmark: use italic variant on "Quest": AI/ML _Quest_
- Subtitle (CR3): "The AI/ML course that doesn't start at 'what is a neural network.'"
  - A/B variant: "53 levels. No hello world. No basics you already know."
- CTA primary: gold bg, white text, 3D press shadow, `border-radius: 10px`
- Stats row: large number in gold (#FFB800), label in text-muted
- Tech logo strip (CR1): DM Sans 11px text-muted "Built for engineers working with:" + inline SVG logos for HuggingFace, LangChain, PyTorch, Ollama, pgvector. Opacity 0.6, increases to 1.0 on hover.

#### Chapter Cards

Visual anatomy (top to bottom):

```
┌─────────────────────────────────────┐
│ ████ [faded chapter num in bg: 120px, opacity 0.04]
│                              [lock?]
│ [icon in colored circle]
│                        [progress ring SVG]
│ Chapter 1                           ← Instrument Serif, 22px
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
- Icon: colored circle 48px, Instrument Serif title, DM Sans body

**"How it works" (3 steps):**

- Step number: large gold badge, 40px, Instrument Serif
- Step title: Instrument Serif 20px
- Connector: dashed line between steps (desktop only)

**"8 ways to learn" (game type grid, 2×4):**

- Each tile: icon (40px) + game type name
- Subtle hover: border brightens, icon scales 1.1
- Layout: CSS Grid, `grid-template-columns: repeat(4, 1fr)` desktop, 2 cols mobile

**Chapters bento grid:**

- As described in section 2.3 layout
- Second CTA (CR2): Place a "Start Learning →" CTA immediately below the chapters bento grid. Expert users who respond to the content (not the marketing) need a conversion point here before scrolling to How It Works.

#### Navigation

```
[AI/ML Quest]               [Sign In]  [Start Learning →]
```

- Height: 60px
- Background: `rgba(28, 21, 53, 0.8)` + `backdrop-filter: blur(16px)`
- Logo: `Instrument Serif`, warm white, NO gradient text
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

- Large opening `"` glyph: Instrument Serif, 80px, gold, absolute positioned
- Quote text: Instrument Serif, 22px, text-primary
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

### 2.6 Landing Page Section Order (C1)

The hub page sections render in this order. Do NOT reorder them — this sequence is optimized for expert-level conversion.

1. **Hero** — hook + social proof strip + first CTA
2. **Chapters Bento Grid** — show the product before selling it
3. **Second "Start Learning" CTA** — convert users who responded to the content
4. **How It Works** — 3-step process for skeptical users
5. **Game Types** — differentiation (8 ways to learn)
6. **Value Props** — "What is this?" for late-funnel users

Rationale (C1): Expert engineers evaluate content before committing. Leading with chapters (what they're buying) before "how it works" (marketing copy) respects their buying pattern.

### 2.7 Anonymous Journey (C2)

Expert users reject auth walls before they can see the product. Auth must not block content.

**What we ARE doing:**

- Level 1 of every chapter is fully accessible without authentication
- Auth prompt appears on first progress save, not on page load
- "Continue where you left off" prompt shown after Level 1 completion (natural conversion point)

**Implementation:**

- `localStorage` progress for anonymous users (no DB write)
- First progress save: show modal "Save your progress? Sign in or create account."
- Sign in is optional — users can continue anonymously with local storage only
- Auth prompt never appears earlier than first level completion

### 2.8 Light Mode (Added — C2 prerequisite, M2 prerequisite)

AI/ML Quest now supports both light and dark modes. Light mode was previously out of scope but is added here because:

1. Expert engineers in office environments frequently default to light mode (conversion barrier)
2. WCAG compliance is easier to maintain across both modes than to bolt on later
3. Mouse-tracking radial glow (M2) requires pointer capability check anyway — that's the only performance concern

**Light Mode Tokens:**

```css
[data-theme="light"] {
  --color-bg-primary: #fafaf7; /* warm cream, NOT clinical white */
  --color-bg-surface: #ffffff; /* pure white for cards */
  --color-bg-card: #ffffff; /* cards */
  --color-bg-card-hover: #f5f5f0; /* card hover */
  --color-bg-overlay: rgba(250, 250, 247, 0.9);
  --color-border: rgba(0, 0, 0, 0.08);
  --color-border-subtle: rgba(0, 0, 0, 0.04);
  --color-text-primary: #1a1a2e; /* navy text on light bg */
  --color-text-secondary: #4a4a5e;
  --color-text-muted: #8a8a9e;
  --color-accent-gold: #d4960a; /* slightly darker gold for contrast on white */
  --color-accent-teal: #0a9d8a; /* darker teal for contrast */
  --color-code-bg: #f0f0f0;
}
```

**Mode Toggle:**

- Default: `prefers-color-scheme` media query
- Override: `data-theme` attribute on `<html>`, persisted in `localStorage` key `aiquest_theme`
- Toggle: sun/moon icon button in TopNav (right side, before Sign In)
- Transition: `200ms` on `background-color, color, border-color` for smooth switch
- No flash of wrong theme: inline `<script>` in `<head>` reads `localStorage` before first paint

**All chapter accent colors verified WCAG AA on both backgrounds.** Gold `#FFB800` on `#FAFAF7` = 3.2:1 (use darker `#d4960a` for light mode, ratio 4.7:1 AA pass).

**Mouse-tracking radial glow (M2):** Initialize only when `window.matchMedia('(hover: hover) and (pointer: fine)').matches`. Fine pointer = mouse. Coarse = touch/stylus. Prevents battery drain on tablets.

---

### 2.9 Scope Boundaries

| Item                 | Decision | Reason                                              |
| -------------------- | -------- | --------------------------------------------------- |
| Mascot/character     | No       | Too much design work for this sprint                |
| Custom font purchase | No       | Instrument Serif + DM Sans are free on Google Fonts |
| RPG inventory system | No       | Our XP + progress system stays as-is                |
| Figma designs first  | No       | Code-first, iterate in browser                      |
| Functional changes   | No       | This PRD is visual redesign only                    |
| New game types       | No       | All 8 existing game types unchanged                 |

---

## 3. Acceptance Criteria

### AC-1: Typography

- [ ] Instrument Serif (with italic variant) loaded and applied to: hero H1, chapter card titles, section headings (h2-h3), level page hook
- [ ] Hero H1 uses italic variant on "Quest" wordmark: AI/ML _Quest_
- [ ] Instrument Serif used at ≥ 20px only; DM Sans used below 20px
- [ ] DM Sans loaded and applied to: body text, UI elements, buttons, labels
- [ ] JetBrains Mono retained for all code blocks
- [ ] Letter-spacing: `-0.75px` on 48px+ display type, `-0.5px` on 24-48px headings
- [ ] Eyebrow/caps labels use `letter-spacing: 0.25em` (not absolute `px`)
- [ ] No Inter or Roboto rendered in the final page (verify via browser DevTools > Fonts)

### AC-2: Color System

- [ ] Dark mode: body background renders as `#1c1535` (saturated purple-navy — NOT #09090b or #1a1a2e)
- [ ] Dark mode: card backgrounds: `#251e40` (surface) → `#2d2550` (card) → `#362e5e` (hover)
- [ ] Dark mode: muted text renders as `#8a8aa8` (was `#6b6b80`, which failed WCAG AA)
- [ ] Light mode: body background renders as `#fafaf7` (warm cream — NOT pure white `#ffffff`)
- [ ] Light mode: card backgrounds use pure `#ffffff` with warm hover `#f5f5f0`
- [ ] Light mode: gold accent uses `#d4960a` (darker for contrast on light bg)
- [ ] Primary CTA and XP numbers use gold (#FFB800 dark / #d4960a light)
- [ ] Chapter cards have chapter-specific 4px left border (6 distinct colors, verified on both bg modes)
- [ ] No pure black (`#000`, `#111`, `#09090b`, `#0a0a0f`) anywhere in the rendered page

### AC-3: Layout

- [ ] All content constrained to max-width 1200px with `margin: 0 auto`
- [ ] Hub page renders bento grid (first chapter 2-col span, capstone 2-col span)
- [ ] Section order: Hero → Chapters Bento Grid → second CTA → How It Works → Game Types → Value Props
- [ ] All cards use 16px border-radius
- [ ] Section spacing: 80px between major sections, 40px between sub-sections

### AC-4: Animations

- [ ] Card hover: `translateY(-6px)` + gold glow shadow in 200ms, using explicit transition properties (no `transition: all`)
- [ ] Page elements entrance: staggered fade-up (60ms increment, 500ms duration)
- [ ] Primary CTA has 3D press effect (shadow shifts on :active, translateY(4px))
- [ ] Progress bar container has `overflow: hidden` to contain spring overshoot
- [ ] Progress bars animate with spring overshoot (`cubic-bezier(0.34, 1.56, 0.64, 1)`)
- [ ] XP counter rolls up with requestAnimationFrame (800ms)
- [ ] Level complete triggers confetti (30% count) + modal scale-in; chapter complete triggers full confetti (100%)
- [ ] Reduced motion: stagger/card lift/confetti/XP roll disabled; opacity instant; progress linear; 3D press kept
- [ ] Mouse-tracking radial glow initializes only when `(hover: hover) and (pointer: fine)` matches

### AC-5: Components

- [ ] Hero: Instrument Serif title with italic "Quest", gold eyebrow at `0.25em` spacing, gold CTA with 3D press, stats row, tech logo strip (HuggingFace/LangChain/PyTorch/Ollama/pgvector)
- [ ] Hero subtitle: "The AI/ML course that doesn't start at 'what is a neural network.'"
- [ ] Chapter cards: faded bg number, 4px accent left border, serif title, progress ring, hover lift + arrow slide
- [ ] Second "Start Learning" CTA appears immediately below chapters bento grid
- [ ] Locked chapters: blurred + dimmed + lock icon overlay
- [ ] Nav: glass effect (blur 16px), serif logo, 60px height, opacity increases on scroll, light/dark toggle (sun/moon)
- [ ] Landing sections in order: chapters grid → how it works → game types → value props
- [ ] Level page: editorial hook pull-quote, solid learn panel, accent-stripe game panel, gold key insight callout

### AC-9: Light/Dark Mode

- [ ] System preference (`prefers-color-scheme`) detected and applied on first load
- [ ] `data-theme` attribute on `<html>` drives all color tokens
- [ ] Toggle (sun/moon) in nav switches mode with 200ms transition on `background-color, color, border-color`
- [ ] Preference persisted in `localStorage` key `aiquest_theme`
- [ ] No flash of wrong theme on page load (inline script in `<head>` reads localStorage before first paint)
- [ ] All chapter accent colors pass WCAG AA on both backgrounds
- [ ] Code blocks readable in both modes

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

1. Update font loading — add Instrument Serif (with italic) + DM Sans via Google Fonts
2. Replace CSS custom properties with new color token system (both `[data-theme="dark"]` and `[data-theme="light"]`)
3. Add theme toggle logic: inline `<script>` in `<head>` for no-flash, `data-theme` attribute, localStorage persistence
4. Add sun/moon toggle button to TopNav
5. Add typography scale classes (`.display`, `.heading`, `.body`)
6. Add animation keyframes and utility classes (fade-up, stagger)
7. Add 3D button press CSS
8. Add spring progress bar animation
9. Verify: `npm run build` passes, no TypeScript errors, no visual regressions on existing pages

**Commit gate:** Build passes, fonts render in browser, backgrounds are navy-purple (not black).

### Sprint 2: Hub Page Redesign (~4 hours)

1. Hero section: serif title with italic "Quest", gold eyebrow at `0.25em`, stats row, 3D CTA
2. Hero subtitle: "The AI/ML course that doesn't start at 'what is a neural network.'"
3. Tech logo strip below subtitle (HuggingFace, LangChain, PyTorch, Ollama, pgvector)
4. Chapter bento grid layout (sections ordered per §2.6: Chapters first)
5. Chapter card component (serif title, faded bg number, accent border, progress ring, hover lift)
6. Second "Start Learning" CTA immediately below chapters bento grid
7. "How it works" steps section (gold step numbers)
8. Game types showcase (2×4 grid)
9. "What is this" value props section (3 cards, glass hover)
10. Locked chapter state

**Commit gate:** Hub page matches AC-2 through AC-5 chapter cards. Section order matches §2.6. Mobile responsive.

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
| Instrument Serif renders poorly at small sizes         | Medium     | Medium | Enforced: ≥ 20px only rule in spec; DM Sans for everything smaller      |
| Navy-purple #1c1535 feels too saturated / gamey        | Low        | Medium | Test in browser first; if too saturated, desaturate to #1a1a2e          |
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
