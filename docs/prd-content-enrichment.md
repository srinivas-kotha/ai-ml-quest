# AI/ML Quest — Content Enrichment PRD

> Status: LOCKED — Expert Panel Reviewed 2026-03-28 (3.84/5.00 CONDITIONAL PASS)
> Expert Panel: 6 experts (LX Designer, Curriculum Architect, Visual Expert, Gamification, ML Engineer, Frontend Engineer)
> Must-fix items: 4 P1 resolved, 8 P2 incorporated
> Author: Srinivas Kotha
> Created: 2026-03-28
> Source: deep-research visual-learning-engagement-technical-education (40+ sources)

---

## 1. Problem Statement

AI/ML Quest teaches correctly but doesn't engage deeply. Three specific failures:

1. **Domain barrier**: Content assumes backend/DB knowledge ("B-tree index", "O(log n)"). A frontend engineer or data analyst hits a wall at Level 1.
2. **Visual poverty**: 54 levels, but only 2 visual component types (PipelineDiagram, AnnotatedCode). Most learning is walls of text.
3. **Boredom risk**: Same pattern repeats — read text → play quiz → next level. No surprise, no variety, no "I want to see what's next."

### Who we're losing

| Engineer Type | What they know         | Where they get stuck                      | What would help                                                                                   |
| ------------- | ---------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Frontend dev  | React, CSS, APIs       | "Vector database", "embedding dimensions" | Analogy: "It's like a search index, but for meaning instead of keywords"                          |
| Data engineer | SQL, ETL, pipelines    | "LoRA rank", "attention heads"            | Analogy: "Think of it like a database view — a lightweight overlay on the base table"             |
| DevOps/SRE    | Infra, monitoring, K8s | "Fine-tuning vs RAG", "GGUF quantization" | Analogy: "It's like choosing between a custom Docker image (fine-tune) vs a sidecar config (RAG)" |
| Full-stack    | Everything at surface  | Depth on any ML topic                     | Interactive exploration: "Change this slider and watch what happens"                              |

---

## 2. Design Principles

### P1: "Evolve, Don't Restart"

Never teach from scratch. Map every AI/ML concept to something the engineer already knows. The Enterprise Skills Bridge pattern already exists — make it visual and primary, not a callout box.

### P2: "Show, Then Tell"

Every concept gets a visual BEFORE the text explanation. Brilliant.org's key insight: let the learner see the mechanism working, THEN explain why. Not the other way around.

### P3: "Graduate the Analogy"

Start with metaphor → reveal the real mechanism → show where the analogy breaks. This is how experts actually learn — they build on prior models and then refine them.

### P4: "Variety is Anti-Boredom"

Never repeat the same interaction pattern more than 3 times in a row. Cycle between: reading → interactive exploration → quiz → building → diagnosis. (Research: engagement drops 40% after 4 identical interaction types.)

### P5: "Every Visual is Tracked"

No visual asset exists only in one place. Source diagrams live in Git (D2/Mermaid/React components). Generated images are stored with metadata. Everything is reproducible.

### 2.6 Per-Level Scaffolding Template

Every level follows this 5-step learning sequence (from cognitive science research):

1. **Activate Prior Knowledge** (30s) — Visual analogy panel: "You already know X, this is like Y"
2. **Visual Exploration** (2-3 min) — Interactive React Flow exploration OR annotated diagram. Includes prediction prompt: "Before we explain — what do you think happens next?"
3. **Guided Explanation** (3-5 min) — LearnPanel with text + callouts + code examples
4. **Practice** (3-5 min) — Game type matched to the concept (quiz, builder, debugger, etc.)
5. **Transfer** (30s) — Key Insight callout: "Now apply this to YOUR stack"

**Prediction prompts** (P1 fix from LX Designer): Every exploration includes at least one "What do you think?" moment where the learner predicts an outcome before seeing it. Track prediction accuracy — if it jumps from <50% to >80% within 3 interactions, that's an "aha moment."

### 2.7 Visual Style Guide

All diagrams — regardless of tool — follow one visual language:

| Element         | Dark Mode                          | Light Mode                       |
| --------------- | ---------------------------------- | -------------------------------- |
| Node background | var(--color-bg-card) #2d2550       | var(--color-bg-card) #ffffff     |
| Node border     | var(--color-border)                | var(--color-border)              |
| Active node     | var(--color-accent-gold) #ffb800   | var(--color-accent-gold) #d4960a |
| Edge/arrow      | var(--color-text-muted) #8a8aa8    | var(--color-text-muted) #8a8a9e  |
| Label text      | var(--color-text-primary)          | var(--color-text-primary)        |
| Background      | var(--color-code-bg)               | var(--color-code-bg)             |
| Chapter accent  | Chapter-specific color (6 defined) | Same                             |

**Typography in diagrams:** DM Sans for labels, JetBrains Mono for code. Minimum 12px.
**Border radius:** 12px for nodes, 8px for badges.
**Icon style:** Outline icons, 1.5px stroke, matching text-muted color.

Napkin AI prompts must include: "Use navy-purple (#1c1535) and gold (#ffb800) color scheme, clean modern style, no gradients, rounded corners."
D2 files use the `dark-mauve` theme with custom overrides to match.

### 2.8 Analogy Quality Framework

Every analogy must pass this checklist before shipping:

- [ ] **Structural mapping is correct** — the relationship between parts maps accurately, not just surface similarity
- [ ] **Break points are explicit** — "This analogy breaks when..." is stated in the graduation section
- [ ] **Tested with 2+ engineer types** — a frontend dev AND a backend dev can follow it
- [ ] **ML expert reviewed** — no harmful misconceptions created
- [ ] **Background-selectable** — at minimum 2 variants (frontend-friendly, backend-friendly)

**Bad analogy example:** "LoRA is like a database view" — views don't modify tables, but LoRA modifies weights. Structural mapping is WRONG.
**Good analogy example:** "LoRA is like a CSS override stylesheet — it layers targeted changes on top of the base styles without rewriting the original file. The 'rank' is how many override rules you're allowed."

### 2.9 Mobile Fallback Strategy

React Flow explorations have minimum viewport 768px for full interactivity.

| Viewport            | Experience                                                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Desktop (1024px+)   | Full React Flow — drag, click, expand                                                                                  |
| Tablet (768-1024px) | React Flow with reduced controls — click only, no drag                                                                 |
| Mobile (<768px)     | Static annotated diagram (auto-generated screenshot of the exploration with numbered callouts) + step-through carousel |

Implementation: `<ExplorationWrapper>` component detects viewport and renders appropriate version.

---

## 3. What to Build

### 3.1 Interactive Explorations (React Flow)

Replace static PipelineDiagram with **interactive React Flow explorations** where learners can:

- Click nodes to expand details
- Drag to rearrange and understand data flow
- Toggle parameters and see results change
- Step through a pipeline execution in real-time

**Priority explorations (one per chapter):**

| Chapter         | Exploration               | What the learner manipulates                                                                            |
| --------------- | ------------------------- | ------------------------------------------------------------------------------------------------------- |
| Ch1 RAG         | RAG Pipeline Flow         | Drag query → embedding → vector search → LLM → response. Click each node to see real data at that stage |
| Ch2 SLM         | Quantization Tradeoff     | Slider: precision (FP32 → Q4) shows model size, speed, quality score changing in real-time              |
| Ch3 Monitoring  | Drift Dashboard           | Interactive metrics dashboard — change "days since deploy" slider, watch drift scores change            |
| Ch4 Fine-Tuning | LoRA Injection Visualizer | See where LoRA adapters attach to a transformer. Toggle rank, watch parameter count change              |
| Ch5 Multimodal  | Latency Budget Calculator | Allocate ms budget across ASR → LLM → TTS pipeline. See total latency and quality tradeoffs             |

**Implementation**: React Flow (XyFlow) library. Custom node components. Data from DB `quest_learn_sections` with `sectionType: "exploration"`.

### 3.2 Visual Analogies System

Every technical concept gets a **visual analogy panel** that bridges from known → unknown:

```
┌─────────────────────────────────────────────────┐
│ 💡 You Already Know This                        │
│                                                 │
│ [Visual: familiar concept]  →  [Visual: AI/ML]  │
│                                                 │
│ "A vector database is to semantic search         │
│  what a B-tree index is to SQL WHERE clauses.    │
│  Same job — find relevant data fast —            │
│  different data type."                           │
│                                                 │
│ [🎓 See the real mechanism →]                    │
└─────────────────────────────────────────────────┘
```

**Implementation**: New learn section type `"analogy"` with fields:

- `familiarConcept`: what they already know (with icon/visual)
- `newConcept`: what we're teaching (with icon/visual)
- `bridgeText`: the connecting explanation
- `graduationLink`: link to deeper explanation

**Content**: Write 3-5 analogies per chapter targeting different engineering backgrounds.

### 3.3 Napkin AI Generated Diagrams

Use the `napkin-ai` skill to generate educational diagrams for:

- Architecture comparison visuals (RAG vs Fine-tuning vs Prompt Engineering)
- Decision trees ("Which approach should I use?")
- Process flows (data ingestion → chunking → embedding → indexing)
- Concept maps (relationships between techniques)

**Storage**: Generated images → Cloudflare R2 (free 10GB, zero egress). Metadata → Postgres `quest_visual_assets` table. Source prompts → Git-tracked `content/diagram-prompts/`.

### 3.4 D2 Architecture Diagrams

Use the `d2-diagrams` skill for:

- System architecture diagrams (how RAG fits in a production stack)
- Comparison layouts (side-by-side pattern evaluation)
- Deployment topology diagrams

**Storage**: D2 source files in Git (`content/diagrams/*.d2`). Rendered SVGs in `public/diagrams/` or R2.

### 3.5 Engagement Patterns

**Learning Arc Templates** (replaces rigid variety cycling):

| Arc           | Pattern                                  | Best for                                  |
| ------------- | ---------------------------------------- | ----------------------------------------- |
| **Discovery** | Exploration → Quiz → Matcher → Insight   | New concepts (Ch1 Level 1, Ch2 Level 1)   |
| **Deep Dive** | Text → Code → Debugger → Tuner           | Technical depth (LoRA math, quantization) |
| **Applied**   | Diagnosis → Builder → Optimizer → Battle | Production skills (monitoring, cost)      |
| **Capstone**  | Battle → Builder → Optimizer → Gauntlet  | Chapter-end boss battles                  |

Each chapter uses 2-3 arcs. Chapter 1 Level 1 uses **Discovery arc** — starts with exploration, NOT a quiz.

**Bridge levels between chapters** (P2 fix from Curriculum Architect):
Each chapter starts with a bridge that connects to the previous: "You just learned X. Now imagine if you could Y..."

**Surprise rewards:** After completing a chapter, unlock a bonus "Behind the Scenes" level with real production examples (Netflix, Spotify, Uber).

---

## 4. Visual Asset Architecture

### Hybrid Storage (recommended)

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Git Repo      │     │   Postgres   │     │  Cloudflare R2  │
│                 │     │              │     │                 │
│ D2 source files │     │ quest_visual │     │ Generated PNGs  │
│ Diagram prompts │────▶│ _assets      │────▶│ Napkin AI output│
│ React Flow data │     │ (metadata,   │     │ Rendered SVGs   │
│ Analogy content │     │  URLs, type) │     │                 │
└─────────────────┘     └──────────────┘     └─────────────────┘
```

**Why hybrid?**

- **Git**: Source of truth for reproducible assets (D2 files, prompts, component data). Never lost.
- **Postgres**: Metadata + relationships (which diagram belongs to which level). Queryable.
- **R2**: Binary assets (PNGs, rendered SVGs). Free 10GB, zero egress, CDN-served.

**DB schema addition:**

```sql
CREATE TABLE quest_visual_assets (
  id SERIAL PRIMARY KEY,
  level_id INTEGER REFERENCES quest_levels(id),
  asset_type TEXT NOT NULL, -- 'napkin', 'd2', 'react-flow', 'analogy'
  title TEXT NOT NULL,
  description TEXT,
  source_prompt TEXT, -- for Napkin AI: the generation prompt
  source_file TEXT, -- for D2: path in git (content/diagrams/ch1-rag-flow.d2)
  r2_url TEXT, -- CDN URL for rendered image
  r2_key TEXT, -- R2 object key for management
  metadata JSONB, -- React Flow node/edge data, analogy fields, etc.
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Alternative considered: DB-only

Store everything in `quest_learn_sections.content` JSONB. Simpler but:

- Binary images can't go in JSONB (base64 bloats DB)
- No CDN serving (slower)
- Harder to bulk-manage visual assets

### Alternative considered: Git-only

Store everything in `public/`. Simplest but:

- Docker image grows with every diagram
- No metadata/queryability
- Can't dynamically associate diagrams with levels

---

## 5. Sprint Plan

### Sprint 6: Foundation (~4 hours)

1. Install React Flow (`@xyflow/react`)
2. Create `quest_visual_assets` DB table + Drizzle schema
3. Build `<AnalogySectionPanel>` component (familiar → new concept bridge)
4. Build `<InteractiveExploration>` wrapper component (React Flow + custom nodes)
5. Set up Cloudflare R2 bucket + upload utility
6. Add `"analogy"` and `"exploration"` section types to LearnPanel renderer

### Sprint 7A: Chapter 1 Explorations (~6 hours)

1. Build RAG Pipeline interactive exploration (React Flow)
2. Write 5 visual analogies with 2 background variants each
3. Add prediction prompts to exploration
4. Seed into DB

### Sprint 7B: Chapter 1 Diagrams + Polish (~4 hours)

1. Generate 5 Napkin AI diagrams (following visual style guide)
2. Render 3 D2 diagrams
3. Upload to R2, seed metadata
4. Restructure Chapter 1 level order to Discovery arc
5. Add bridge introduction to Chapter 2 Level 1

### Sprint 8-10: Chapters 2-5 Content (~4 hours each)

Same pattern per chapter: analogies + exploration + generated diagrams + variety cycling

### Sprint 11: Polish (~2 hours)

1. Responsive testing for new components
2. Reduced motion support for React Flow
3. Light/dark theme for all new visuals
4. Performance audit (lazy-load React Flow)

---

## 6. Success Metrics

| Metric                          | Current                     | Target                  | How to measure                        |
| ------------------------------- | --------------------------- | ----------------------- | ------------------------------------- |
| Levels with visuals             | ~10% (PipelineDiagram only) | 80%+                    | Count levels with visual sections     |
| Interaction variety per chapter | 2-3 types                   | 6+ types                | Unique game/section types per chapter |
| Cross-domain accessibility      | Assumes backend knowledge   | Any engineer can follow | User testing with frontend dev        |
| Time on level page              | Unknown                     | > 3 min average         | Analytics (already built)             |
| Chapter completion rate         | Unknown                     | > 60%                   | Analytics                             |

---

## 7. Risks

| Risk                            | Likelihood | Impact | Mitigation                                             |
| ------------------------------- | ---------- | ------ | ------------------------------------------------------ |
| React Flow bundle size          | Medium     | Medium | Lazy-load, code-split per level                        |
| R2 setup complexity             | Low        | Low    | S3-compatible, simple API                              |
| Content quality (analogies)     | Medium     | High   | Expert review each analogy, test with non-ML engineers |
| Napkin AI output quality        | Medium     | Medium | Generate multiple, pick best, iterate prompts          |
| Scope creep (too many diagrams) | High       | Medium | Cap at 5 visuals per chapter in Sprint 7, expand later |

---

## 8. Team

| Role                  | Model           | Responsibility                                 |
| --------------------- | --------------- | ---------------------------------------------- |
| Architect / PRD owner | Opus            | PRD enforcement, expert panels, quality gates  |
| Content Writer        | Sonnet          | Analogies, exploration data, diagram prompts   |
| Frontend Agent        | Sonnet          | React Flow components, AnalogyPanel, DB schema |
| Diagram Generator     | Sonnet          | Napkin AI + D2 diagram creation                |
| Expert Panel          | Phase Evaluator | Teaching methodology review, UX review         |

---

## 9. Expert Panel Review Record

| Expert                  | Role                                         | Verdict             | P1 Items                            | P2 Items                                      |
| ----------------------- | -------------------------------------------- | ------------------- | ----------------------------------- | --------------------------------------------- |
| LX Designer             | Learning Experience, 15yr EdTech             | CONDITIONAL APPROVE | 2 (scaffolding, prediction prompts) | 1 (analogy quality)                           |
| Curriculum Architect    | Cross-domain education, ex-Google/Stripe     | CONDITIONAL APPROVE | 0                                   | 3 (concept map, arc templates, bridge levels) |
| Visual Communication    | Developer education diagrams, ex-Stripe docs | CONDITIONAL APPROVE | 1 (visual style guide)              | 2 (mobile fallback, review gate)              |
| Gamification Specialist | ex-Duolingo                                  | APPROVE             | 0                                   | 2 (mastery signals, aha metric)               |
| Senior ML Engineer      | Target learner, 10yr ML                      | APPROVE             | 0                                   | 1 (analogy accuracy review)                   |
| Frontend Engineer       | Secondary learner, 8yr React                 | CONDITIONAL APPROVE | 1 (Level 1 should be exploration)   | 1 (selectable analogies)                      |

**All P1 items resolved in PRD sections 2.6, 2.7, 2.8, 2.9 and 3.5.**
**All P2 items incorporated into sprint plans.**
