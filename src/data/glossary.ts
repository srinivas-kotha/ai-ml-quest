export interface GlossaryTerm {
  definition: string;
  example?: string;
}

export const GLOSSARY: Record<string, GlossaryTerm> = {
  vector: {
    definition:
      'A list of numbers that represents the "meaning" of a piece of text.',
    example: '"cat" might become [0.2, 0.8, 0.1, ...]',
  },
  embedding: {
    definition:
      "The process of converting text into a vector — translating words into coordinates in a meaning-space.",
  },
  "cosine similarity": {
    definition:
      "How close two vectors are in direction. 1.0 = identical meaning, 0.0 = unrelated.",
    example: "Like measuring the angle between two arrows",
  },
  "embedding model": {
    definition:
      "A neural network that converts text into vectors. Examples: OpenAI text-embedding-3-small (1536-dim), Cohere embed-v3.",
  },
  chunk: {
    definition:
      "A piece of text (usually a paragraph or section) split from a larger document before embedding.",
  },
  "top-K": {
    definition:
      "The K most relevant chunks retrieved from the vector database. K is typically 3-10.",
  },
  BM25: {
    definition:
      "A keyword search algorithm (Best Match 25). Counts word frequency — ignores meaning.",
  },
  "context window": {
    definition:
      "The maximum amount of text an LLM can process at once. Measured in tokens (roughly words).",
  },
};
