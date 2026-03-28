CREATE TABLE "quest_chapters" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"description" text,
	"icon" text,
	"accent_color" text DEFAULT '#3b82f6',
	"sort_order" integer NOT NULL,
	"is_published" boolean DEFAULT false,
	"prerequisites" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "quest_chapters_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "quest_learn_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"level_id" integer,
	"sort_order" integer NOT NULL,
	"section_type" text NOT NULL,
	"title" text,
	"content" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quest_level_analytics" (
	"level_id" integer PRIMARY KEY NOT NULL,
	"total_attempts" integer DEFAULT 0,
	"total_completions" integer DEFAULT 0,
	"avg_score" numeric(5, 2),
	"avg_time_seconds" integer,
	"drop_off_rate" numeric(5, 2),
	"common_wrong_answers" jsonb DEFAULT '[]'::jsonb,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quest_levels" (
	"id" serial PRIMARY KEY NOT NULL,
	"chapter_id" integer,
	"slug" text NOT NULL,
	"level_number" integer NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"hook" text,
	"game_type" text NOT NULL,
	"game_config" jsonb NOT NULL,
	"key_insight" text,
	"xp_reward" integer DEFAULT 100,
	"estimated_minutes" integer DEFAULT 5,
	"is_published" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "quest_levels_chapter_id_level_number_unique" UNIQUE("chapter_id","level_number")
);
--> statement-breakpoint
CREATE TABLE "quest_user_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"level_id" integer,
	"completed" boolean DEFAULT false,
	"score" integer,
	"max_score" integer,
	"attempts" integer DEFAULT 0,
	"time_spent_seconds" integer DEFAULT 0,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "quest_user_progress_user_id_level_id_unique" UNIQUE("user_id","level_id")
);
--> statement-breakpoint
CREATE TABLE "quest_user_stats" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"xp" integer DEFAULT 0,
	"player_level" integer DEFAULT 1,
	"streak_days" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"last_active_date" date,
	"total_levels_completed" integer DEFAULT 0,
	"total_time_seconds" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "quest_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text,
	"display_name" text,
	"avatar_url" text,
	"auth_provider" text DEFAULT 'github',
	"auth_provider_id" text,
	"role" text DEFAULT 'user',
	"created_at" timestamp with time zone DEFAULT now(),
	"last_active_at" timestamp with time zone,
	CONSTRAINT "quest_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "quest_learn_sections" ADD CONSTRAINT "quest_learn_sections_level_id_quest_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."quest_levels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quest_level_analytics" ADD CONSTRAINT "quest_level_analytics_level_id_quest_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."quest_levels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quest_levels" ADD CONSTRAINT "quest_levels_chapter_id_quest_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."quest_chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quest_user_progress" ADD CONSTRAINT "quest_user_progress_user_id_quest_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."quest_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quest_user_progress" ADD CONSTRAINT "quest_user_progress_level_id_quest_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."quest_levels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quest_user_stats" ADD CONSTRAINT "quest_user_stats_user_id_quest_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."quest_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_quest_chapters_slug" ON "quest_chapters" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_quest_learn_sections_level" ON "quest_learn_sections" USING btree ("level_id");--> statement-breakpoint
CREATE INDEX "idx_quest_levels_chapter" ON "quest_levels" USING btree ("chapter_id");--> statement-breakpoint
CREATE INDEX "idx_quest_user_progress_user" ON "quest_user_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_quest_user_progress_level" ON "quest_user_progress" USING btree ("level_id");