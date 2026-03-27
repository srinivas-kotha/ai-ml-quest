# AI/ML Quest — Interactive Learning Platform

## Project Overview

54-level interactive learning game for AI/ML engineers. Pure vanilla JS, no frameworks, no build tools.
Live at: https://quest.srinivaskotha.uk

## Tech Stack

- Vanilla JavaScript (ES6 classes, no build tools)
- Semantic HTML5 (each chapter = self-contained HTML file)
- CSS Custom Properties (design tokens in shared.css)
- Canvas API (particle effects), Web Audio API (game sounds)
- LocalStorage (progress persistence, key: `aiquest_state`)
- Docker (nginx:alpine static hosting)

## File Structure

```
index.html              — Hub dashboard with chapter cards
chapter1-rag.html       — Chapter 1: Production RAG Pipeline (10 levels)
chapter2-slm.html       — Chapter 2: Local SLM with Ollama (10 levels)
chapter3-monitoring.html — Chapter 3: ML Monitoring & Observability (10 levels)
chapter4-finetuning.html — Chapter 4: Fine-Tuning Mastery (11 levels)
chapter5-multimodal.html — Chapter 5: Real-Time Multimodal AI + Capstone (13 levels)
shared.js               — Game engine (8 game types, state management, HUD, particles)
shared.css              — Design system (colors, layout, responsive, animations)
.improvement-state.json — Daily improvement cycle state tracking (DO NOT deploy)
```

## Chapter Topics (for research targeting)

### Chapter 1: Production RAG Pipeline

- RAG vs fine-tuning decision framework
- Chunking strategies (recursive, semantic, document-aware)
- Embedding models (OpenAI, Cohere, open-source)
- Vector databases (pgvector, Qdrant, Pinecone, Weaviate)
- Hybrid search & retrieval (BM25 + dense)
- Re-ranking (Cohere, cross-encoders)
- RAG evaluation & CI/CD (RAGAS, DeepEval)
- Advanced patterns: GraphRAG, Agentic RAG, RAPTOR
- Production cost & latency optimization

### Chapter 2: Local SLM with Ollama

- Self-hosting economics vs API costs
- GGUF quantization (Q4_K_M, Q5_K_S, etc.)
- llama.cpp internals & inference engine
- Model selection (Qwen, DeepSeek, Phi, Gemma, Mistral)
- Ollama Modelfile mastery (layers, parameters, templates)
- Structured output (JSON mode, grammar constraints)
- Benchmarking & production deployment
- Privacy compliance (HIPAA/GDPR with local models)

### Chapter 3: ML Monitoring & Observability

- Data drift detection (PSI, KS test, Wasserstein)
- Drift taxonomy (concept, covariate, prior probability)
- Evidently AI integration & CI/CD monitoring
- SHAP & LIME explainability
- LLM-specific monitoring (hallucination, toxicity, cost)
- OpenTelemetry + Langfuse for LLM observability
- A/B testing with Thompson Sampling

### Chapter 4: Fine-Tuning Mastery

- When to fine-tune vs RAG vs prompt engineering
- SFT fundamentals (data formatting, loss functions)
- LoRA math & variants (rank selection, alpha tuning)
- QLoRA 4-bit training (bitsandbytes, double quantization)
- DPO preference optimization
- RLHF vs DPO vs ORPO vs SimPO comparison
- Dataset curation & quality filtering
- Production tools (Unsloth, Axolotl, vLLM, TRL)
- Catastrophic forgetting prevention (EWC, replay buffers)

### Chapter 5: Real-Time Multimodal AI + Capstone

- Multimodal landscape (LLaVA, Qwen-VL, MiniCPM-V, GPT-4o)
- CLIP contrastive learning internals
- Whisper streaming & real-time ASR
- Streaming protocols (WebRTC, WebSocket, SSE, gRPC)
- Voice assistant architecture (<1s latency budgets)
- Edge deployment (ONNX Runtime, TensorRT, WebGPU)
- Real-time video (YOLO, SAM, Florence-2)
- GPU multiplexing (MIG, time-slicing, vGPU)
- Graceful degradation patterns
- Capstone system design challenges

## Game Types (8 types in shared.js)

| Type               | Class                | Description                        | Config Fields                                                               |
| ------------------ | -------------------- | ---------------------------------- | --------------------------------------------------------------------------- |
| SpeedQuiz          | `SpeedQuiz`          | 4-option MCQ with timer            | `timePerQuestion`, `questions[{question, options[], correct, explanation}]` |
| ConceptMatcher     | `ConceptMatcher`     | Pair left↔right matching           | `pairs[{left, right}]`                                                      |
| ParameterTuner     | `ParameterTuner`     | Sliders with animated gauges       | `parameters[{name, min, max, optimal, unit}], scenario`                     |
| CodeDebugger       | `CodeDebugger`       | Find bugs in code snippets         | `bugs[{code, language, options[], correct, explanation}]`                   |
| PipelineBuilder    | `PipelineBuilder`    | Drag-and-drop ordering             | `steps[{id, label, description}], correctOrder[]`                           |
| DiagnosisLab       | `DiagnosisLab`       | Diagnose from metric dashboards    | `cases[{scenario, metrics{}, options[], correct, explanation}]`             |
| CostOptimizer      | `CostOptimizer`      | Balance quality/speed/cost sliders | `scenario, dimensions[{name, unit, min, max, optimal}]`                     |
| ArchitectureBattle | `ArchitectureBattle` | Choose correct pattern             | `battles[{scenario, options[{name, description}], correct, explanation}]`   |

## Level Data Structure (template for adding new levels)

```javascript
{
  title: "Level Title",
  subtitle: "One-liner description",
  context: "Background paragraph explaining real-world relevance (100-300 words). Include enterprise examples, real benchmarks, production numbers.",
  gameType: "SpeedQuiz",  // one of the 8 types above
  gameConfig: {
    timePerQuestion: 35,  // SpeedQuiz only
    questions: [
      {
        question: "The scenario question",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct: 0,  // 0-indexed
        explanation: "Why this answer is correct with production reasoning"
      }
    ]
  },
  keyInsight: "One-sentence takeaway for interview prep"
}
```

## Enterprise-Level Research Guidance

When researching improvements, focus on:

1. **Real production examples**: How Netflix, Uber, Airbnb, Microsoft, Google, Spotify, LinkedIn use these technologies
2. **Official documentation**: Framework docs, API references, migration guides
3. **Research papers**: ArXiv papers that introduced key techniques (with citations)
4. **Production benchmarks**: Actual numbers (latency, cost, accuracy, throughput)
5. **Common pitfalls**: What goes wrong in production that tutorials don't cover
6. **Tool comparisons**: Side-by-side analysis with real metrics (not marketing)
7. **Interview relevance**: Questions actually asked at FAANG/top-tier companies

## Design Tokens (shared.css)

```
--rag: #3b82f6        (blue — Chapter 1)
--slm: #8b5cf6        (purple — Chapter 2)
--monitoring: #10b981  (green — Chapter 3)
--finetuning: #f59e0b  (amber — Chapter 4)
--multimodal: #ef4444  (red — Chapter 5)
--capstone: #ec4899    (pink — Capstone)
```

## State File (.improvement-state.json)

This file tracks the daily improvement cycle. Statuses: `proposed` → `approved` → `implementing` → `implemented` | `rejected` | `deferred`

## Git Workflow

- NEVER commit directly to main
- Feature branches: `feat/quest-improve-<proposal-id>`
- PR via `gh pr create` with summary of changes
- Each implementation = one PR per proposal

## Rules for Adding Content

1. Study existing levels in the target chapter before adding new ones
2. Match the exact data structure (see template above)
3. Include 4-6 questions per SpeedQuiz level
4. Every question needs a real-world explanation (not textbook answers)
5. Context paragraphs should include enterprise examples with real numbers
6. `keyInsight` should be memorable and interview-ready
7. New levels are inserted into the `levels` array at the appropriate position
8. Boss levels (gauntlets) are always last — don't add after them
