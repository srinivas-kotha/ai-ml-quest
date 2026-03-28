CREATE TABLE "quest_visual_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"level_id" integer,
	"asset_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"source_prompt" text,
	"source_file" text,
	"r2_url" text,
	"r2_key" text,
	"metadata" jsonb,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "quest_visual_assets" ADD CONSTRAINT "quest_visual_assets_level_id_quest_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."quest_levels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_quest_visual_assets_level" ON "quest_visual_assets" USING btree ("level_id");--> statement-breakpoint
CREATE INDEX "idx_quest_visual_assets_type" ON "quest_visual_assets" USING btree ("asset_type");