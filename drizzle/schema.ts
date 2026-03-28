// NOTE: CHECK constraints for section_type and role are enforced by
// postgres/migrations/001-quest-schema.sql, not in this Drizzle schema
// (Drizzle ORM doesn't support CHECK constraints via pgTable).

import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  date,
  decimal,
  unique,
  index,
} from "drizzle-orm/pg-core";

// ============================================================
// CHAPTERS
// ============================================================
export const questChapters = pgTable(
  "quest_chapters",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").unique().notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    description: text("description"),
    icon: text("icon"),
    accentColor: text("accent_color").default("#3b82f6"),
    sortOrder: integer("sort_order").notNull(),
    isPublished: boolean("is_published").default(false),
    prerequisites: jsonb("prerequisites").default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    slugIdx: index("idx_quest_chapters_slug").on(table.slug),
  }),
);

// ============================================================
// LEVELS
// ============================================================
export const questLevels = pgTable(
  "quest_levels",
  {
    id: serial("id").primaryKey(),
    chapterId: integer("chapter_id").references(() => questChapters.id, {
      onDelete: "cascade",
    }),
    slug: text("slug").notNull(),
    levelNumber: integer("level_number").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    hook: text("hook"),
    gameType: text("game_type").notNull(),
    gameConfig: jsonb("game_config").notNull(),
    keyInsight: text("key_insight"),
    xpReward: integer("xp_reward").default(100),
    estimatedMinutes: integer("estimated_minutes").default(5),
    isPublished: boolean("is_published").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    chapterIdx: index("idx_quest_levels_chapter").on(table.chapterId),
    chapterLevelUniq: unique().on(table.chapterId, table.levelNumber),
  }),
);

// ============================================================
// VISUAL ASSETS
// ============================================================
export const questVisualAssets = pgTable(
  "quest_visual_assets",
  {
    id: serial("id").primaryKey(),
    levelId: integer("level_id").references(() => questLevels.id, {
      onDelete: "cascade",
    }),
    assetType: text("asset_type").notNull(), // 'napkin', 'd2', 'react-flow', 'analogy'
    title: text("title").notNull(),
    description: text("description"),
    sourcePrompt: text("source_prompt"),
    sourceFile: text("source_file"),
    r2Url: text("r2_url"),
    r2Key: text("r2_key"),
    metadata: jsonb("metadata"), // React Flow node/edge data, analogy fields, etc.
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    levelIdx: index("idx_quest_visual_assets_level").on(table.levelId),
    assetTypeIdx: index("idx_quest_visual_assets_type").on(table.assetType),
  }),
);

// ============================================================
// LEARN SECTIONS
// ============================================================
export const questLearnSections = pgTable(
  "quest_learn_sections",
  {
    id: serial("id").primaryKey(),
    levelId: integer("level_id").references(() => questLevels.id, {
      onDelete: "cascade",
    }),
    sortOrder: integer("sort_order").notNull(),
    sectionType: text("section_type").notNull(),
    title: text("title"),
    content: jsonb("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    levelIdx: index("idx_quest_learn_sections_level").on(table.levelId),
  }),
);

// ============================================================
// USERS
// ============================================================
export const questUsers = pgTable("quest_users", {
  id: serial("id").primaryKey(),
  email: text("email").unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  authProvider: text("auth_provider").default("github"),
  authProviderId: text("auth_provider_id"),
  role: text("role").default("user"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
});

// ============================================================
// USER PROGRESS
// ============================================================
export const questUserProgress = pgTable(
  "quest_user_progress",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => questUsers.id, {
      onDelete: "cascade",
    }),
    levelId: integer("level_id").references(() => questLevels.id, {
      onDelete: "cascade",
    }),
    completed: boolean("completed").default(false),
    score: integer("score"),
    maxScore: integer("max_score"),
    attempts: integer("attempts").default(0),
    timeSpentSeconds: integer("time_spent_seconds").default(0),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userIdx: index("idx_quest_user_progress_user").on(table.userId),
    levelIdx: index("idx_quest_user_progress_level").on(table.levelId),
    userLevelUniq: unique().on(table.userId, table.levelId),
  }),
);

// ============================================================
// USER STATS
// ============================================================
export const questUserStats = pgTable("quest_user_stats", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => questUsers.id, { onDelete: "cascade" }),
  xp: integer("xp").default(0),
  playerLevel: integer("player_level").default(1),
  streakDays: integer("streak_days").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActiveDate: date("last_active_date"),
  totalLevelsCompleted: integer("total_levels_completed").default(0),
  totalTimeSeconds: integer("total_time_seconds").default(0),
});

// ============================================================
// LEVEL ANALYTICS
// ============================================================
export const questLevelAnalytics = pgTable("quest_level_analytics", {
  levelId: integer("level_id")
    .primaryKey()
    .references(() => questLevels.id, { onDelete: "cascade" }),
  totalAttempts: integer("total_attempts").default(0),
  totalCompletions: integer("total_completions").default(0),
  avgScore: decimal("avg_score", { precision: 5, scale: 2 }),
  avgTimeSeconds: integer("avg_time_seconds"),
  dropOffRate: decimal("drop_off_rate", { precision: 5, scale: 2 }),
  commonWrongAnswers: jsonb("common_wrong_answers").default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
