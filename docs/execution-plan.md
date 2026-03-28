# AI/ML Quest v2.0 — Execution Plan

> **Source of Truth:** `docs/prd-v2.md` (phase-evaluator 4.77/5.00 PASS)
> **Rule:** NO deviation from PRD without explicit user approval.
> **Created:** 2026-03-28

---

## Team Structure

| Role                         | Model  | Responsibility                                                   | Isolation    |
| ---------------------------- | ------ | ---------------------------------------------------------------- | ------------ |
| **Architect / Orchestrator** | Opus   | PRD enforcement, quality gates, agent coordination, plan updates | Main context |
| **Database Agent**           | Sonnet | Schema migrations, Drizzle ORM setup, seed data, DB queries      | Worktree     |
| **Backend Agent**            | Sonnet | Next.js API routes, NextAuth, server actions, middleware         | Worktree     |
| **Frontend Agent**           | Sonnet | React components (learn, game, HUD, nav), pages, styling         | Worktree     |
| **Quality Reviewer**         | Sonnet | Code review, security scan, PRD compliance check                 | Read-only    |

### Agent Rules

1. Every agent receives the relevant PRD sections in their prompt
2. Agents use worktree isolation to avoid git conflicts
3. Opus reviews every agent's output before merging
4. Sequential phases — no phase starts until previous passes quality gate
5. Each agent commits to a feature branch, Opus creates PR after review

---

## Phase 0: Setup (~3 hours, 1 session)

**Goal:** Bootable Next.js 15 project with DB schema, seeded Chapter 1, Docker dev environment.

### Tasks

| #   | Task                                                       | Agent    | PRD Section     | Acceptance Criteria                                         |
| --- | ---------------------------------------------------------- | -------- | --------------- | ----------------------------------------------------------- |
| 0.1 | VPS memory baseline                                        | Opus     | Risk mitigation | `docker stats` output shows ≥300MB headroom                 |
| 0.2 | Initialize Next.js 15 + TypeScript + Tailwind + App Router | Frontend | §7, §8          | `npm run build` succeeds, standalone output                 |
| 0.3 | Drizzle ORM setup + DB schema (`quest_*` tables)           | Database | §6              | 7 tables created, indexes applied                           |
| 0.4 | Seed Chapter 1 (10 levels) from v1 static content          | Database | §6, §11         | `SELECT count(*) FROM quest_levels WHERE chapter_id=1` = 10 |
| 0.5 | Dockerfile (multi-stage, standalone) + docker-compose.yml  | Backend  | §7 Docker       | `docker compose up` starts app on port 3003                 |
| 0.6 | `.env.example` with all required vars                      | Backend  | §7 Security     | All vars documented                                         |
| 0.7 | Migration safety: `pg_dump` + dry-run                      | Database | Risk mitigation | Backup taken before schema apply                            |

### Quality Gate 0

- [ ] `npm run build` succeeds
- [ ] Docker container starts and connects to Postgres
- [ ] Seed data queryable via Drizzle
- [ ] No conflicts with existing `kokilla_*`, `sv_*` tables

---

## Phase 1: Core Platform (~9-10 hours, 2-3 sessions)

**Goal:** Auth, progress tracking, all 8 game types, basic learn content rendering.

### Phase 1A: Layout + Navigation + Auth (~3 hours)

| #    | Task                                                             | Agent    | PRD Section  |
| ---- | ---------------------------------------------------------------- | -------- | ------------ |
| 1A.1 | Root layout (Inter + JetBrains Mono fonts, dark theme, metadata) | Frontend | §10          |
| 1A.2 | TopNav with auth controls (sign in / avatar dropdown)            | Frontend | §8 nav/      |
| 1A.3 | Hub page — chapter grid with progress overlay                    | Frontend | §7 Rendering |
| 1A.4 | Chapter page — level list with completion status                 | Frontend | §7 Rendering |
| 1A.5 | NextAuth.js setup (GitHub OAuth provider, JWT strategy)          | Backend  | §7 Auth      |
| 1A.6 | Guest mode with localStorage fallback                            | Frontend | §7 Auth      |
| 1A.7 | API routes: `/api/chapters`, `/api/chapters/[slug]/levels`       | Backend  | §7 API       |

### Phase 1B: Level Page + Learn Panel (~2 hours)

| #    | Task                                                               | Agent    | PRD Section   |
| ---- | ------------------------------------------------------------------ | -------- | ------------- |
| 1B.1 | Level page layout (learn left, game right on desktop)              | Frontend | §7 Rendering  |
| 1B.2 | LearnPanel component (renders sections by type)                    | Frontend | §8 learn/     |
| 1B.3 | MarkdownText renderer (text sections)                              | Frontend | §9            |
| 1B.4 | CalloutBox renderer (enterprise, tip, warning, insight)            | Frontend | §9 CalloutBox |
| 1B.5 | Placeholder renderers for code/diagram/comparison/steps/playground | Frontend | §9            |
| 1B.6 | API route: `/api/levels/[id]` (full level detail + learn sections) | Backend  | §7 API        |

### Phase 1C: Game Types (~4-5 hours)

| #     | Task                                                    | Agent    | PRD Section |
| ----- | ------------------------------------------------------- | -------- | ----------- |
| 1C.1  | GamePanel orchestrator (selects component by game_type) | Frontend | §8 games/   |
| 1C.2  | SpeedQuiz (timed MCQ with score)                        | Frontend | Appendix A  |
| 1C.3  | PipelineBuilder (drag-and-drop ordering)                | Frontend | Appendix A  |
| 1C.4  | CodeDebugger (find bugs in code)                        | Frontend | Appendix A  |
| 1C.5  | ConceptMatcher (pair matching)                          | Frontend | Appendix A  |
| 1C.6  | ParameterTuner (slider gauges)                          | Frontend | Appendix A  |
| 1C.7  | DiagnosisLab (metric diagnosis)                         | Frontend | Appendix A  |
| 1C.8  | CostOptimizer (quality/speed/cost sliders)              | Frontend | Appendix A  |
| 1C.9  | ArchitectureBattle (pattern choice)                     | Frontend | Appendix A  |
| 1C.10 | Game completion → POST `/api/progress`                  | Backend  | §7 API      |
| 1C.11 | XP counter animation + particle burst                   | Frontend | §10 Effects |

**Note:** Port one game type at a time. Test against v1 behavior before proceeding. Budget extra time for drag-and-drop (PipelineBuilder, ConceptMatcher) and Canvas particle effects.

### Quality Gate 1

- [ ] All 8 game types functional with correct scoring
- [ ] Auth flow works (GitHub OAuth + guest mode)
- [ ] Progress saves (DB for authenticated, localStorage for guests)
- [ ] Hub → Chapter → Level navigation complete
- [ ] LearnPanel renders text + callout sections
- [ ] Responsive layout (desktop + mobile)

---

## Phase 2: Rich Content (~8 hours, 2-3 sessions)

**Goal:** All interactive learn components. Chapter 1 enriched. Chapters 2-5 migrated.

### Phase 2A: Interactive Components (~4 hours)

| #    | Task                                                            | Agent    | PRD Section         |
| ---- | --------------------------------------------------------------- | -------- | ------------------- |
| 2A.1 | AnnotatedCode (syntax highlighting + clickable annotations)     | Frontend | §9 AnnotatedCode    |
| 2A.2 | PipelineDiagram (SVG nodes + edges + animation + step-through)  | Frontend | §9 PipelineDiagram  |
| 2A.3 | BeforeAfter (toggle comparison panels)                          | Frontend | §9 BeforeAfter      |
| 2A.4 | StepReveal (progressive step disclosure)                        | Frontend | §9 StepReveal       |
| 2A.5 | SliderPlayground (3 built-in renderers: chunk, cost, dimension) | Frontend | §9 SliderPlayground |

### Phase 2B: Chapter 1 Content Enrichment (~2 hours)

| #    | Task                                                                        | Agent    | PRD Section           |
| ---- | --------------------------------------------------------------------------- | -------- | --------------------- |
| 2B.1 | Write rich learn_sections for all 10 Chapter 1 levels                       | Frontend | §3.2 Lesson Structure |
| 2B.2 | HOOK-SHOW-EXPLAIN-CODE-PRACTICE-TAKEAWAY per level                          | Frontend | §3.2                  |
| 2B.3 | At least 1 PipelineDiagram, 2 AnnotatedCode, 1 SliderPlayground per chapter | Frontend | §11 Phase 2B          |

### Phase 2C: Chapters 2-5 Migration (~2 hours)

| #    | Task                                                       | Agent    | PRD Section  |
| ---- | ---------------------------------------------------------- | -------- | ------------ |
| 2C.1 | Run migrate-v1 script for Chapters 2-5 game content        | Database | §11 Phase 2C |
| 2C.2 | Write basic learn_sections (text + callout) for all levels | Frontend | §11 Phase 2C |
| 2C.3 | Mark all chapters as published                             | Database | §11 Phase 2C |

### Quality Gate 2

- [ ] All 5 interactive components render correctly
- [ ] Chapter 1 has rich content (diagrams, code, playgrounds)
- [ ] Chapters 2-5 migrated with basic learn content
- [ ] All 53 levels accessible and playable

---

## Phase 3: Polish + Deploy (~5 hours, 1-2 sessions)

**Goal:** Production-ready deployment replacing the static site.

### Phase 3A: Admin + Analytics (~2 hours)

| #    | Task                                                  | Agent              | PRD Section |
| ---- | ----------------------------------------------------- | ------------------ | ----------- |
| 3A.1 | Admin page (chapter/level CRUD)                       | Frontend + Backend | §5 P1       |
| 3A.2 | Analytics overview (completion rates, hardest levels) | Frontend + Backend | §5 P1       |
| 3A.3 | Role-based auth guard (admin check)                   | Backend            | §7 Auth     |

### Phase 3B: Performance + SEO (~1 hour)

| #    | Task                                                 | Agent    | PRD Section     |
| ---- | ---------------------------------------------------- | -------- | --------------- |
| 3B.1 | SSG config with `generateStaticParams`               | Frontend | §7 Rendering    |
| 3B.2 | Meta tags, Open Graph, Course schema.org             | Frontend | §14 SEO         |
| 3B.3 | Font optimization + lazy-load interactive components | Frontend | §14 Performance |

### Phase 3C: CI/CD + Deployment (~2 hours)

| #    | Task                                                        | Agent   | PRD Section  |
| ---- | ----------------------------------------------------------- | ------- | ------------ |
| 3C.1 | GitHub Actions workflow (lint + typecheck + build + Docker) | Backend | §11 Phase 3C |
| 3C.2 | Deploy to VPS port 3003 (replace static nginx)              | Backend | §7 Docker    |
| 3C.3 | Smoke test: all chapters load, auth works, progress saves   | Quality | §11 Phase 3C |
| 3C.4 | Keep static v1 container as rollback                        | Backend | §11 Phase 3C |

### Quality Gate 3

- [ ] Lighthouse score > 90 (performance)
- [ ] All chapters load, auth works, progress saves
- [ ] Admin can CRUD content via API
- [ ] CI/CD pipeline passes
- [ ] Production deployed at quest.srinivaskotha.uk

---

## Execution Protocol

### Before Each Phase

1. Opus reads relevant PRD sections
2. Opus briefs agents with exact PRD specs
3. Agents implement in worktree isolation

### After Each Agent Completes

1. Opus reviews diff against PRD requirements
2. Quality reviewer scans for security + patterns
3. If PRD-compliant → merge to feature branch
4. If deviates → send back with specific corrections

### After Each Phase

1. Run quality gate checklist
2. Phase-evaluator scores the implementation
3. User approval before proceeding to next phase

### PRD Amendment Process

1. If implementation reveals PRD needs updating → Opus proposes change
2. User approves/rejects the amendment
3. Only then does the PRD update
4. Never silently deviate
