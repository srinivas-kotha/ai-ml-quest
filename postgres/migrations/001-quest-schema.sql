-- Migration: 001-quest-schema
-- Description: Create all quest_* tables for AI/ML Quest v2.0
-- All tables use quest_ prefix to coexist with kokilla_*, sv_* tables

-- ============================================================
-- CHAPTERS
-- ============================================================
CREATE TABLE IF NOT EXISTS quest_chapters (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  icon TEXT,
  accent_color TEXT DEFAULT '#3b82f6',
  sort_order INT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  prerequisites JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LEVELS
-- ============================================================
CREATE TABLE IF NOT EXISTS quest_levels (
  id SERIAL PRIMARY KEY,
  chapter_id INT REFERENCES quest_chapters(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  level_number INT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  hook TEXT,
  game_type TEXT NOT NULL,
  game_config JSONB NOT NULL,
  key_insight TEXT,
  xp_reward INT DEFAULT 100,
  estimated_minutes INT DEFAULT 5,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chapter_id, level_number)
);

-- ============================================================
-- LEARN SECTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS quest_learn_sections (
  id SERIAL PRIMARY KEY,
  level_id INT REFERENCES quest_levels(id) ON DELETE CASCADE,
  sort_order INT NOT NULL,
  section_type TEXT NOT NULL CHECK (section_type IN (
    'text', 'code', 'diagram', 'comparison', 'steps', 'playground', 'callout'
  )),
  title TEXT,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS quest_users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  auth_provider TEXT DEFAULT 'github',
  auth_provider_id TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ
);

-- ============================================================
-- USER PROGRESS
-- ============================================================
CREATE TABLE IF NOT EXISTS quest_user_progress (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES quest_users(id) ON DELETE CASCADE,
  level_id INT REFERENCES quest_levels(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  score INT,
  max_score INT,
  attempts INT DEFAULT 0,
  time_spent_seconds INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, level_id)
);

-- ============================================================
-- USER STATS
-- ============================================================
CREATE TABLE IF NOT EXISTS quest_user_stats (
  user_id INT PRIMARY KEY REFERENCES quest_users(id) ON DELETE CASCADE,
  xp INT DEFAULT 0,
  player_level INT DEFAULT 1,
  streak_days INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_active_date DATE,
  total_levels_completed INT DEFAULT 0,
  total_time_seconds INT DEFAULT 0
);

-- ============================================================
-- LEVEL ANALYTICS
-- ============================================================
CREATE TABLE IF NOT EXISTS quest_level_analytics (
  level_id INT PRIMARY KEY REFERENCES quest_levels(id) ON DELETE CASCADE,
  total_attempts INT DEFAULT 0,
  total_completions INT DEFAULT 0,
  avg_score DECIMAL(5,2),
  avg_time_seconds INT,
  drop_off_rate DECIMAL(5,2),
  common_wrong_answers JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_quest_levels_chapter ON quest_levels(chapter_id);
CREATE INDEX IF NOT EXISTS idx_quest_learn_sections_level ON quest_learn_sections(level_id);
CREATE INDEX IF NOT EXISTS idx_quest_user_progress_user ON quest_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quest_user_progress_level ON quest_user_progress(level_id);
CREATE INDEX IF NOT EXISTS idx_quest_chapters_slug ON quest_chapters(slug);
