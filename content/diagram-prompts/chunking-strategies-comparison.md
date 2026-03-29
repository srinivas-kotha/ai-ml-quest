# Chunking Strategies Comparison

## Prompt for Napkin AI

Create a side-by-side comparison infographic showing 4 different text chunking strategies for RAG systems. Use a 2x2 grid layout where each quadrant shows the same sample document being chunked differently:

**Top-Left: Fixed-Size Chunking**
Show a document split into equal-sized blocks (e.g., every 512 tokens). Draw uniform rectangles of identical height. Label: "Simple, fast, but splits mid-sentence." Pros: Easy to implement, predictable chunk sizes. Cons: Breaks semantic boundaries.

**Top-Right: Sentence-Based Chunking**
Show the same document split at sentence boundaries. Draw rectangles of varying heights. Label: "Respects sentence boundaries." Pros: Preserves complete thoughts. Cons: Inconsistent chunk sizes, single sentences may lack context.

**Bottom-Left: Recursive/Hierarchical Chunking**
Show the document split first by sections (headers), then paragraphs, then sentences as a fallback. Draw a tree structure: Document -> Sections -> Paragraphs -> Sentences. Label: "Splits at natural document structure." Pros: Best semantic coherence. Cons: More complex, depends on document formatting.

**Bottom-Right: Semantic Chunking**
Show the document with colored similarity scores between adjacent sentences. Group sentences with high similarity into the same chunk. Draw a heatmap-style bar next to each sentence pair. Label: "Groups by meaning, not position." Pros: Highest retrieval accuracy. Cons: Requires embedding model at chunk time, slowest.

Add a verdict row at the bottom: "Start with recursive chunking. Move to semantic chunking when retrieval quality plateaus."

## Style Instructions

Use navy-purple (#1c1535) and gold (#ffb800) color scheme, clean modern style, no gradients, rounded corners, DM Sans font for labels, minimum 12px text. Use gold borders for the recommended strategy (recursive). Use light navy for the grid background. Pros in gold text, cons in muted gray.

## Expected Output

A 2x2 grid infographic with each cell showing the same document chunked differently. Each cell has a title, visual representation, one-line description, and pros/cons. A bottom verdict bar highlights the recommended starting strategy. Clean, scannable, easy to compare at a glance.
