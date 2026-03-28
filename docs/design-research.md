# AI/ML Quest — Design Research Findings

> Researched: 2026-03-28
> Purpose: Inform v2.0 visual redesign
> Status: Final — feeds directly into docs/prd-redesign.md

---

## Real Platform Analysis

### 1. Brilliant.org

| Property        | Value                                             |
| --------------- | ------------------------------------------------- |
| Mode            | Light-first                                       |
| Primary bg      | #FFFFFF (white)                                   |
| Surface         | Off-white, soft warm tones                        |
| Display font    | CoFo Brilliant (custom, geometric sans)           |
| Body font       | System / fallback sans                            |
| Signature color | Pear yellow-green #D8E82E for CTAs and highlights |
| Border radius   | Generous — 20px+ on cards                         |

**What makes it NOT generic:**

- Proprietary font "CoFo Brilliant" — nothing else on the web looks like it
- 3D press-down buttons (box-shadow shifts on click, feels physical)
- Koji mascot gives brand recognition and personality
- Iridescent gradient fills on feature cards (shift hue as you scroll)
- Max-width 1216px — content never stretches on widescreen

**What to steal:**

- 3D button press effect (box-shadow: 0 4px 0 darken(accent), translateY(4px) on :active)
- Iridescent card gradients for chapter showcase
- Max-width constraint with generous padding
- Large hero typography — feels like a printed textbook, not a web app

---

### 2. DataCamp

| Property     | Value                                                  |
| ------------ | ------------------------------------------------------ |
| Mode         | Dark                                                   |
| Primary bg   | #05192D (deep navy — NOT black, NOT generic dark)      |
| Surface      | #0a2540 (lighter navy)                                 |
| Display font | Studio-Feixen-Sans (tight tracking, contemporary feel) |
| Body font    | Studio-Feixen-Sans                                     |
| CTA color    | Electric green #03EF62 — used sparingly for CTAs only  |
| Text         | White cards on dark bg for contrast punch              |

**What makes it NOT generic:**

- #05192D is unmistakably "ocean deep navy," not the lazy #111111 or #0a0a0a
- Studio-Feixen-Sans has tight tracking (-0.5 to -1px) that signals "premium product"
- Electric green is ONLY used for conversion-critical actions — not decorative
- White card "float" on dark navy creates extreme contrast without harsh brightness

**What to steal:**

- Tinted dark background philosophy (pick a color, not gray)
- Reserve your boldest accent strictly for CTAs
- White surface cards on dark bg for premium feel
- Tight letter-spacing on headings

---

### 3. Boot.dev

| Property         | Value                                               |
| ---------------- | --------------------------------------------------- |
| Mode             | Dark warm                                           |
| Primary bg       | #252936 (warm purple-gray — the key differentiator) |
| Surface          | #2e3142                                             |
| Display font     | Arcuata (custom serif with RPG/medieval feel)       |
| Body font        | DM Sans                                             |
| Primary reward   | Yellow #efbb03 (XP, achievements)                   |
| Secondary accent | Cyan #42a0ed (links, info)                          |
| Atmosphere       | Radial glow behind cards (3-4 layers, subtle)       |

**What makes it NOT generic:**

- #252936 reads as "purple-gray" — completely unique tone in EdTech
- Arcuata serif in hero/chapter names feels like a fantasy RPG, not a coding bootcamp
- Radial gradient glow behind chapter cards (looks like light emanating from items)
- Yellow rewards trigger psychological association with "gold" and "achievement"
- RPG inventory / XP system treats learning like leveling up a character

**What to steal:**

- DM Sans as body font (clean, slightly rounded, not Inter)
- Warm purple-gray tinted dark bg (#252936 or similar)
- Yellow/gold for XP and achievement signals
- Radial card glow technique
- Serif display font for hero and chapter names

---

### 4. Codecademy

| Property      | Value                                             |
| ------------- | ------------------------------------------------- |
| Mode          | Deep purple dark                                  |
| Primary bg    | #3A10E5 (bold purple — used in hero, not full bg) |
| App bg        | Dark with purple tints                            |
| Display font  | Apercu (humanist, slightly warm, distinctive)     |
| Mono font     | Suisse International Mono                         |
| Accent        | Yellow #FFD300 (on dark purple = high contrast)   |
| Border radius | 16px                                              |

**What makes it NOT generic:**

- Deep saturated purple hero is unapologetically bold — you remember it
- Apercu humanist sans-serif has personality without being quirky
- Typing animation in hero (shows the actual content being typed) — functional, not gimmicky
- 16px border-radius on cards feels friendly and approachable
- Yellow on purple is a complementary color pair — strong visual identity

**What to steal:**

- 16px border-radius as the card standard
- Complementary color logic (warm accent on cool dark bg)
- Typing animation for showing code/questions in hero
- Humanist font with personality (not neutral)

---

### 5. Exercism

| Property       | Value                                         |
| -------------- | --------------------------------------------- |
| Mode           | Light                                         |
| Primary bg     | #FFFFFF                                       |
| Display font   | Poppins (rounded, friendly, slightly playful) |
| Body font      | Poppins                                       |
| Differentiator | SVG language icons (custom illustrated)       |
| Community      | "Mentored by humans" messaging                |

**What makes it NOT generic:**

- Custom SVG icon set for every programming language (brand recognition)
- Poppins' rounded letters feel human and inviting — opposite of "serious tech"
- Community-first language ("mentored by real humans") differentiates from automated courses

**What to steal:**

- Rounded font for approachability signal
- Custom iconography per subject (our 8 game types could each have a distinct icon style)
- Community/human framing in copy

---

### 6. Duolingo

| Property       | Value                                              |
| -------------- | -------------------------------------------------- |
| Mode           | White                                              |
| Primary bg     | #FFFFFF                                            |
| Brand color    | Duo Green #58CC02                                  |
| Shape language | Rounded everywhere — cards, buttons, illustrations |
| Core mechanic  | Streak — shown prominently on every page           |

**What makes it NOT generic:**

- Mascot (Duo the owl) is the most recognizable EdTech brand element
- Green is THE dominant color — unambiguous brand signal
- Rounded shapes create playful, non-intimidating feel
- Streak mechanic creates daily habit loop — visible, celebrated, guilt-inducing

**What to steal:**

- Streak as visible, celebrated mechanic (we have progress tracking, can surface streak)
- Rounded shape language (we already use border-radius — push it further on buttons)
- Single dominant brand color (we're splitting — reduce to one primary)

---

### 7. Sololearn

| Property         | Value                                         |
| ---------------- | --------------------------------------------- |
| Mode             | Light + optional dark                         |
| Light bg         | #f9f9fa                                       |
| Dark bg          | #1f1e28 (purple-tinted dark)                  |
| Body font        | Fira Sans                                     |
| AI sections font | Plus Jakarta Sans                             |
| Differentiator   | Purple-tinted dark mode (not black, not gray) |

**What makes it NOT generic:**

- #1f1e28 purple-tinted dark is noticeably different from neutral dark themes
- Two-font strategy (Fira Sans for content, Plus Jakarta for AI/modern sections)
- AI sections get distinct visual treatment — communicates "this is different tech"

**What to steal:**

- Purple-tinted dark bg (aligns with our navy-purple direction)
- Two-font strategy to signal different types of content
- Distinct visual language for AI/ML sections

---

## Key Patterns That Separate Stunning from Generic

### The 5 Differentiators Found Across All "Memorable" Platforms

1. **Custom or distinctive fonts (NOT Inter/Roboto)**
   - Brilliant: CoFo Brilliant (proprietary)
   - Boot.dev: Arcuata (custom serif, free)
   - Codecademy: Apercu (licensed)
   - The pattern: ANY font that isn't the top-10 Google Fonts default. DM Serif Display + DM Sans qualifies.

2. **Tinted dark backgrounds (navy, purple-gray, NOT pure black)**
   - DataCamp: #05192D (ocean navy)
   - Boot.dev: #252936 (warm purple-gray)
   - Sololearn: #1f1e28 (purple-tinted)
   - The pattern: Pick a HUE for your darkness. Pure black/dark gray says "I didn't choose."

3. **One unexpected bold accent color (not blue, not teal)**
   - Brilliant: Pear yellow-green #D8E82E
   - Boot.dev: Yellow #efbb03
   - DataCamp: Electric green #03EF62
   - Codecademy: Yellow #FFD300
   - The pattern: Yellow/gold signals "achievement" and "knowledge" — perfect for learning platforms.

4. **3D button interactions (not flat, not gradient)**
   - Brilliant: Box-shadow 3D press effect
   - The pattern: Physical button press feels tactile, memorable, fun — costs 3 CSS lines.

5. **Bento grid layouts with visual hierarchy**
   - Multiple platforms: Mix card sizes to create visual flow
   - The pattern: Never put 6 identical 1-col cards in a row. Vary sizes. Create rhythm.

### Typography Specifics

- Letter-spacing on display type: -0.75px to -1px at 48px+
- Letter-spacing on headings: -0.5px at 24-48px
- Body text: 0px letter-spacing (default)
- Line-height: 1.2 for display, 1.5 for body, 1.6 for long-form content

---

## MCP Design Tools Available

For implementation, these tools can accelerate component creation:

| Tool                     | MCP Name         | Best For                                  |
| ------------------------ | ---------------- | ----------------------------------------- |
| 21st.dev Magic           | `21st-dev-magic` | AI component generation from descriptions |
| shadcn/ui                | `shadcn-mcp`     | Pre-built accessible components           |
| Figma                    | `figma-mcp`      | Design-to-code export                     |
| @forgespace/branding-mcp | `branding-mcp`   | Design system token generation            |
| Flowbite                 | `flowbite-mcp`   | Tailwind component context                |

---

## Anti-Patterns to NEVER Do

These are the patterns that make every "dark AI app" look identical. Each one is banned from the redesign.

| Anti-Pattern                                 | Why It Fails                                       | What to Do Instead                                                         |
| -------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------- |
| Pure black `#000000` or `#111111` background | No character, reads as "default dark mode"         | Choose a tinted dark: navy `#1a1a2e`, purple-gray `#252936`, or deep slate |
| Inter as the only font                       | 80% of web apps use Inter. Zero differentiation.   | DM Serif Display for headings + DM Sans for body                           |
| Gradient borders as decoration               | Overused since 2022, now signals low effort        | Solid 1px borders at low opacity, or colored left-border accents           |
| Neon green on black                          | "Hacker aesthetic" from 2015                       | Warm gold on navy, or electric green ONLY for CTAs (DataCamp approach)     |
| Glassmorphism on everything                  | Blur+opacity loses readability, overused 2022-2023 | Use glass only on nav, nowhere else                                        |
| Same-size card grids with no hierarchy       | All content looks equally unimportant              | Bento layout with one large card, rest normal                              |
| Teal/cyan as primary accent on dark bg       | The AI template default — seen everywhere          | Gold/yellow for achievements, teal only as secondary                       |
| Gradient text on every heading               | Screams "bootstrap AI clone"                       | Plain warm white headings, accent for ONE word max                         |

---

## Competitive Positioning Summary

| Platform                  | Tone                   | Palette                    | Typography             | Memorable Element                  |
| ------------------------- | ---------------------- | -------------------------- | ---------------------- | ---------------------------------- |
| Brilliant.org             | Playful + serious      | White + pear yellow        | CoFo Brilliant         | 3D buttons + mascot                |
| DataCamp                  | Premium + professional | Deep navy + electric green | Studio-Feixen-Sans     | Tinted dark, minimal accents       |
| Boot.dev                  | RPG + engaging         | Purple-gray + yellow       | Arcuata serif          | XP/RPG system + warm bg            |
| Codecademy                | Bold + approachable    | Purple + yellow            | Apercu humanist        | Typing animation + 16px radius     |
| Exercism                  | Community + human      | White + purple             | Poppins rounded        | Mentored by humans angle           |
| Duolingo                  | Fun + habitual         | White + Duo Green          | Rounded sans           | Streak mechanic + mascot           |
| **AI/ML Quest v2 target** | **Expert + engaging**  | **Navy-purple + gold**     | **DM Serif + DM Sans** | **Gold achievements + bento grid** |

The gap in the market: no EdTech platform combines "enterprise/expert-level" with "warm and engaging." DataCamp is premium but cold. Boot.dev is engaging but junior-focused. AI/ML Quest v2 targets senior engineers — the design should feel like the intersection of O'Reilly books (authoritative) and a well-crafted game UI (engaging).
