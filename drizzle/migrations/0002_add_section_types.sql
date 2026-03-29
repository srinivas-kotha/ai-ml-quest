-- Add new section types: analogy, exploration, prediction, d2_diagram
ALTER TABLE quest_learn_sections
  DROP CONSTRAINT quest_learn_sections_section_type_check;

ALTER TABLE quest_learn_sections
  ADD CONSTRAINT quest_learn_sections_section_type_check
  CHECK (section_type = ANY (ARRAY[
    'text', 'code', 'diagram', 'comparison', 'steps', 'playground', 'callout',
    'analogy', 'exploration', 'prediction', 'd2_diagram'
  ]));
