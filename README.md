# AI/ML Quest

**Master AI Engineering Through Interactive Gameplay**

53 levels across 5 domains. Real benchmarks. Real interview prep. Zero boring lectures.

## What Is This?

AI/ML Quest is an interactive learning platform that teaches AI/ML engineering through gameplay, not reading. Every concept is learned by doing — building pipelines, tuning parameters, debugging code, and diagnosing production issues.

Built for experienced software engineers (C#/.NET, Azure, Docker, Kubernetes, microservices) transitioning into AI Engineering. Every level connects enterprise skills you already know to AI/ML equivalents.

## Live Demo

**[quest.srinivaskotha.uk](https://quest.srinivaskotha.uk)**

## Scope & Coverage

### Chapter 1: Production RAG Pipeline (10 levels)

RAG vs fine-tuning decision matrix, chunking strategies (recursive 512 = 69% accuracy winner), embedding models (MTEB leaderboard, Matryoshka truncation), vector databases (pgvector 471 QPS at 50M vectors), hybrid search (BM25 + dense + RRF = 84% precision), re-ranking (cross-encoder +33-40% accuracy), RAGAS evaluation, GraphRAG vs Agentic RAG, production cost optimization ($2.50 → $0.15/request), 20-question interview gauntlet.

### Chapter 2: Local SLM with Ollama (10 levels)

Self-hosted vs API break-even analysis, GGUF quantization (Q4_K_M = 0.15 perplexity loss), llama.cpp internals (KV cache, speculative decoding, Flash Attention), model selection 2025-2026 (Qwen 2.5, DeepSeek-R1, Phi-4), Ollama Modelfile + API mastery, structured output (grammar constraints, Instructor + Pydantic), benchmarking (TTFT vs TPS), deployment patterns (Docker + K8s GPU scheduling), HIPAA/GDPR privacy compliance, 20-question interview gauntlet.

### Chapter 3: ML Monitoring & Observability (10 levels)

Why monitoring is 70% of production AI work, data drift detection (PSI, KS test, Wasserstein distance), drift taxonomy (data/concept/feature/prediction/label), Evidently AI CI/CD integration, SHAP & LIME explainability (EU AI Act compliance), LLM-specific monitoring (token costs, hallucination detection), OpenTelemetry gen_ai tracing with Langfuse, CI/CD regression gating (shadow mode, canary deploys), A/B testing with Thompson Sampling, 20-question interview gauntlet.

### Chapter 4: Fine-Tuning Mastery (11 levels)

When to fine-tune (format vs knowledge), SFT fundamentals (Flash Attention 2, learning rate scheduling), LoRA math (W = W0 + BA, rank selection, alpha scaling), QLoRA 4-bit training (7B = 5GB VRAM), LoRA variants (DoRA +22%, rsLoRA, LoRA+), DPO preference optimization, RLHF vs DPO vs ORPO vs SimPO vs GRPO comparison, dataset curation (Magpie synthetic data), production tools (Unsloth 2-5x, Axolotl, vLLM multi-tenant LoRA), evaluation & catastrophic forgetting, 20-question interview gauntlet.

### Chapter 5: Real-Time Multimodal AI + Capstone (13 levels)

Multimodal landscape (LLaVA, Qwen-VL, MiniCPM), CLIP contrastive learning (InfoNCE, SigLIP, OpenCLIP), Whisper streaming (Distil-Whisper 6.3x faster), streaming protocols (WebRTC vs WebSocket vs SSE vs gRPC), voice assistant architecture (Pipecat, <1s latency budget), edge deployment (ONNX, TensorRT 2-5x, WebGPU), real-time video (YOLO26 <10ms + SAM 2 44 FPS), GPU multiplexing (MIG, time-slicing 90% savings), graceful degradation patterns, 20-question interview gauntlet, 3 capstone levels (systems thinking, portfolio differentiators, system design interview).

## 8 Interactive Game Types

| Game                    | Description                                      |
| ----------------------- | ------------------------------------------------ |
| **Pipeline Builder**    | Drag & drop components to build ML architectures |
| **Speed Quiz**          | Timed interview questions with depth scoring     |
| **Concept Matcher**     | Match concepts to descriptions                   |
| **Parameter Tuner**     | Sliders with real-time animated gauges           |
| **Code Debugger**       | Find bugs in code/config snippets                |
| **Architecture Battle** | Choose the right pattern for scenarios           |
| **Diagnosis Lab**       | Identify root cause from dashboards              |
| **Cost Optimizer**      | Balance quality/speed/cost with real pricing     |

## Enterprise Skills Bridge

| You Already Know                   | AI/ML Equivalent                    |
| ---------------------------------- | ----------------------------------- |
| Azure Monitor + App Insights       | ML Monitoring (Evidently, Langfuse) |
| EF Core + SQL Server               | Vector DB + pgvector + Embeddings   |
| Azure DevOps CI/CD                 | ML CI/CD Regression Gating          |
| Docker + AKS (Kubernetes)          | GPU Containers + Model Serving      |
| ASP.NET Web API + REST             | Model Serving APIs (vLLM, Ollama)   |
| Microservices + Clean Architecture | Modular RAG + ML Pipelines          |

## Progression System

- **XP** earned per correct answer, bonus for speed and streaks
- **Combo multiplier** (2x-5x) for consecutive correct answers
- **Chapter boss** (20-question gauntlet, 80% to pass)
- **Progress persisted** in LocalStorage across sessions
- **Sound effects** via Web Audio API (toggle on/off)
- **Particle celebrations** on level completion

## Tech Stack

- Vanilla JavaScript (no frameworks, no build tools)
- CSS custom properties + backdrop-filter + animations
- Canvas API for particle effects
- Web Audio API for synthesized sounds
- LocalStorage for progress persistence
- Google Fonts (Inter + JetBrains Mono)

## Design

"The Linear Look" + Spatial Depth — inspired by Linear, Vercel, Raycast, and Stripe. Pure dark `#0a0a0f` base with dot-grid pattern, frosted glass game panels, specular border sweeps on hover, chapter-specific accent colors.

## Architecture

```
ai-ml-quest/
  index.html              # Hub dashboard (chapter grid, progress, skills bridge)
  chapter1-rag.html       # 10 RAG levels
  chapter2-slm.html       # 10 SLM levels
  chapter3-monitoring.html # 10 Monitoring levels
  chapter4-finetuning.html # 11 Fine-tuning levels
  chapter5-multimodal.html # 13 Multimodal + Capstone levels
  shared.css              # Design system (1,203 lines)
  shared.js               # Game engine (1,321 lines)
```

## Run Locally

```bash
# No build step needed — just open index.html
open index.html
# Or serve with any static server
npx serve .
```

## License

MIT
