ALTER TABLE "providers" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "university_type" text;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "established_year" integer;--> statement-breakpoint
CREATE INDEX "providers_state_idx" ON "providers" USING btree ("state");--> statement-breakpoint
CREATE INDEX "providers_kind_state_idx" ON "providers" USING btree ("kind","state");