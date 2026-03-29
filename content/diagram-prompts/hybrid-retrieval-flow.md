# Hybrid Retrieval Flow

## Prompt for Napkin AI

Create a flowchart infographic showing how hybrid search combines keyword (sparse) and semantic (dense) retrieval in a RAG system. The diagram flows top-to-bottom with a merge in the middle:

**Top: User Query**
A single box at the top labeled "User Query" with an example: "What are the side effects of metformin?"

**Two Parallel Paths (left and right):**

Left path — **Keyword Search (BM25/Sparse)**:

- Box: "Tokenize + TF-IDF weighting"
- Arrow down to: "BM25 Index" (cylinder icon)
- Arrow down to: "Results ranked by exact term matches"
- Show 5 result items, with matches highlighted: "metformin", "side effects" are bolded in the results
- Label: "Good at: exact terms, names, codes, rare words"

Right path — **Semantic Search (Dense)**:

- Box: "Embed query into vector"
- Arrow down to: "Vector Store" (cylinder icon)
- Arrow down to: "Results ranked by meaning similarity"
- Show 5 result items, some using different wording: "adverse reactions of glucophage" ranks high even without exact keyword match
- Label: "Good at: synonyms, paraphrases, conceptual matches"

**Merge: Reciprocal Rank Fusion (RRF)**
Both paths converge into a central box labeled "Reciprocal Rank Fusion". Show the formula: score = sum(1 / (k + rank)) across both result lists. The fused list reranks by combined score.

**Bottom: Final Ranked Results**
Show the merged top-5 results, now combining the strengths of both: exact matches AND semantic matches are represented. Label: "Best of both worlds: precise when terms match, flexible when they don't."

## Style Instructions

Use navy-purple (#1c1535) and gold (#ffb800) color scheme, clean modern style, no gradients, rounded corners, DM Sans font for labels, minimum 12px text. Use gold for the merge/fusion box and final results. Use white-on-navy for the two parallel paths. Arrows connecting the paths to the merge point should be gold.

## Expected Output

A symmetric flowchart with two parallel retrieval paths (keyword left, semantic right) converging at a Reciprocal Rank Fusion step. Each path shows its strengths with concrete examples. The merged output demonstrates why hybrid beats either approach alone. Clean, balanced layout that makes the dual-path architecture immediately understandable.
