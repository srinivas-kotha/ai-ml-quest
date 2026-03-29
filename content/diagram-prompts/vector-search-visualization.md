# Vector Search Visualization

## Prompt for Napkin AI

Create an infographic visualizing how vector similarity search works in a RAG system. The diagram has three sections stacked vertically:

**Section 1: "Text to Vector" (top)**
Show three short text snippets on the left:

- "The cat sat on the mat"
- "A kitten rested on the rug"
- "Stock prices rose sharply"

An arrow labeled "Embedding Model" points to the right where each text becomes a point in a 2D scatter plot. The first two texts are plotted close together (they are semantically similar). The third is far away. Label the axes "Dimension 1" and "Dimension 2". Add a note: "Real embeddings have 768-1536 dimensions. This is simplified to 2D."

**Section 2: "Similarity Search" (middle)**
Show the same scatter plot but now with a new query point labeled "Where did the cat sleep?" plotted in gold. Draw concentric dashed circles (like radar rings) radiating from the query point. The two cat/kitten points fall within the inner ring. The stock price point is outside all rings. Label the inner ring "Top-k results (k=2)". Show the cosine similarity scores next to each point: 0.92, 0.89, 0.12.

**Section 3: "Distance Metrics" (bottom)**
Show a small comparison table with 3 rows:

- Cosine Similarity: measures angle between vectors, range 0-1, most common for text
- Euclidean Distance: measures straight-line distance, sensitive to magnitude
- Dot Product: measures both angle and magnitude, fastest to compute

Highlight Cosine Similarity as the recommended default.

## Style Instructions

Use navy-purple (#1c1535) and gold (#ffb800) color scheme, clean modern style, no gradients, rounded corners, DM Sans font for labels, minimum 12px text. The query point and its rings should be gold. Stored vectors should be white dots on navy background. Similar vectors get a subtle gold glow. The dissimilar vector is dimmed/gray.

## Expected Output

A three-section vertical infographic that walks through the complete vector search process: encoding text into vectors, finding nearest neighbors via similarity, and choosing a distance metric. The scatter plot visualization makes the abstract concept of "semantic similarity" concrete and visual. The distance metrics table provides a quick reference.
