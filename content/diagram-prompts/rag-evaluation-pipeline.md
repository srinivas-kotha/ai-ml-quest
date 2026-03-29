# RAG Evaluation Pipeline

## Prompt for Napkin AI

Create an infographic showing the complete RAG evaluation pipeline with metrics at each stage. The diagram has a horizontal pipeline at the top and a metrics dashboard below:

**Top Section: Pipeline Stages (left to right)**

Stage 1 — **Question**: A test question enters the system. Example: "What year was the Eiffel Tower built?"

Stage 2 — **Retrieval**: The system retrieves chunks from the vector store. Show 4 retrieved chunks, 3 highlighted as relevant (green check) and 1 as irrelevant (red X).

Stage 3 — **Context Assembly**: Retrieved chunks are assembled into a context window for the LLM. Show the 3 relevant chunks being concatenated.

Stage 4 — **Generation**: The LLM produces an answer. Show: "The Eiffel Tower was built in 1889."

Stage 5 — **Ground Truth**: Compare the generated answer against a known correct answer. Show the ground truth: "1889" with a checkmark.

**Bottom Section: Metrics Dashboard (3 columns)**

Column 1 — **Retrieval Metrics**:

- Context Precision: What fraction of retrieved chunks are actually relevant? Show: 3/4 = 0.75
- Context Recall: What fraction of all relevant chunks were retrieved? Show: 3/3 = 1.0
- Visual: A precision-recall bar chart

Column 2 — **Generation Metrics**:

- Faithfulness: Is the answer supported by the retrieved context (not hallucinated)? Show: 1.0 (fully grounded)
- Answer Relevancy: Does the answer actually address the question? Show: 0.95
- Visual: A gauge/dial showing faithfulness score

Column 3 — **End-to-End Metrics**:

- Answer Correctness: Does the answer match the ground truth? Show: 1.0
- Latency: Total time from question to answer. Show: 1.2s
- Cost: Token usage and API cost per query. Show: $0.003
- Visual: A simple scorecard

Add a footer: "Evaluate with RAGAS or DeepEval. Run on 50-100 test questions minimum. Track metrics over time to catch regressions."

## Style Instructions

Use navy-purple (#1c1535) and gold (#ffb800) color scheme, clean modern style, no gradients, rounded corners, DM Sans font for labels, minimum 12px text. Use gold for passing scores and checkmarks. Use a muted red (#ff4444) for the irrelevant chunk and failing metrics. The metrics dashboard should use gold accent bars/gauges on a navy background.

## Expected Output

A two-part infographic: the top half shows a concrete example flowing through the RAG pipeline with pass/fail annotations at each stage, and the bottom half is a metrics dashboard organized by evaluation category (retrieval, generation, end-to-end). The combination teaches both WHAT to measure and WHERE in the pipeline each metric applies. The footer gives actionable next steps for implementation.
