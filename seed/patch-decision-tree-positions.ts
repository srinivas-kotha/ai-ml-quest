/**
 * Patch: Fix RAG vs Fine-Tuning Decision Tree node positions.
 * All nodes were at {x:0, y:0}, causing them to overlap in React Flow.
 *
 * Run: tsx seed/patch-decision-tree-positions.ts
 */

import { Pool } from "pg";

const positions: Record<string, { x: number; y: number }> = {
  root: { x: 0, y: 280 },
  "use-rag": { x: 240, y: 80 },
  "task-specific": { x: 240, y: 480 },
  "enterprise-docs": { x: 480, y: 80 },
  "fine-tune": { x: 480, y: 380 },
  "prompt-eng": { x: 480, y: 560 },
  "rag-vector": { x: 720, y: 0 },
  "public-knowledge": { x: 720, y: 160 },
  "labeled-data": { x: 720, y: 380 },
  "rag-web": { x: 960, y: 160 },
  sft: { x: 960, y: 280 },
  "preference-data": { x: 960, y: 480 },
  "dpo-rlhf": { x: 1200, y: 480 },
};

async function main() {
  const client = new Pool({ connectionString: process.env.DATABASE_URL });

  // Find the decision tree learn section (level 1, sort_order 7)
  const result = await client.query<{
    id: number;
    content: Record<string, unknown>;
  }>(
    `SELECT ls.id, ls.content
     FROM quest_learn_sections ls
     JOIN quest_levels ql ON ls.level_id = ql.id
     WHERE ql.slug = 'what-is-rag'
       AND ls.sort_order = 7
       AND ls.section_type = 'exploration'
     LIMIT 1`,
  );

  if (result.rows.length === 0) {
    console.error(
      "Could not find the decision tree section. Ensure the DB is seeded.",
    );
    process.exit(1);
  }

  const row = result.rows[0];
  const content = row.content as {
    nodes: Array<{
      id: string;
      position: { x: number; y: number };
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };

  let updated = 0;
  for (const node of content.nodes) {
    if (node.id in positions) {
      node.position = positions[node.id];
      updated++;
    }
  }

  await client.query(
    `UPDATE quest_learn_sections SET content = $1 WHERE id = $2`,
    [JSON.stringify(content), row.id],
  );

  console.log(`Updated ${updated} node positions in section id=${row.id}`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
