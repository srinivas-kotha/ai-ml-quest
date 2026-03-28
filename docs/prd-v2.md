# AI/ML Quest v2.0 -- Product Requirements Document

> **Status:** Draft
> **Author:** Srinivas Kotha
> **Created:** 2026-03-27
> **Last Updated:** 2026-03-27

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Teaching Methodology](#3-teaching-methodology)
4. [User Personas](#4-user-personas)
5. [Feature Requirements](#5-feature-requirements)
6. [Data Model](#6-data-model)
7. [Architecture](#7-architecture)
8. [File Structure](#8-file-structure)
9. [Interactive Component Specs](#9-interactive-component-specs)
10. [Design System](#10-design-system)
11. [Migration Plan](#11-migration-plan)
12. [Success Metrics](#12-success-metrics)
13. [Risks and Mitigations](#13-risks-and-mitigations)
14. [Non-Functional Requirements](#14-non-functional-requirements)

---

## 1. Executive Summary

### What

Transform AI/ML Quest from a static vanilla JS quiz app (53 levels, 5 chapters, nginx:alpine container) into a dynamic full-stack interactive learning platform built on Next.js 15 with Postgres-backed content, user accounts, rich teaching components, and analytics.

### Why

The current static app cannot scale. Content is hardcoded in JS files, progress is locked to a single browser via localStorage, there is no analytics to understand what students struggle with, and deploying content changes requires a code deploy. V2 unlocks user accounts (cross-device progress), admin-managed content (no redeploys for new levels), rich interactive teaching (not just quizzes), analytics-driven iteration, and a product surface suitable for a portfolio centerpiece.

### For Whom

- **Primary:** Enterprise engineers (13+ years experience in .NET/Java/Azure/K8s) pivoting to AI Engineering roles. They know backend architecture cold but need a bridge to ML/AI concepts framed in production terms they already understand.
- **Secondary:** Junior ML engineers (1-3 years) with theory knowledge but gaps in production deployment patterns.
- **Tertiary:** Hiring managers researching what skills define a strong AI Engineer candidate.

### Success Metrics (Top Line)

- 1,000 registered users within 3 months of launch
- 60% chapter completion rate (users who start a chapter finish it)
- Less than 3 seconds page load on any content page

---

## 2. Problem Statement

| Current State                                      | Impact                                                   |
| -------------------------------------------------- | -------------------------------------------------------- |
| Static HTML with hardcoded content in JS objects   | Cannot add/edit content without code deploy              |
| No user accounts                                   | Progress locked to one browser; cleared on cache wipe    |
| Quiz-only format (8 game types)                    | Tests knowledge but does not teach it                    |
| No analytics                                       | Cannot identify where students struggle or drop off      |
| Sequential chapter locking (1 -> 2 -> 3 -> 4 -> 5) | Forces linear path when chapters are largely independent |
| No search engine visibility                        | Static client-rendered app invisible to Google           |
| Vanilla JS with no component model                 | Difficult to build rich interactive content              |
| localStorage-only progress                         | No cross-device sync, no aggregate analytics             |

### Core Insight

AI/ML Quest v1 proves the concept: gamified, enterprise-framed AI/ML learning works. V2 needs to deliver on the promise by teaching (not just testing), scaling content independently of code, and building the foundation for a real product.

---

## 3. Teaching Methodology

This section defines what makes AI/ML Quest different from Coursera, Udemy, fast.ai, or any other AI/ML course. The methodology is the product.

### 3.1 Five Teaching Pillars

#### a) Fast.ai "Top-Down" Approach

Start with a WORKING example before explaining theory. Show the complete RAG pipeline running FIRST, then break down each component. "Get to useful results fast, then deepen understanding."

- Level 1 of every chapter shows the complete system working end-to-end
- Theory is introduced to explain what the student already saw working
- No "Chapter 1: History of Neural Networks" -- start with production reality

#### b) Karpathy "Build from Scratch" Approach

Every concept should have runnable code. Build intuition through live coding, not slides. "The best way to understand X is to implement X from scratch."

- Annotated code blocks with line-by-line explanations
- Code that runs in the browser where possible (Sandpack in P2)
- Pseudocode for GPU-heavy operations with real parameter values

#### c) Brilliant "Interactive Widget" Approach

The explanation IS the interaction. Do not separate "learn" from "do." Drag, slide, click to explore concepts, not just read about them. Every diagram should be interactive, not static.

- SliderPlayground: adjust chunk_size and see how text splits in real time
- PipelineDiagram: click through nodes to follow data flow step by step
- StepReveal: progressive disclosure instead of walls of text

#### d) 3Blue1Brown "Visual First" Approach

Build geometric intuition before formulas. Animate processes step-by-step. "What does this LOOK like?" before "What is the equation?"

- Animated SVG pipeline diagrams with data flowing through edges
- Visual embedding space representations
- Color-coded attention matrix visualizations

#### e) Enterprise Pain Point Approach (Original to AI/ML Quest)

Every concept starts with a real enterprise failure story. Real production numbers (latency, cost, accuracy) -- not toy examples. Map every AI/ML concept to existing enterprise skills (the "Enterprise Skills Bridge").

- "Netflix's team had 50K docs engineers couldn't search" -> then explain RAG
- "This company's chatbot hallucinated a refund policy that cost $200K" -> then explain guardrails
- Cost tables with real cloud pricing, not abstract "it depends"
- Skills Bridge: "You know database indexing? Embedding indexes are the same concept at 768 dimensions"

### 3.2 Lesson Structure (Per Level)

Every level follows a consistent six-part structure. The time allocations are targets, not hard limits.

```
1. HOOK       -- Enterprise pain point or failure story          (~30 seconds)
2. SHOW       -- Working example, demo, or animation             (~1 minute)
3. EXPLAIN    -- Step-by-step breakdown with interactive visuals  (~3-5 minutes)
4. CODE       -- Annotated, runnable code example                 (~2-3 minutes)
5. PRACTICE   -- Interactive challenge (game types from v1)       (~2-3 minutes)
6. TAKEAWAY   -- One-sentence interview-ready insight             (~10 seconds)
```

**HOOK example (RAG Pipeline, Level 1):**

> "A Fortune 500 company spent $2M on an internal knowledge base. Engineers still Slacked each other instead of searching it. The search was keyword-based -- it couldn't understand 'how do I handle auth timeouts?' because the docs said 'authentication retry logic.' RAG fixed this in 3 weeks."

**TAKEAWAY example (RAG Pipeline, Level 3):**

> "Chunking is not about splitting text -- it is about preserving the minimum context a question needs to be answered."

### 3.3 Enterprise Skills Bridge

Every chapter maps AI/ML concepts to enterprise patterns the primary persona already knows.

| AI/ML Concept          | Enterprise Equivalent        | Bridge Phrase                                                       |
| ---------------------- | ---------------------------- | ------------------------------------------------------------------- |
| Vector embeddings      | Database indexes             | "Indexes for meaning, not columns"                                  |
| RAG retrieval          | SQL JOIN with fuzzy matching | "JOIN on semantic similarity instead of foreign keys"               |
| Prompt engineering     | API contract design          | "The prompt is the interface contract with the model"               |
| Fine-tuning            | Custom middleware            | "Teaching the model your domain, like writing custom middleware"    |
| Model evaluation       | Integration testing          | "Evals are integration tests for AI"                                |
| Inference optimization | Query optimization           | "Same goal: reduce latency and cost per request"                    |
| Guardrails             | Input validation middleware  | "Validate what goes in and what comes out"                          |
| Feature stores         | Caching layers               | "Pre-computed features served at inference time, like Redis for ML" |

---

## 4. User Personas

### Primary: "Raj" -- Enterprise Veteran Pivoting to AI

- **Background:** 15 years building .NET/Azure enterprise systems. Principal Engineer at a Fortune 500. Manages a team of 8.
- **Motivation:** Company is "adding AI to everything." Raj's team is expected to integrate LLMs into existing products. He does not want to become a researcher -- he wants to ship AI features using patterns he already trusts.
- **Pain Points:** Every AI course starts at "what is a neural network?" -- wastes his time. Kaggle notebooks feel disconnected from production. He needs to know: how do I deploy this, how much does it cost, what breaks at scale?
- **Success Looks Like:** Raj completes the RAG Pipeline chapter and immediately builds a proof-of-concept for his team's internal docs search. He uses the "Enterprise Skills Bridge" framing in his architecture proposal to get buy-in from leadership.

### Secondary: "Sarah" -- Junior ML Engineer

- **Background:** 2 years out of an ML master's program. Works at a startup. Knows PyTorch, transformers theory, and Jupyter notebooks.
- **Motivation:** Her models work in notebooks but fail in production. Deployment, monitoring, and cost optimization are gaps.
- **Pain Points:** Courses either repeat theory she knows or jump to "just use SageMaker" without explaining the engineering. She needs the gap between notebook and production.
- **Success Looks Like:** Sarah completes the ML Monitoring chapter and sets up proper drift detection on her team's recommendation model. She stops firefighting silent model degradation.

### Tertiary: "Alex" -- Hiring Manager

- **Background:** Engineering Director, building an AI team. 20 years in tech, limited ML background.
- **Motivation:** Needs to evaluate AI Engineer candidates without being fooled by buzzwords. Wants to understand what skills actually matter.
- **Pain Points:** Cannot tell if a candidate's "RAG experience" means they called an API once or designed a production retrieval system.
- **Success Looks Like:** Alex uses the chapter structure as an interview rubric. "Can the candidate explain chunking trade-offs?" maps directly to Level 3 of Chapter 1.

---

## 5. Feature Requirements

### P0 -- Must Have for Launch

These features are required before the v2 deployment replaces the static site.

| Feature                       | Description                                                                                                                                                      |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dynamic content from Postgres | Chapters, levels, and learn_sections served from DB, not hardcoded JS                                                                                            |
| Rich learn content renderer   | LearnPanel component renders 7 section types: text (markdown), code, diagram, comparison, steps, playground, callout                                             |
| 8 existing game types         | SpeedQuiz, PipelineBuilder, CodeDebugger, ConceptMatcher, ParameterTuner, DiagnosisLab, CostOptimizer, ArchitectureBattle -- all ported from vanilla JS to React |
| User accounts (GitHub OAuth)  | Sign in with GitHub. Profile stores display_name, avatar. Session management via NextAuth.js                                                                     |
| Guest mode                    | Full access without account. Progress stored in localStorage. Prompt to create account to sync progress                                                          |
| Progress tracking             | Completed levels, scores, attempts, time spent. Stored in Postgres for authenticated users, localStorage for guests                                              |
| Chapter dependency graph      | Chapters declare prerequisites as a list of chapter slugs. A chapter is unlocked when all prerequisites are completed. Not a linear sequence.                    |
| Responsive layout             | Desktop-first (1024px+ primary). Tablet and mobile functional but not optimized for touch game interactions.                                                     |
| Docker deployment             | Single multi-stage Dockerfile. Next.js standalone output. Deployed on VPS port 3003, reverse-proxied via Nginx Proxy Manager. Shared Postgres instance.          |
| SEO-optimized pages           | SSG for chapter and level listing pages. Meta tags, Open Graph, structured data (Course schema.org).                                                             |

### P1 -- Should Have

Ship in the first iteration after launch, or alongside launch if time permits.

| Feature                  | Description                                                                                                                                                                                                                      |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin content API        | CRUD endpoints for chapters, levels, and learn_sections. Auth-gated to admin role. No UI required initially (API-only, manage via curl/Postman).                                                                                 |
| AnnotatedCode component  | Syntax-highlighted code blocks with clickable annotation markers that highlight lines and show explanations. CSS-based highlighting for Python, JavaScript, SQL, bash.                                                           |
| Animated PipelineDiagram | SVG-based node-edge diagram with animated dashed-line data flow. Click nodes for description tooltips. Step-through mode for guided walkthroughs.                                                                                |
| SliderPlayground         | Real-time interactive sliders that update a preview area. Built-in renderers for chunk preview, cost calculator, and dimension/quality trade-off.                                                                                |
| BeforeAfter comparison   | Toggle between two labeled panels (e.g., "Without RAG" vs "With RAG"). Tab-based switching with fade transition.                                                                                                                 |
| StepReveal component     | Progressive disclosure through numbered steps. Prev/Next navigation with dot indicators. Each step fades in on reveal.                                                                                                           |
| XP system                | Port from v1. XP awarded per level (configurable per level). Player level calculated from total XP. Streak tracking (consecutive daily activity). Combo multiplier for consecutive correct answers. Spring animation on XP gain. |
| Sound effects            | Port from v1. Web Audio API. Correct answer chime, wrong answer buzz, level complete fanfare, combo sound. Mutable via settings toggle.                                                                                          |

### P2 -- Nice to Have

Not required for launch. Build when the platform has users and needs stickiness features.

| Feature                  | Description                                                                                                                                               |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Leaderboard              | Anonymous by default (display_name or "Player #N"). Sorted by XP. Weekly and all-time views.                                                              |
| Runnable code sandbox    | Embed Sandpack (CodeSandbox) for in-browser Python/JS execution. Per-level sandbox config.                                                                |
| Spaced repetition        | After completing a level, schedule review prompts at increasing intervals (1d, 3d, 7d, 14d). Surface review suggestions on the hub page.                  |
| Content A/B testing      | Serve variant learn_sections to different user cohorts. Track completion rate per variant.                                                                |
| User analytics dashboard | Personal page showing: levels completed per chapter (progress rings), time distribution, strongest/weakest topics, streak calendar.                       |
| Certificate generation   | On chapter completion (all levels done, score > 70%), generate a shareable certificate image with user name, chapter title, date. Hosted at a unique URL. |
| Dark/light mode toggle   | Default dark. Light mode option via toggle in nav. Persist preference in localStorage + user settings.                                                    |

### P3 -- Future

Long-term roadmap. Not designed in detail now.

| Feature                      | Description                                                                                                                                         |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Payment integration (Stripe) | Premium chapters behind paywall. Free tier includes Chapter 1 + first 3 levels of each chapter.                                                     |
| AI tutor                     | Claude API integration for personalized hints. "Ask about this concept" button per learn section. Context-aware (knows which level the user is on). |
| Community features           | Discussion thread per level. Upvote/downvote. Admin moderation.                                                                                     |
| Mobile app                   | Progressive Web App (PWA) first. React Native if PWA is insufficient.                                                                               |
| Content marketplace          | User-generated levels with review/approval workflow. Revenue share model.                                                                           |

---

## 6. Data Model

All tables use the `quest_` prefix to coexist in the shared Postgres instance alongside Kokilla (`kokilla_*`), StreamVault (`sv_*`), and other services.

```sql
-- ============================================================
-- CHAPTERS
-- ============================================================
CREATE TABLE quest_chapters (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  icon TEXT,                                    -- emoji or icon identifier
  accent_color TEXT DEFAULT '#3b82f6',          -- hex color for chapter theming
  sort_order INT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  prerequisites JSONB DEFAULT '[]',            -- array of chapter slugs: ["rag-pipeline"]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LEVELS
-- ============================================================
CREATE TABLE quest_levels (
  id SERIAL PRIMARY KEY,
  chapter_id INT REFERENCES quest_chapters(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  level_number INT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  hook TEXT,                                   -- enterprise pain point opening line
  game_type TEXT NOT NULL,                     -- one of 8 game types
  game_config JSONB NOT NULL,                  -- game-specific configuration (questions, options, etc.)
  key_insight TEXT,                             -- one-sentence interview-ready takeaway
  xp_reward INT DEFAULT 100,
  estimated_minutes INT DEFAULT 5,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chapter_id, level_number)
);

-- ============================================================
-- LEARN SECTIONS (ordered content blocks per level)
-- ============================================================
CREATE TABLE quest_learn_sections (
  id SERIAL PRIMARY KEY,
  level_id INT REFERENCES quest_levels(id) ON DELETE CASCADE,
  sort_order INT NOT NULL,
  section_type TEXT NOT NULL CHECK (section_type IN (
    'text',           -- markdown-rendered text block
    'code',           -- syntax-highlighted code with optional annotations
    'diagram',        -- animated SVG pipeline diagram
    'comparison',     -- before/after toggle panels
    'steps',          -- progressive step-by-step reveal
    'playground',     -- interactive slider/widget
    'callout'         -- highlighted tip, warning, or enterprise insight
  )),
  title TEXT,
  content JSONB NOT NULL,                      -- structure varies by section_type (see section 9)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE quest_users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  auth_provider TEXT DEFAULT 'github',
  auth_provider_id TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ
);

-- ============================================================
-- USER PROGRESS (one row per user-level pair)
-- ============================================================
CREATE TABLE quest_user_progress (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES quest_users(id) ON DELETE CASCADE,
  level_id INT REFERENCES quest_levels(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  score INT,                                   -- points earned
  max_score INT,                               -- maximum possible
  attempts INT DEFAULT 0,
  time_spent_seconds INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, level_id)
);

-- ============================================================
-- USER STATS (aggregated, one row per user)
-- ============================================================
CREATE TABLE quest_user_stats (
  user_id INT PRIMARY KEY REFERENCES quest_users(id) ON DELETE CASCADE,
  xp INT DEFAULT 0,
  player_level INT DEFAULT 1,
  streak_days INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_active_date DATE,
  total_levels_completed INT DEFAULT 0,
  total_time_seconds INT DEFAULT 0
);

-- ============================================================
-- LEVEL ANALYTICS (aggregated per level, updated on each completion)
-- ============================================================
CREATE TABLE quest_level_analytics (
  level_id INT PRIMARY KEY REFERENCES quest_levels(id) ON DELETE CASCADE,
  total_attempts INT DEFAULT 0,
  total_completions INT DEFAULT 0,
  avg_score DECIMAL(5,2),
  avg_time_seconds INT,
  drop_off_rate DECIMAL(5,2),                  -- started but not completed / started
  common_wrong_answers JSONB DEFAULT '[]',     -- [{answer, count}] for quiz types
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_quest_levels_chapter ON quest_levels(chapter_id);
CREATE INDEX idx_quest_learn_sections_level ON quest_learn_sections(level_id);
CREATE INDEX idx_quest_user_progress_user ON quest_user_progress(user_id);
CREATE INDEX idx_quest_user_progress_level ON quest_user_progress(level_id);
CREATE INDEX idx_quest_chapters_slug ON quest_chapters(slug);
```

### JSONB Content Schemas

Each `section_type` in `quest_learn_sections` has a defined JSONB structure for the `content` column:

```jsonc
// section_type: "text"
{
  "markdown": "## Heading\n\nParagraph with **bold** and `inline code`.\n\n> Blockquote"
}

// section_type: "code"
{
  "language": "python",
  "title": "Basic RAG Pipeline",
  "code": "from langchain import ...",
  "annotations": [
    { "lines": [3, 4], "text": "This initializes the embedding model" },
    { "lines": [7, 8, 9], "text": "Chunking happens here -- notice the overlap parameter" }
  ]
}

// section_type: "diagram"
{
  "nodes": [
    { "id": "query", "label": "User Query", "icon": "search", "description": "Natural language question from the user" },
    { "id": "embed", "label": "Embed", "icon": "cube", "description": "Convert query to 768-dim vector" },
    { "id": "retrieve", "label": "Retrieve", "icon": "database", "description": "Find top-k similar chunks" },
    { "id": "generate", "label": "Generate", "icon": "sparkles", "description": "LLM generates answer using retrieved context" }
  ],
  "edges": [["query", "embed"], ["embed", "retrieve"], ["retrieve", "generate"]],
  "animate": true
}

// section_type: "comparison"
{
  "before": { "label": "Keyword Search", "content": "Searching 'auth timeout handling' returns 0 results because docs say 'authentication retry logic'" },
  "after": { "label": "Semantic Search (RAG)", "content": "Searching 'auth timeout handling' returns the correct doc because embeddings capture meaning, not keywords" }
}

// section_type: "steps"
{
  "steps": [
    { "title": "Load Documents", "content": "Read all source documents into memory", "visual": "diagram-ref:load" },
    { "title": "Split into Chunks", "content": "Break documents into overlapping 512-token chunks", "visual": "diagram-ref:chunk" },
    { "title": "Generate Embeddings", "content": "Convert each chunk to a 768-dimensional vector", "visual": "diagram-ref:embed" },
    { "title": "Store in Vector DB", "content": "Index embeddings for fast similarity search", "visual": "diagram-ref:store" }
  ]
}

// section_type: "playground"
{
  "title": "Chunk Size Explorer",
  "sliders": [
    { "name": "chunkSize", "label": "Chunk Size (tokens)", "min": 64, "max": 2048, "default": 512, "unit": "tokens" },
    { "name": "overlap", "label": "Overlap", "min": 0, "max": 256, "default": 50, "unit": "tokens" }
  ],
  "renderType": "chunkPreview",
  "sampleText": "The quick brown fox jumps over the lazy dog..."
}

// section_type: "callout"
{
  "variant": "enterprise",       // "enterprise" | "tip" | "warning" | "insight"
  "title": "Enterprise Skills Bridge",
  "content": "If you know database indexing, vector indexes are the same concept -- but instead of B-trees on column values, you are building HNSW graphs on 768-dimensional embeddings."
}
```

---

## 7. Architecture

### System Overview

```
+--------------------------------------------------+
|              Client (Browser)                     |
|  Next.js 15 App Router                           |
|  +------------+ +------------+ +---------------+ |
|  | SSG Pages  | | Client     | | Interactive   | |
|  | (chapters, | | Components | | Game + Learn  | |
|  |  levels)   | | (progress, | | Components    | |
|  |            | |  auth UI)  | | (client-only) | |
|  +------------+ +------------+ +---------------+ |
+-------------------+------------------------------+
                    |
                    | fetch / server actions
                    |
+-------------------v------------------------------+
|           Next.js API Routes                      |
|  /api/auth/*     (NextAuth.js - GitHub OAuth)     |
|  /api/chapters/* (chapter listing + detail)       |
|  /api/levels/*   (level data + learn sections)    |
|  /api/progress/* (save/load user progress)        |
|  /api/admin/*    (content CRUD - admin only)      |
|  /api/analytics/*(aggregated stats - admin only)  |
+-------------------+------------------------------+
                    |
                    | parameterized queries (pg / drizzle)
                    |
+-------------------v------------------------------+
|           PostgreSQL (Shared Instance)             |
|  quest_chapters, quest_levels,                    |
|  quest_learn_sections, quest_users,               |
|  quest_user_progress, quest_user_stats,           |
|  quest_level_analytics                            |
+--------------------------------------------------+
```

### Rendering Strategy

| Page                            | Strategy                         | Rationale                                                                                                 |
| ------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `/` (hub/dashboard)             | SSG + client overlay             | Chapter list is static. Progress overlay fetched client-side for authenticated users.                     |
| `/chapters/[slug]`              | SSG with revalidation (1hr)      | Level list rarely changes. Revalidate hourly to pick up new published levels.                             |
| `/chapters/[slug]/levels/[num]` | SSG (learn content) + CSR (game) | Learn sections are static content. Game component is fully client-side (interactive, needs browser APIs). |
| `/profile`                      | SSR (auth-gated)                 | User-specific data. Server-rendered with auth check.                                                      |
| `/admin/*`                      | SSR (admin-gated)                | Admin-only. No SEO needed. Server-rendered with role check.                                               |

### API Routes

| Method | Path                          | Auth   | Description                                                                                                             |
| ------ | ----------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| `*`    | `/api/auth/[...nextauth]`     | Public | NextAuth.js handler (GitHub OAuth)                                                                                      |
| `GET`  | `/api/chapters`               | Public | List published chapters. If authenticated, includes user progress summary per chapter.                                  |
| `GET`  | `/api/chapters/[slug]/levels` | Public | List published levels for a chapter. If authenticated, includes completion status per level.                            |
| `GET`  | `/api/levels/[id]`            | Public | Full level detail: learn_sections (ordered), game_config, metadata.                                                     |
| `POST` | `/api/progress`               | Auth   | Save level completion: `{ level_id, score, max_score, time_spent_seconds }`. Upserts user_progress, updates user_stats. |
| `GET`  | `/api/progress/stats`         | Auth   | User stats: XP, player level, streak, levels completed, time spent.                                                     |
| `GET`  | `/api/admin/chapters`         | Admin  | List all chapters (including unpublished).                                                                              |
| `POST` | `/api/admin/chapters`         | Admin  | Create chapter.                                                                                                         |
| `PUT`  | `/api/admin/chapters/[id]`    | Admin  | Update chapter.                                                                                                         |
| `POST` | `/api/admin/levels`           | Admin  | Create level with learn_sections.                                                                                       |
| `PUT`  | `/api/admin/levels/[id]`      | Admin  | Update level and learn_sections.                                                                                        |
| `GET`  | `/api/analytics/overview`     | Admin  | Aggregated analytics: total users, completion rates, hardest levels, drop-off points.                                   |

### Authentication Flow

1. User clicks "Sign in with GitHub"
2. NextAuth.js redirects to GitHub OAuth consent screen
3. GitHub redirects back with auth code
4. NextAuth.js exchanges code for access token, fetches user profile
5. Upsert `quest_users` row (match on `auth_provider_id`)
6. Session cookie set (JWT strategy, no session DB table needed)
7. Subsequent requests include session cookie; API routes use `getServerSession()` to check auth

**Guest Mode:**

- All content is accessible without authentication
- Progress stored in localStorage with the same shape as the DB schema
- "Sign in to sync progress" prompt shown on hub page and after level completion
- On first sign-in, offer to merge localStorage progress into DB (one-time migration)

### Docker Deployment

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3003
CMD ["node", "server.js"]
```

- Port 3003 (same as current static site)
- Nginx Proxy Manager proxies `quest.srinivaskotha.uk` to port 3003
- `DATABASE_URL` connects to shared Postgres on the Docker network
- Health check: `GET /api/health` returns `{ status: "ok" }`

---

## 8. File Structure

```
ai-ml-quest/
├── src/
│   ├── app/                            # Next.js App Router pages
│   │   ├── layout.tsx                  # Root layout (fonts, theme, nav, auth provider)
│   │   ├── page.tsx                    # Hub/dashboard (chapter grid + user stats)
│   │   ├── chapters/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx            # Chapter detail (level list + progress)
│   │   │       └── levels/
│   │   │           └── [levelNum]/
│   │   │               └── page.tsx    # Level page (LearnPanel + GamePanel)
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts        # NextAuth handler
│   │   │   ├── chapters/
│   │   │   │   └── route.ts            # GET chapters
│   │   │   ├── levels/
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts        # GET level detail
│   │   │   ├── progress/
│   │   │   │   ├── route.ts            # POST completion, GET stats
│   │   │   │   └── stats/
│   │   │   │       └── route.ts        # GET user stats
│   │   │   ├── admin/
│   │   │   │   ├── chapters/
│   │   │   │   │   └── route.ts        # CRUD chapters
│   │   │   │   └── levels/
│   │   │   │       └── route.ts        # CRUD levels
│   │   │   ├── analytics/
│   │   │   │   └── overview/
│   │   │   │       └── route.ts        # GET analytics
│   │   │   └── health/
│   │   │       └── route.ts            # GET health check
│   │   ├── admin/
│   │   │   └── page.tsx                # Admin dashboard (P1)
│   │   └── profile/
│   │       └── page.tsx                # User profile + stats
│   ├── components/
│   │   ├── ui/                         # Generic UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── Tooltip.tsx
│   │   ├── learn/                      # Learn content renderers
│   │   │   ├── LearnPanel.tsx          # Orchestrates section rendering by type
│   │   │   ├── AnnotatedCode.tsx       # Code + clickable annotations
│   │   │   ├── PipelineDiagram.tsx     # Animated SVG node-edge diagram
│   │   │   ├── BeforeAfter.tsx         # Toggle comparison panels
│   │   │   ├── StepReveal.tsx          # Progressive step disclosure
│   │   │   ├── SliderPlayground.tsx    # Interactive slider widgets
│   │   │   ├── CalloutBox.tsx          # Enterprise insight / tip / warning
│   │   │   └── MarkdownText.tsx        # Markdown-to-JSX renderer
│   │   ├── games/                      # Game type components (all client-only)
│   │   │   ├── GamePanel.tsx           # Game orchestrator (selects component by game_type)
│   │   │   ├── SpeedQuiz.tsx
│   │   │   ├── PipelineBuilder.tsx
│   │   │   ├── CodeDebugger.tsx
│   │   │   ├── ConceptMatcher.tsx
│   │   │   ├── ParameterTuner.tsx
│   │   │   ├── DiagnosisLab.tsx
│   │   │   ├── CostOptimizer.tsx
│   │   │   └── ArchitectureBattle.tsx
│   │   ├── hud/                        # HUD overlay components
│   │   │   ├── XPCounter.tsx           # Animated XP display
│   │   │   ├── StreakBadge.tsx         # Current streak indicator
│   │   │   ├── ComboMeter.tsx          # Combo multiplier display
│   │   │   └── LevelComplete.tsx       # Completion modal with particle burst
│   │   └── nav/                        # Navigation
│   │       ├── TopNav.tsx              # Site header with auth controls
│   │       ├── ChapterNav.tsx          # Side nav within a chapter
│   │       └── BreadcrumbNav.tsx       # Breadcrumb trail
│   ├── lib/
│   │   ├── db.ts                       # Postgres connection pool (pg or drizzle)
│   │   ├── auth.ts                     # NextAuth.js configuration
│   │   ├── syntax.ts                   # CSS-based syntax highlighting utilities
│   │   ├── sounds.ts                   # Web Audio API sound manager
│   │   ├── xp.ts                       # XP calculation, level thresholds, streak logic
│   │   └── guest-progress.ts           # localStorage progress for guest mode
│   └── styles/
│       └── globals.css                 # Tailwind config + design tokens + animations
├── drizzle/                            # Drizzle ORM schema (if using drizzle)
│   └── schema.ts
├── postgres/
│   └── migrations/
│       ├── 001-quest-schema.sql        # Initial schema creation
│       └── 002-seed-chapter1.sql       # Chapter 1 seed data
├── seed/
│   ├── migrate-v1.ts                   # Script to convert static v1 content to DB seed format
│   ├── chapter1-rag.json               # Chapter 1 seed data
│   ├── chapter2-slm.json              # Chapter 2 seed data
│   ├── chapter3-monitoring.json       # Chapter 3 seed data
│   ├── chapter4-finetuning.json       # Chapter 4 seed data
│   └── chapter5-multimodal.json       # Chapter 5 seed data
├── public/
│   ├── fonts/
│   │   ├── Inter-Variable.woff2
│   │   └── JetBrainsMono-Variable.woff2
│   └── sounds/                         # Sound effect files (ported from v1)
├── .claude/
│   └── CLAUDE.md                       # Per-repo Claude Code instructions
├── Dockerfile
├── docker-compose.yml                  # Local development (Next.js + Postgres)
├── .env.example
├── .dockerignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 9. Interactive Component Specs

### PipelineDiagram

**Purpose:** Visualize data flow through multi-step ML pipelines. The signature visual component of AI/ML Quest.

**Props:**

```typescript
interface PipelineDiagramProps {
  nodes: Array<{
    id: string;
    label: string;
    icon: string; // lucide icon name
    description: string; // shown on click
  }>;
  edges: Array<[string, string]>; // [fromId, toId]
  animate: boolean; // animated dashed-line flow
  stepThrough?: boolean; // enable guided step-through mode
}
```

**Rendering:**

- SVG canvas with responsive viewBox
- Nodes: rounded rectangles (160x60) with icon + label, positioned via dagre layout or manual coordinates
- Edges: SVG `<path>` with arrowhead markers, routed to avoid overlaps
- Animation: `stroke-dasharray: 8 12` with CSS `@keyframes flowPulse` for flowing dash effect
- Active node: glows with chapter accent color, border pulse animation

**Interaction:**

- Click node: show description in a tooltip/popover anchored to the node
- Step-through mode: "Next" button at bottom. Each click highlights the next node in topological order. Previous nodes dim. Current node pulses. Edge to current node animates.
- Keyboard: Arrow keys navigate between nodes in step-through mode. Enter/Space to show description.

### AnnotatedCode

**Purpose:** Teach code line-by-line with clickable annotations, not just display it.

**Props:**

```typescript
interface AnnotatedCodeProps {
  language: "python" | "javascript" | "typescript" | "sql" | "bash" | "json";
  title?: string;
  code: string;
  annotations?: Array<{
    lines: number[]; // 1-indexed line numbers
    text: string; // explanation text (supports markdown inline)
  }>;
}
```

**Rendering:**

- Code block with line numbers (left gutter)
- CSS-based syntax highlighting (no heavy library -- use Shiki for build-time or lightweight runtime tokenizer)
- Annotation markers: numbered circles in the gutter next to annotated lines
- Active annotation: highlighted lines get a subtle background tint in the chapter accent color

**Interaction:**

- Click annotation marker: highlight the associated lines, show explanation in a panel below the code block
- Click "Copy" button: copy raw code to clipboard (without annotations)
- Auto-walk mode (optional): step through annotations sequentially with Next/Prev buttons

### BeforeAfter

**Purpose:** Show the contrast between approaches (e.g., keyword search vs semantic search).

**Props:**

```typescript
interface BeforeAfterProps {
  before: { label: string; content: string }; // content supports markdown
  after: { label: string; content: string };
}
```

**Rendering:**

- Two-tab layout. "Before" tab has a muted/red-tinted header. "After" tab has a green/accent-tinted header.
- Content area renders markdown.
- Smooth crossfade transition (150ms opacity) on tab switch.

**Interaction:**

- Click tab to switch. Active tab has an underline indicator.
- Keyboard: Tab key moves between tabs. Enter activates.

### StepReveal

**Purpose:** Break complex processes into digestible sequential steps instead of showing everything at once.

**Props:**

```typescript
interface StepRevealProps {
  steps: Array<{
    title: string;
    content: string; // markdown
    visual?: string; // optional reference to a diagram node or image
  }>;
}
```

**Rendering:**

- Step counter: "Step 2 of 5"
- Title and content area with fade-in animation on step change
- Dot indicators at the bottom showing current position
- Prev/Next buttons (Prev disabled on step 1, Next changes to "Done" on last step)

**Interaction:**

- Next/Prev buttons or left/right arrow keys
- Dot indicators are clickable to jump to a specific step

### SliderPlayground

**Purpose:** Let students manipulate parameters and immediately see the effect. Makes abstract concepts tangible.

**Props:**

```typescript
interface SliderPlaygroundProps {
  title: string;
  sliders: Array<{
    name: string; // variable name for renderType callback
    label: string;
    min: number;
    max: number;
    default: number;
    step?: number; // default: 1
    unit?: string; // displayed after value
  }>;
  renderType: "chunkPreview" | "costCalculator" | "dimensionPreview" | "custom";
  sampleText?: string; // for chunkPreview
  customRenderer?: string; // function name for custom renderType
}
```

**Built-in Renderers:**

| renderType         | What it shows                                                                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `chunkPreview`     | Displays `sampleText` split into colored chunks based on `chunkSize` and `overlap` slider values. Each chunk is a different background color. Overlapping regions are striped. |
| `costCalculator`   | Calculates monthly cost: `(queriesPerDay * costPerQuery * 30)` with breakdown table. Sliders: queries/day, embedding model (maps to cost), LLM model (maps to cost).           |
| `dimensionPreview` | Shows quality vs size trade-off. Slider for embedding dimensions (64-1536). Bar chart showing relative storage size + estimated retrieval quality score.                       |

**Interaction:**

- Drag sliders: preview area updates in real time (no debounce, direct state binding)
- Reset button: return all sliders to default values
- Value display: shows current number + unit next to each slider

### CalloutBox

**Purpose:** Highlight enterprise insights, tips, and warnings that break the flow intentionally.

**Props:**

```typescript
interface CalloutBoxProps {
  variant: "enterprise" | "tip" | "warning" | "insight";
  title?: string;
  content: string; // markdown
}
```

**Styling by variant:**

- `enterprise`: Gold left border, briefcase icon, warm gold background tint. Used for Enterprise Skills Bridge callouts.
- `tip`: Blue left border, lightbulb icon, blue background tint.
- `warning`: Red left border, alert icon, red background tint.
- `insight`: Purple left border, brain icon, purple background tint. Used for interview-ready insights.

---

## 10. Design System

### Identity: "Warm Technical"

Premium dark theme with topic-specific identity. Each chapter has its own accent color. The overall feel is warm and inviting (not cold/sterile), technically sophisticated (not playful/childish), and information-dense without being cluttered.

### Chapter Accent Colors

| Chapter       | Color   | Hex       | Rationale                         |
| ------------- | ------- | --------- | --------------------------------- |
| RAG Pipeline  | Blue    | `#3b82f6` | Data, retrieval, trust            |
| Local SLM     | Purple  | `#8b5cf6` | Intelligence, models, computation |
| ML Monitoring | Emerald | `#10b981` | Health, observability, green = OK |
| Fine-Tuning   | Amber   | `#f59e0b` | Precision, craftsmanship, warmth  |
| Multimodal    | Red     | `#ef4444` | Ambition, complexity, energy      |
| Capstone      | Gold    | `#f5c542` | Achievement, mastery              |

### Base Palette

```css
:root {
  --void: #0c0c14; /* warm near-black base */
  --surface: #101018; /* elevated surface */
  --card: #14141f; /* card background */
  --card-hover: #1a1a2a; /* card hover state */
  --border: rgba(255, 255, 255, 0.07);
  --border-hover: rgba(255, 255, 255, 0.12);
  --text-primary: #e2e8f0; /* slate-200 */
  --text-secondary: #94a3b8; /* slate-400 */
  --text-muted: #64748b; /* slate-500 */
  --success: #f5c542; /* warm gold for success states */
  --error: #ef4444; /* red-500 */
  --code-bg: #0d0d17; /* slightly darker than void for code blocks */
}
```

### Typography

| Element         | Font           | Weight | Size             | Tracking |
| --------------- | -------------- | ------ | ---------------- | -------- |
| Body text       | Inter          | 400    | 16px (1rem)      | normal   |
| Body bold       | Inter          | 600    | 16px             | normal   |
| H1 (page title) | Inter          | 700    | 36px (2.25rem)   | -0.025em |
| H2 (section)    | Inter          | 600    | 24px (1.5rem)    | -0.02em  |
| H3 (subsection) | Inter          | 600    | 20px (1.25rem)   | -0.01em  |
| Code inline     | JetBrains Mono | 400    | 14px (0.875rem)  | normal   |
| Code block      | JetBrains Mono | 400    | 13px (0.8125rem) | normal   |
| Caption/label   | Inter          | 500    | 12px (0.75rem)   | 0.05em   |

### Special Effects

**Glassmorphism learn panels:**

```css
.learn-panel {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}
```

**Animated edge flow (PipelineDiagram):**

```css
.edge-path {
  stroke-dasharray: 8 12;
  animation: flowPulse 1s linear infinite;
}

@keyframes flowPulse {
  to {
    stroke-dashoffset: -20;
  }
}
```

**Node glow on active:**

```css
.node-active {
  filter: drop-shadow(0 0 12px var(--chapter-accent));
  border-color: var(--chapter-accent);
}
```

**Particle burst on level complete:**

- Canvas API overlay triggered on game completion
- 60-80 particles with chapter accent color + gold
- Gravity simulation, 1.5s duration, fade out
- Ported from v1 implementation

**XP counter spring animation:**

- CSS `@keyframes` with overshoot: scale up to 1.15, settle to 1.0
- Number rolls up from old value to new value over 600ms
- Gold flash on the counter background

### Spacing Scale

Follow Tailwind defaults: 4px base unit. Key spacing values: `p-4` (16px) for card padding, `gap-6` (24px) between sections, `gap-8` (32px) between major page sections, `py-12` (48px) for page-level vertical padding.

### Responsive Breakpoints

| Breakpoint | Width      | Layout                                                               |
| ---------- | ---------- | -------------------------------------------------------------------- |
| Mobile     | < 640px    | Single column. Learn and game panels stack vertically.               |
| Tablet     | 640-1023px | Single column with wider content area.                               |
| Desktop    | 1024px+    | Side-by-side learn panel (left) + game panel (right) on level pages. |

---

## 11. Migration Plan

### Phase 0: Setup (1 session, ~3 hours)

**Goal:** Bootable Next.js project with DB schema, seeded Chapter 1 data, and Docker dev environment.

- Initialize Next.js 15 project with App Router, TypeScript, Tailwind CSS
- Configure `next.config.ts` for standalone output
- Set up folder structure per section 8
- Write DB migration `001-quest-schema.sql`
- Write `migrate-v1.ts` script to convert static Chapter 1 content from v1 JS objects to seed JSON
- Seed Chapter 1 (10 levels) with basic learn_sections (text + callout types only, rich components added in Phase 2)
- Create `Dockerfile` (multi-stage, standalone output)
- Create `docker-compose.yml` for local dev (Next.js + Postgres)
- Create `.env.example` with all required env vars
- Verify: `docker compose up` starts the app, connects to Postgres, seed data is queryable

### Phase 1: Core Platform (2-3 sessions, ~8 hours)

**Goal:** Fully functional platform with auth, progress tracking, all game types, and basic learn content rendering.

**1A: Layout + Navigation + Auth (~3 hours)**

- Root layout with Inter + JetBrains Mono fonts, dark theme, nav
- Hub page with chapter grid
- Chapter page with level list
- NextAuth.js setup (GitHub OAuth provider)
- Guest mode with localStorage fallback
- TopNav with auth controls (sign in / avatar dropdown)

**1B: Level Page + Learn Panel (~2 hours)**

- Level page layout (learn panel left, game panel right on desktop)
- LearnPanel component that renders sections by type
- MarkdownText renderer (text sections)
- CalloutBox renderer (callout sections)
- Placeholder renderers for code, diagram, comparison, steps, playground (render JSON as formatted preview until Phase 2 components are built)

**1C: Game Types (~3 hours)**

- GamePanel orchestrator (selects component by `game_type`)
- Port all 8 game types from vanilla JS to React components
- Game completion callback: POST to `/api/progress` (or localStorage for guests)
- XP counter animation on completion
- Particle burst on level complete

### Phase 2: Rich Content (2-3 sessions, ~8 hours)

**Goal:** All interactive learn components built. Full Chapter 1 content written with rich sections. Remaining chapters migrated.

**2A: Interactive Components (~4 hours)**

- AnnotatedCode (syntax highlighting + clickable annotations)
- PipelineDiagram (SVG nodes + edges + animation + step-through)
- BeforeAfter (toggle comparison)
- StepReveal (progressive steps)
- SliderPlayground (3 built-in renderers)

**2B: Chapter 1 Content Enrichment (~2 hours)**

- Write rich learn_sections for all 10 Chapter 1 levels
- Every level follows the HOOK-SHOW-EXPLAIN-CODE-PRACTICE-TAKEAWAY structure
- At least 1 PipelineDiagram, 2 AnnotatedCode, 1 SliderPlayground, 2 BeforeAfter per chapter

**2C: Chapters 2-5 Migration (~2 hours)**

- Run migrate-v1.ts for Chapters 2-5 game content
- Write basic learn_sections (text + callout) for all levels
- Mark as published. Rich content (diagrams, code, playgrounds) added incrementally over time.

### Phase 3: Polish + Deploy (1-2 sessions, ~5 hours)

**Goal:** Production-ready deployment, replacing the current static site.

**3A: Admin + Analytics (~2 hours)**

- Admin page for content CRUD (basic table view + edit forms)
- Analytics overview page (completion rates, hardest levels, drop-off chart)
- Role-based auth guard (admin check on API routes and pages)

**3B: Performance + SEO (~1 hour)**

- SSG configuration for all content pages
- `generateStaticParams` for chapter and level routes
- Meta tags, Open Graph images, Course schema.org structured data
- Font optimization (variable fonts, font-display: swap)
- Lazy-load interactive components (dynamic import with loading skeleton)

**3C: CI/CD + Deployment (~2 hours)**

- GitHub Actions workflow: lint + typecheck + build + Docker push
- Deploy to VPS: rebuild container on port 3003
- Nginx Proxy Manager config update (if needed)
- Smoke test: verify all chapters load, auth works, progress saves
- DNS cutover: swap from static nginx to Next.js container
- Keep static v1 container as rollback (rename, don't delete)

### Phase 4: Growth (Ongoing)

No fixed timeline. Prioritize based on user feedback and analytics.

- Leaderboard (P2)
- Certificates (P2)
- Additional chapters (6: Agents, 7: Evaluation, 8: Deployment)
- Content A/B testing (P2)
- Spaced repetition (P2)
- Runnable code sandbox via Sandpack (P2)
- AI tutor integration (P3)

---

## 12. Success Metrics

| Metric                          | Target                              | How Measured                                       | Review Cadence |
| ------------------------------- | ----------------------------------- | -------------------------------------------------- | -------------- |
| First Contentful Paint          | < 2s (SSG pages)                    | Lighthouse CI in GitHub Actions                    | Per deploy     |
| API response time               | < 100ms (p95)                       | Server-side logging                                | Weekly         |
| Level completion rate           | > 60% per chapter                   | `quest_user_progress` aggregation                  | Monthly        |
| 7-day return rate               | > 30%                               | `quest_user_stats.last_active_date`                | Monthly        |
| Content velocity                | 10+ new levels per month            | Level count in DB                                  | Monthly        |
| User growth                     | 1,000 registered users in 3 months  | `quest_users` count                                | Monthly        |
| Top 5 hardest levels identified | Within 1 month of launch            | `quest_level_analytics.drop_off_rate`              | Monthly        |
| Portfolio interview mentions    | 3+ interviews reference the project | Manual tracking                                    | Quarterly      |
| Guest-to-registered conversion  | > 20%                               | Users who had localStorage progress then signed up | Monthly        |

---

## 13. Risks and Mitigations

| Risk                                                                                       | Likelihood | Impact | Mitigation                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------ | ---------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Content authoring bottleneck** -- Writing rich learn_sections is slow; growth stalls     | HIGH       | HIGH   | Admin panel with structured templates reduces friction. Start with text+callout sections (fast to write), add rich components incrementally. Seed data migration script handles v1 content automatically. |
| **Over-engineering** -- Building P1/P2 features before launch delays shipping              | HIGH       | HIGH   | Hard scope: Phase 0-1 is MVP. Ship with text+callout learn sections only. All 8 game types must work. Everything else is post-launch.                                                                     |
| **Next.js complexity vs static** -- More moving parts, more to maintain                    | MEDIUM     | MEDIUM | Follow proven patterns from StreamVault (same team, same VPS, same deployment model). Standalone output minimizes runtime deps.                                                                           |
| **Rich content performance on mobile** -- Interactive components slow on low-end devices   | MEDIUM     | MEDIUM | SSG for all content pages. Lazy-load interactive components with `next/dynamic`. Test on throttled Chrome DevTools.                                                                                       |
| **Auth friction reduces signups** -- GitHub-only excludes non-developers                   | LOW        | MEDIUM | Guest mode is full-featured (no paywall). Auth is optional. Add Google/email providers in P2 if GitHub-only proves limiting.                                                                              |
| **Postgres shared load** -- quest tables add load to shared instance                       | LOW        | LOW    | Quest tables are tiny (hundreds of rows, not millions). Same Postgres handles Kokilla + StreamVault without issues. Add connection pooling if needed.                                                     |
| **Game port regressions** -- Porting 8 game types from vanilla JS to React introduces bugs | MEDIUM     | MEDIUM | Port one game type at a time. Test each against v1 behavior before moving to the next. Keep v1 running as reference.                                                                                      |
| **SEO expectations too high** -- Educational content is competitive; may not rank          | MEDIUM     | LOW    | SEO is a bonus, not the growth strategy. Primary distribution: LinkedIn posts, portfolio showcase, word of mouth. Structured data and SSG give a baseline.                                                |

---

## 14. Non-Functional Requirements

### Performance

| Metric                       | Target          | Enforcement                            |
| ---------------------------- | --------------- | -------------------------------------- |
| First Contentful Paint       | < 2s            | Lighthouse CI gate (score > 90)        |
| Time to Interactive          | < 3s            | Lighthouse CI gate                     |
| API response time (p95)      | < 100ms         | Server-side timing logs                |
| Bundle size (JS, first load) | < 150KB gzipped | `next/bundle-analyzer` check           |
| Image/font loading           | No layout shift | `font-display: swap`, fixed dimensions |

### Security

- **Authentication:** NextAuth.js handles OAuth securely. JWT session strategy (no DB sessions to leak).
- **Authorization:** Admin routes check `role === 'admin'` via middleware. Public routes serve only published content.
- **Database:** All queries use parameterized inputs via Drizzle ORM or `pg` parameterized queries. No raw string concatenation.
- **Input validation:** All API inputs validated with Zod schemas before processing.
- **CSRF:** NextAuth.js includes CSRF protection by default.
- **Secrets:** `DATABASE_URL`, `NEXTAUTH_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` in `.env` (gitignored). `.env.example` documents all required variables.
- **Headers:** Security headers via `next.config.ts` (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, CSP).

### Accessibility

- **Standard:** WCAG 2.1 AA compliance.
- **Keyboard navigation:** All interactive components (games, learn panels, sliders, diagrams) are keyboard-accessible. Focus indicators visible on all focusable elements.
- **Screen readers:** All images have alt text. Interactive components have `aria-label` and `role` attributes. Game state changes announced via `aria-live` regions.
- **Color contrast:** All text meets 4.5:1 contrast ratio against backgrounds. Chapter accent colors used for decoration only, never as the sole indicator of state.
- **Motion:** Respect `prefers-reduced-motion`. Disable particle burst, edge animations, and step transitions when enabled.

### SEO

- **Static generation:** All chapter and level content pages are statically generated at build time with `generateStaticParams`.
- **Structured data:** Course schema.org markup on the hub page. Individual level pages have `LearningResource` schema.
- **Meta tags:** Unique `<title>` and `<meta name="description">` per page. Open Graph tags for social sharing.
- **Sitemap:** Auto-generated `sitemap.xml` via Next.js built-in support.
- **Robots:** `robots.txt` allows all crawlers. Admin pages excluded via `noindex` meta tag.

### Monitoring

- **Error logging:** Unhandled errors caught by Next.js error boundary. Log to stdout (Docker logs).
- **Health check:** `GET /api/health` returns `{ status: "ok", db: "connected", timestamp: "..." }`. Used by Docker health check and external uptime monitor.
- **Backup:** Quest tables are covered by the existing daily Postgres backup (postgres-backup container, 30-day retention).

### Browser Support

| Browser       | Version | Priority  |
| ------------- | ------- | --------- |
| Chrome        | 90+     | Primary   |
| Firefox       | 90+     | Primary   |
| Safari        | 15+     | Secondary |
| Edge          | 90+     | Secondary |
| Mobile Chrome | 90+     | Secondary |
| Mobile Safari | 15+     | Secondary |

---

## Appendix A: Game Type Reference

These 8 game types exist in v1 and must be preserved in v2 with identical gameplay mechanics.

| Game Type             | Description                                                                        | Input (game_config)                                                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `speed-quiz`          | Timed multiple-choice questions. Score based on speed + accuracy.                  | `{ questions: [{ question, options: string[], correct: number, explanation }], timeLimit: number }`                                              |
| `pipeline-builder`    | Drag-and-drop to arrange pipeline stages in correct order.                         | `{ stages: [{ id, label, description }], correctOrder: string[], distractors?: string[] }`                                                       |
| `code-debugger`       | Find and fix bugs in code snippets. Multiple choice for the fix.                   | `{ code: string, language: string, bugs: [{ line: number, description, options: string[], correct: number }] }`                                  |
| `concept-matcher`     | Match terms to definitions (drag-and-drop or click pairs).                         | `{ pairs: [{ term: string, definition: string }], distractors?: string[] }`                                                                      |
| `parameter-tuner`     | Adjust model/pipeline parameters to hit a target metric.                           | `{ parameters: [{ name, min, max, optimal, tolerance }], target: { metric, value }, simulator: string }`                                         |
| `diagnosis-lab`       | Given symptoms (logs, metrics, errors), diagnose the root cause.                   | `{ scenario: string, symptoms: string[], options: [{ diagnosis, isCorrect, explanation }] }`                                                     |
| `cost-optimizer`      | Choose infrastructure/model configurations to minimize cost while meeting SLA.     | `{ constraints: { latency, accuracy, budget }, options: [{ name, cost, latency, accuracy }], optimal: string }`                                  |
| `architecture-battle` | Compare two architectures. Choose the better one for a given scenario and justify. | `{ scenario: string, optionA: { name, description, pros, cons }, optionB: { name, description, pros, cons }, correct: 'A' \| 'B', explanation }` |

## Appendix B: Content Volume Estimates

| Chapter                  | Levels (v1) | Learn Sections (v2 target) | Estimated Authoring Time |
| ------------------------ | ----------- | -------------------------- | ------------------------ |
| 1: RAG Pipeline          | 10          | 50-70 sections             | 4-6 hours                |
| 2: Local SLM             | 11          | 55-75 sections             | 4-6 hours                |
| 3: ML Monitoring         | 11          | 55-75 sections             | 4-6 hours                |
| 4: Fine-Tuning           | 11          | 55-75 sections             | 4-6 hours                |
| 5: Multimodal + Capstone | 10          | 50-70 sections             | 4-6 hours                |
| **Total**                | **53**      | **265-365 sections**       | **20-30 hours**          |

The 20-30 hours of content authoring is the largest time investment and can be spread over multiple weeks. The platform itself (Phases 0-3) is estimated at 16-24 hours of development time.
