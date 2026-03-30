# Content Audit: Level 1 — "What is RAG?"

> Audit date: 2026-03-30
> Scope: All 11 learn sections in sort_order sequence, plus hook, game_config, and key_insight
> Auditor: Claude Code content audit pass
> Last updated: 2026-03-30 — Fix L3 (analogy rewrites) and Fix 9 (card reorder) applied

---

## 1. Term First-Appearance vs Definition Table

The table below lists every distinct technical term found in Level 1 content, the card where it **first appears** (by sort_order), and the card where it is **meaningfully explained** (defined).

The hook and SpeedQuiz game are encountered by the learner before any learn section, so they are listed as sort_order 0 for first-appearance purposes.

| Term                                 | First Appears (card)                                                | Defined / Explained In                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| RAG / Retrieval-Augmented Generation | sort_order 0 (hook + quiz)                                          | sort_order 3 (text card)                                                                                   |
| Fine-tuning                          | sort_order 0 (quiz options)                                         | sort_order 3 (text card, partial); sort_order 4 analogies (Config File / Runtime Props)                    |
| Hallucination                        | sort_order 0 (quiz explanation)                                     | sort_order 3 (text card)                                                                                   |
| Keyword search                       | sort_order 0 (hook + quiz title)                                    | sort_order 2 (prediction reveal); sort_order 9 (comparison)                                                |
| Semantic search                      | sort_order 2 (prediction title + options)                           | sort_order 2 (prediction reveal)                                                                           |
| Embedding / embedding vector         | sort_order 1 (pipeline diagram — "Embed Query" node)                | sort_order 3 (text, brief mention); sort_order 4 (analogy: Hash Function → Embedding Model)                |
| 768-dim / 1536-dim vector            | sort_order 1 (pipeline node description)                            | sort_order 4 (analogy: Hash Function → Embedding Model)                                                    |
| Embedding model                      | sort_order 1 (pipeline node description)                            | sort_order 4 (analogy: Hash Function / Tokenization → Embedding Model)                                     |
| Vector / high-dimensional space      | sort_order 1 (pipeline node description)                            | sort_order 4 (analogy cards)                                                                               |
| Vector store / vector database       | sort_order 1 (pipeline node description — "Vector Search")          | sort_order 3 (text, single sentence); sort_order 4 (analogy: SQL Index / DevTools → Vector Database)       |
| Top-K chunks                         | sort_order 1 (pipeline node description)                            | Never explicitly defined; implied by sort_order 5 exploration label                                        |
| Cosine similarity                    | sort_order 1 (pipeline node: "highest cosine similarity")           | sort_order 2 (prediction reveal — ~0.89 cosine similarity); sort_order 4 (breakPoint of SQL Index analogy) |
| Chunks                               | sort_order 1 (pipeline node: "top-K chunks")                        | Never defined in Level 1 (defined fully in Level 2)                                                        |
| LLM (Large Language Model)           | sort_order 0 (quiz options)                                         | sort_order 3 (text card — "Large Language Models")                                                         |
| Context window                       | sort_order 0 (quiz explanation: "far beyond any context window")    | Never explicitly defined in Level 1                                                                        |
| Prompt (augmented prompt)            | sort_order 1 (pipeline node: "Augment Prompt")                      | sort_order 3 (text, implied); sort_order 4 (analogy: Middleware / Dependency Injection)                    |
| Grounded / grounding                 | sort_order 1 (pipeline node: "grounded")                            | sort_order 3 (text card — "grounded in real, up-to-date data")                                             |
| Knowledge base                       | sort_order 0 (hook)                                                 | Not formally defined; used as plain English throughout                                                     |
| Re-indexing                          | sort_order 0 (quiz explanation: "index updates without retraining") | sort_order 11 (prediction reveal)                                                                          |
| Re-ranking                           | sort_order 8 (prediction reveal: "Cohere Rerank, cross-encoders")   | Never defined in Level 1 (defined in Level 6)                                                              |
| Cross-encoders                       | sort_order 8 (prediction reveal)                                    | Never defined in Level 1 (defined in Level 6)                                                              |
| pgvector                             | sort_order 3 (text — "B-tree index... vector index")                | sort_order 4 (SQL Index analogy bridgeText); sort_order 5 (exploration node detail)                        |
| B-tree index                         | sort_order 3 (text — Enterprise Skills Bridge)                      | sort_order 3 (explained inline: "O(log n) instead of O(n)")                                                |
| HNSW                                 | sort_order 4 (SQL Index breakPoint)                                 | sort_order 4 (partial: "approximate nearest neighbor algorithms like HNSW or IVF")                         |
| IVF                                  | sort_order 4 (SQL Index breakPoint)                                 | sort_order 4 (partial: "ANN algorithms like HNSW or IVF")                                                  |
| ANN (Approximate Nearest Neighbor)   | sort_order 4 (SQL Index breakPoint)                                 | sort_order 4 (partial definition in same breakPoint)                                                       |
| Cosine similarity (repeated)         | sort_order 1                                                        | Partially explained sort_order 4 (Redis Cache breakPoint)                                                  |
| Subword tokens                       | sort_order 4 (Tokenization analogy bridgeText)                      | Not defined; assumes familiarity with tokenization internals                                               |
| Neural network layers                | sort_order 4 (Tokenization analogy bridgeText)                      | Not defined in Level 1                                                                                     |
| JWT tokens                           | sort_order 5 (exploration node detail)                              | Not defined; domain-specific backend knowledge                                                             |
| Exponential backoff                  | sort_order 5 (exploration node detail)                              | Not defined; domain-specific backend knowledge                                                             |
| GPT-4o-mini                          | sort_order 5 (exploration node detail)                              | Not defined; assumed known                                                                                 |
| text-embedding-3-small               | sort_order 5 (exploration node detail)                              | Not defined; assumed known                                                                                 |
| Lost in the Middle                   | sort_order 8 (prediction reveal)                                    | Explained inline at sort_order 8 (cite Liu et al. 2023)                                                    |
| Prompt engineering                   | sort_order 0 (quiz option)                                          | Never defined in Level 1                                                                                   |
| In-context learning                  | sort_order 0 (quiz option)                                          | Never defined in Level 1                                                                                   |
| Few-shot examples                    | sort_order 0 (quiz option)                                          | Never defined in Level 1                                                                                   |
| SQL Server full-text indexes         | sort_order 10 (callout)                                             | Not defined; assumed prior enterprise knowledge                                                            |
| Tokenizer/analyzer                   | sort_order 10 (callout)                                             | Not defined; assumed prior enterprise knowledge                                                            |
| Weights (model weights)              | sort_order 0 (quiz: "bake knowledge into weights")                  | Partially in sort_order 4 breakPoints (Runtime Props analogy)                                              |
| BM25                                 | Never appears in Level 1                                            | N/A                                                                                                        |

---

## 2. Flagged Items

### 2A. Terms Used Before Their Definition Card

These terms appear before sort_order 3 (the first explanatory text card) — meaning the learner encounters them in the pipeline diagram or prediction card without prior explanation.

| #   | Term                            | First-Appearance Card                        | Definition Card                                                  | Flag                                                                                                                                                                                                                                                                                                                                                      |
| --- | ------------------------------- | -------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Embedding / embedding vector    | sort_order 1 (pipeline node description)     | sort_order 4                                                     | **Fix in Phase 3** — Node description says "Convert query to a 768-dim or 1536-dim vector using an embedding model" with no prior context for what a vector is                                                                                                                                                                                            |
| 2   | Vector store                    | sort_order 1 (pipeline node: "vector store") | sort_order 3 (brief), sort_order 4 (analogy)                     | **Fix in Phase 3** — The term appears in the pipeline node before any definition                                                                                                                                                                                                                                                                          |
| 3   | Top-K chunks                    | sort_order 1 (pipeline node)                 | Never defined in Level 1                                         | **Fix in Phase 3** — "chunks" is a Level 2 concept; no definition ever given in Level 1                                                                                                                                                                                                                                                                   |
| 4   | Cosine similarity               | sort_order 1 (pipeline node)                 | sort_order 2 (partial), sort_order 4 (partial)                   | **Fix in Phase 3** — Used in a node description before it is explained anywhere                                                                                                                                                                                                                                                                           |
| 5   | Semantic search                 | sort_order 2 (prediction title/options)      | sort_order 2 (prediction reveal only — after student must guess) | **Already OK** — The prediction card is designed to elicit the student's guess first; the reveal explains it. This is intentional pedagogy.                                                                                                                                                                                                               |
| 6   | Cosine similarity score (~0.89) | sort_order 2 (prediction reveal)             | sort_order 4 (analogy breakPoints)                               | **Fix in Phase 3** — The reveal cites "~0.89 cosine similarity" as if the learner already knows what that scale means                                                                                                                                                                                                                                     |
| 7   | LLM                             | sort_order 0 (quiz options)                  | sort_order 3                                                     | **Already OK** — "LLM" is a prerequisite-level term for this chapter; it appears in the level hook before any quiz option.                                                                                                                                                                                                                                |
| 8   | Fine-tuning                     | sort_order 0 (quiz options and explanations) | sort_order 3/4                                                   | **Fix in Phase 3** — Multiple quiz explanations assume the learner understands fine-tuning before the text card explains it. The quiz is meant to be post-reading in game flow, but if learn sections appear first, the quiz is encountered after. However the quiz appears BEFORE learn sections in the full UX — this needs verification with the team. |
| 9   | Context window                  | sort_order 0 (quiz explanation)              | Never defined in Level 1                                         | **Fix in Phase 3** — "far beyond any context window" in quiz explanation; undefined term                                                                                                                                                                                                                                                                  |

### 2B. Cross-Level Forward References in Analogy Card (sort_order 4)

Checking each analogy's bridgeText and breakPoint for terms belonging to Levels 2-10.

| #   | Analogy                          | Field      | Term                                                                 | Belongs To                       | Flag                                                                                                                                                                                                                                                          |
| --- | -------------------------------- | ---------- | -------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 10  | SQL Index → Vector Database      | breakPoint | "approximate nearest neighbor (ANN) algorithms like HNSW or IVF"     | Level 4 (Vector Databases)       | **FIXED (Fix L3)** — Replaced with "approximate matching — they find the closest meanings rather than exact values, trading perfect recall for speed." No algorithm names.                                                                                    |
| 11  | SQL Index → Vector Database      | breakPoint | "cosine similarity in 768+ dimensions"                               | Level 3 (Embedding Models)       | **FIXED (Fix L3)** — Replaced "cosine similarity in 768+ dimensions" with "how similar two meanings are, not a simple value comparison." Level 3 forward reference removed.                                                                                   |
| 12  | Hash Function → Embedding Model  | bridgeText | "text-embedding-3-small gives you 1536 floats"                       | Level 3 (Embedding Models)       | **Already OK** — Specific model name adds helpful concreteness. The analogy is appropriate for the background (backend). The 1536 floats detail supports the hash → embedding bridge.                                                                         |
| 13  | Tokenization → Embedding Model   | bridgeText | "subword tokens, then transforms them through neural network layers" | Level 3 / ML fundamentals        | **FIXED (Fix L3)** — Replaced with "Think of it as breaking text into the smallest meaningful pieces (like how 'cannot' becomes ['can', 'not']), then mapping those pieces into a space where similar meanings end up close together." No ML-internal jargon. |
| 14  | Redis Cache → Vector Store       | breakPoint | "HNSW"                                                               | Level 4 (Vector Databases)       | **FIXED (Fix L3)** — Replaced with "meaning-based retrieval rather than exact key lookup." No algorithm names.                                                                                                                                                |
| 15  | localStorage → Vector Store      | breakPoint | "HNSW graphs, IVF indexes"                                           | Level 4 (Vector Databases)       | **FIXED (Fix L3)** — Replaced with "specialized similarity-search data structures (covered in Level 4) that have no browser equivalent."                                                                                                                      |
| 16  | Config File → RAG vs Fine-tuning | breakPoint | "model's behavior and capabilities" / "new skill" distinction        | Level 4 (Fine-Tuning, Chapter 4) | **Already OK** — The breakPoint distinguishes config-change from capability-change. This is a high-level concept appropriate at Level 1 for the RAG-vs-fine-tuning decision frame.                                                                            |
| 17  | Dependency Injection → RAG       | bridgeText | "inject relevant chunks into its prompt"                             | OK — chunks used loosely         | **Already OK** — "chunks" is used informally as plain English here ("pieces of documents"), not as the technical Level 2 term "chunk" with specific size/overlap meaning.                                                                                     |

### 2C. Analogy bridgeText Using Jargon Without "Think of it as..." Framing

Per the audit brief: flag bridgeText that uses undefined jargon without human-context framing.

| #   | Analogy                             | Jargon in bridgeText                                                                                   | Has Human Context Framing?                                                                       | Flag                                                                                                                                                                                                                                              |
| --- | ----------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 18  | SQL Index → Vector Database         | "O(log n) instead of full table scans"                                                                 | Yes — explains what it means immediately after                                                   | **Already OK** — Backend background is appropriate; O(log n) is familiar to backend devs                                                                                                                                                          |
| 19  | SQL Index → Vector Database         | "pgvector literally adds this capability to Postgres"                                                  | Yes — bridges familiar (Postgres) to new                                                         | **Already OK**                                                                                                                                                                                                                                    |
| 20  | Tokenization (JS) → Embedding Model | "subword tokens, then transforms them through neural network layers into a single vector"              | No — neither "subword tokens" nor "neural network layers" have a "Think of it as..." explanation | **FIXED (Fix L3)** — bridgeText rewritten to: "Think of it as breaking text into the smallest meaningful pieces (like how 'cannot' becomes ['can', 'not']), then mapping those pieces into a space where similar meanings end up close together." |
| 21  | Config File → RAG vs Fine-tuning    | "curate data, train for hours, evaluate, deploy the new model weights"                                 | Partial — the docker image metaphor covers the process flow                                      | **Already OK** — Model weights are new jargon, but the Docker image analogy makes the concept accessible                                                                                                                                          |
| 22  | Runtime Props → RAG vs Fine-tuning  | "Fine-tuning literally rewrites the model's neural network weights, changing its fundamental behavior" | Partial — the build-time analogy provides structural context                                     | **FIXED (Fix L3)** — breakPoint rewritten to: "think of it as the difference between configuring an app at runtime versus rebuilding it with new defaults baked in." "Neural network weights" removed.                                            |
| 23  | Middleware Pipeline → RAG           | "embedding similarity scores" in breakPoint                                                            | No framing — used as if understood                                                               | **FIXED (Fix L3)** — breakPoint rewritten to add: "think of it as: each document in your index has a meaning-fingerprint, and the retriever ranks documents by how closely their fingerprint matches your query's fingerprint."                   |
| 24  | Redis Cache → Vector Store          | "approximate nearest neighbor search (O(log n) with HNSW)"                                             | No framing                                                                                       | **FIXED (Fix L3)** — breakPoint rewritten to: "meaning-based retrieval rather than exact key lookup — there is no key, only vectors that are more or less similar to your query." ANN + HNSW removed.                                             |
| 25  | localStorage → Vector Store         | "HNSW graphs, IVF indexes"                                                                             | No framing                                                                                       | **FIXED (Fix L3)** — breakPoint rewritten to: "specialized similarity-search data structures (covered in Level 4) that have no browser equivalent." HNSW/IVF removed.                                                                             |

### 2D. Prediction Reveal Issues (Cards Before Definition Card)

| #   | Card                                          | Issue                                                                                                                                                                                                                                                                                              | Flag                                                                                                                                                                                                                                  |
| --- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 26  | sort_order 2 (Keyword vs Semantic prediction) | Reveal says "Semantic search converts both to embedding vectors and measures meaning-similarity — 'login failures' and 'authentication error recovery' are semantically close (~0.89 cosine similarity)." The learner has not seen "embedding vectors" or cosine similarity defined at this point. | **Fix in Phase 3** — Add a brief "(more on this in the next card)" or replace the cosine score with a simpler description: "They are semantically close — meaning the model recognizes they describe the same problem."               |
| 27  | sort_order 8 (Bad Chunks prediction)          | Reveal introduces "re-ranking (Cohere Rerank, cross-encoders)" as the solution. These are Level 6 terms.                                                                                                                                                                                           | **Fix in Phase 3** — The reveal should say "...this is why production RAG systems use re-ranking (a filtering step that scores each retrieved chunk for relevance — covered in Level 6)" rather than citing vendor names unexplained. |

### 2E. familiarConcept Appropriateness for Named Background

| #   | Analogy            | Background | familiarConcept                    | Appropriate?                                                                                                                         | Flag                                                                                                                                                                                                     |
| --- | ------------------ | ---------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 28  | Vector Database    | backend    | SQL Index (B-tree)                 | Yes — universal backend knowledge                                                                                                    | **Already OK**                                                                                                                                                                                           |
| 29  | Vector Database    | frontend   | Browser DevTools Search            | Yes — every frontend dev uses Cmd+F                                                                                                  | **Already OK**                                                                                                                                                                                           |
| 30  | Embedding Model    | backend    | Hash Function                      | Yes — backend devs work with SHA-256 regularly                                                                                       | **Already OK**                                                                                                                                                                                           |
| 31  | Embedding Model    | frontend   | Tokenization (JS parsing)          | Partial — JS tokenization is well-known but the analogy leans into "neural network layers" which is NOT a frontend concept           | **Fix in Phase 3** — The familiar concept is fine, but the bridgeText overshoots the frontend background by introducing ML internals. Either simplify the bridgeText or change background to "fullstack" |
| 32  | RAG vs Fine-tuning | devops     | Config File vs Docker Image        | Yes — canonical DevOps analogy, excellent fit                                                                                        | **Already OK**                                                                                                                                                                                           |
| 33  | RAG vs Fine-tuning | frontend   | Runtime Props vs Build-time Static | Yes — React-specific, very appropriate for frontend background                                                                       | **Already OK**                                                                                                                                                                                           |
| 34  | RAG (general)      | frontend   | Dependency Injection               | Partial — DI is a pattern React devs know (Context/props), but DI as a term is more backend/OOP. bridgeText explains it well enough. | **Already OK**                                                                                                                                                                                           |
| 35  | RAG (general)      | backend    | Middleware Pipeline                | Yes — Express middleware is canonical backend knowledge                                                                              | **Already OK**                                                                                                                                                                                           |
| 36  | Vector Store       | backend    | Redis Cache                        | Yes — backend devs universally know Redis                                                                                            | **Already OK**                                                                                                                                                                                           |
| 37  | Vector Store       | frontend   | localStorage Cache                 | Yes — frontend devs know localStorage deeply                                                                                         | **Already OK**                                                                                                                                                                                           |

### 2F. Missing Definitions — Terms Never Defined in Level 1

These terms appear in Level 1 but are never defined anywhere within it and are not prerequisites:

| #   | Term                                               | Appears In                       | Flag                                                                                                                                                                                                                |
| --- | -------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 38  | `chunks` (technical concept: sized text fragments) | sort_order 1, 5 (as "chunks")    | **Fix in Phase 3** — A one-sentence tooltip or note at first use: "chunks: segments of your documents, typically 200-500 words, that the system indexes and retrieves." Full definition is Level 2.                 |
| 39  | `context window`                                   | sort_order 0 (quiz explanation)  | **Fix in Phase 3** — Quiz explanation says "far beyond any context window" — add brief parenthetical: "(the maximum text an LLM can read at once)"                                                                  |
| 40  | `re-ranking`                                       | sort_order 8 (prediction reveal) | **Fix in Phase 3** — Introduced in a reveal without definition. Mark as "(covered in Level 6)"                                                                                                                      |
| 41  | `cross-encoders`                                   | sort_order 8 (prediction reveal) | **Fix in Phase 3** — Level 6 forward reference, no framing                                                                                                                                                          |
| 42  | `prompt engineering`                               | sort_order 0 (quiz option)       | **Already OK** — Used as a quiz distractor option; enough context from the quiz question framing. Common general term.                                                                                              |
| 43  | `in-context learning`                              | sort_order 0 (quiz option)       | **Fix in Phase 3** — Quiz option says "In-context learning with full docs in prompt" — uncommon term for learners new to LLMs. Could be rephrased as "Stuffing all documents directly into the prompt" for clarity. |

---

## 3. Summary of Findings

### Sprint 7C Progress

| Sprint                    | Fixes Applied                                                                     | Items Remaining |
| ------------------------- | --------------------------------------------------------------------------------- | --------------- |
| Fix 9 (card reorder)      | **DONE** — text (sort_order 1), prediction (sort_order 2), diagram (sort_order 3) | 0               |
| Fix L3 (analogy rewrites) | **DONE** — 6 analogies rewritten (items #10, #11, #13, #20, #22, #23, #24, #25)   | 0               |

### Fix in Phase 3 (25 items total — 8 FIXED, 17 remain)

| Category                                                         | Total | Fixed | Remaining |
| ---------------------------------------------------------------- | ----- | ----- | --------- |
| Terms used before definition card                                | 7     | 0     | 7         |
| Cross-level forward references (Levels 2-10 concepts in Level 1) | 6     | 6     | 0         |
| Analogy bridgeText: jargon without "Think of it as..." framing   | 5     | 5     | 0         |
| Prediction reveal: uses undefined terms                          | 2     | 0     | 2         |
| Terms never defined in Level 1                                   | 5     | 0     | 5         |

**Total: 25 items — 11 FIXED (Fix L3 + Fix 9), 14 remain for future sprints**

> Note: Fix 9 (card reorder) is a structural fix, not counted in the 25 content-issue items above.

### Already OK (17 items)

Items that initially seemed risky but are intentional or self-contained:

- Semantic search in sort_order 2 — prediction card design intentionally tests before teaching
- LLM — prerequisite knowledge for this chapter
- text-embedding-3-small concrete name — helpful specificity, not jargon problem
- Config/Docker DevOps analogy breakPoint — appropriate level of detail
- Most familiarConcept↔background pairings — well-matched
- "Lost in the Middle" — explained inline with citation at point of use
- prompt engineering and knowledge base — general terms with sufficient plain-language context

---

## 4. Prioritized Fix List for Phase 3

### P1 — Fix Before Any Learner Reaches Card (Blocking Comprehension)

1. **Card 1 (pipeline diagram) — "Embed Query" node**: Add 1-sentence tooltip: "An embedding model converts text into a list of numbers (a vector) that represents its meaning in mathematical space."
2. **Card 1 (pipeline diagram) — "Vector Search" node**: Replace "vector store" with "a database optimized for finding similar meanings" on first use. Add "(called a vector store — explained in Level 4)" after.
3. **Card 1 (pipeline diagram) — "top-K chunks"**: Change to "top-5 most relevant document segments (called chunks — covered in Level 2)" for Level 1 only.
4. **Card 1 (pipeline diagram) — "cosine similarity"**: Replace "highest cosine similarity" with "highest meaning-similarity score" in node description for Level 1.
5. **Card 2 (prediction reveal) — cosine score**: Replace "~0.89 cosine similarity" with "highly semantically similar" or add "(a 0-1 similarity score where 1.0 = identical meaning)".

### P2 — Fix Cross-Level Jargon in Analogy BreakPoints

6. ~~**Analogy 1 breakPoint (SQL Index → Vector DB)**: Replace "ANN algorithms like HNSW or IVF" with "specialized approximate-match algorithms (explored in Level 4)".~~ **FIXED (Fix L3)**
7. ~~**Analogy 4 bridgeText (Tokenization → Embedding Model)**: Add "Think of it as..." framing for "subword tokens" and remove "neural network layers" or replace with "a trained translation function".~~ **FIXED (Fix L3)**
8. **Analogy 4 breakPoint (Tokenization → Embedding Model)**: Already acceptable but consider simplifying "continuous floating-point values" for frontend audience.
9. ~~**Analogy 9 breakPoint (Redis → Vector Store)**: Replace "O(log n) with HNSW" with "fast approximate matching (vs Redis's exact key lookup)" for this Level 1 context.~~ **FIXED (Fix L3)**
10. ~~**Analogy 10 breakPoint (localStorage → Vector Store)**: Replace "HNSW graphs, IVF indexes" with "specialized similarity-search data structures (covered in Level 4)".~~ **FIXED (Fix L3)**
11. ~~**Analogy 6 breakPoint (Runtime Props → Fine-tuning)**: Add framing: "Think of model weights like compiled machine code — not config you can edit at runtime, but the program itself."~~ **FIXED (Fix L3)**
12. ~~**Analogy 8 breakPoint (Middleware → RAG)**: Add framing for "embedding similarity scores": "Think of it as: each document in your index has a meaning-fingerprint; the retriever ranks documents by how closely their fingerprint matches your query's fingerprint."~~ **FIXED (Fix L3)**

### P3 — Fix Game Config and Prediction Reveals

13. **Quiz explanation (Question 5)**: Add "(the maximum text an LLM can read in one request)" after "context window".
14. **Card 8 prediction reveal**: Change "re-ranking (Cohere Rerank, cross-encoders)" to "a filtering step called re-ranking — covered in Level 6 — that scores each retrieved chunk for actual relevance before sending to the LLM".
15. **Quiz option (Question 4)**: "In-context learning with full docs in prompt" → "Paste all documents directly into the prompt (in-context learning)".

### P4 — Minor Polish

16. **Card 10 callout (Enterprise Skills Bridge)**: "tokenizer/analyzer" is Enterprise jargon — add "(the text preprocessing component)" for completeness.
17. **Card 3 text**: The inline Enterprise Skills Bridge at the end of the text card uses "B-tree index" before the analogy card introduces it — this is fine since it explains O(log n) inline, but could add "(a common database index type)" for learners without SQL background.

---

---

## 5. Fix 9: Card Reorder — Applied 2026-03-30

**Status: DONE**

Changed sort_order values in `seed/chapter1-rag.json` Level 1 learn_sections:

| Section                                                 | Old sort_order | New sort_order   |
| ------------------------------------------------------- | -------------- | ---------------- |
| text ("What is RAG?")                                   | 3              | 1                |
| prediction ("Keyword vs Semantic")                      | 2              | 2 (unchanged)    |
| diagram ("The RAG Pipeline")                            | 1              | 3                |
| analogy, explorations, comparison, callout, predictions | 4-11           | 4-11 (unchanged) |

Rationale: Text orientation first ensures learners have conceptual grounding before the pipeline diagram introduces "Embed Query", "Vector Search", and other terms.

---

_End of audit. 25 items flagged for Phase 3 fix. 11 FIXED (8 by Fix L3 + Fix 9 card reorder), 14 remain. 17 items confirmed as intentional or self-contained._
