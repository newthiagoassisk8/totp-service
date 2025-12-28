ALTER TABLE "auth_tokens" ADD COLUMN "keep" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_tokens" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "totps" ADD COLUMN "encoding" varchar(32);--> statement-breakpoint
CREATE INDEX "auth_tokens_user_idx" ON "auth_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_tokens_token_unique" ON "auth_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "totps_user_idx" ON "totps" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "totps_sort_idx" ON "totps" USING btree ("sort");--> statement-breakpoint
