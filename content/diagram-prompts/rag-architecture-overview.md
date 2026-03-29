# RAG Architecture Overview

## Prompt for Napkin AI

Create an infographic showing the complete RAG (Retrieval-Augmented Generation) pipeline as a left-to-right flow diagram with 5 main stages:

1. **Document Ingestion** — Raw documents (PDFs, web pages, databases) enter the system. Show 3 document icons feeding into a single arrow.

2. **Chunking & Embedding** — Documents are split into chunks, then each chunk is converted into a vector embedding by an embedding model. Show a document being split into 4 smaller pieces, then an arrow labeled "Embedding Model" pointing to numeric vectors like [0.23, 0.87, ...].

3. **Vector Store** — Embeddings are stored in a vector database. Show a cylinder/database icon labeled "Vector DB" with dots inside representing stored vectors.

4. **Retrieval** — A user query enters, gets embedded, and the top-k most similar chunks are retrieved from the vector store. Show a search icon with dotted lines connecting to 3 highlighted chunks inside the vector store.

5. **Generation** — Retrieved chunks plus the original query are sent to an LLM as context. The LLM produces a grounded answer. Show the LLM box receiving two inputs (query + retrieved context) and outputting an answer box.

Add a small annotation at the bottom: "Without RAG, the LLM only has training data. With RAG, it has access to your private, up-to-date documents."

## Style Instructions

Use navy-purple (#1c1535) and gold (#ffb800) color scheme, clean modern style, no gradients, rounded corners, DM Sans font for labels, minimum 12px text. Use gold for arrows and highlights, navy-purple for boxes and backgrounds, white for text on dark backgrounds.

## Expected Output

A horizontal pipeline infographic with 5 clearly labeled stages connected by gold arrows. Each stage has an icon and a short description. The flow reads naturally left-to-right: Documents -> Chunks -> Vectors -> Retrieval -> Answer. The bottom annotation provides the "why RAG matters" takeaway.
