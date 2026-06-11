CREATE TYPE "public"."self_mode" AS ENUM('test', 'interview');--> statement-breakpoint
CREATE TABLE "self_attempt_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"seq" integer DEFAULT 0 NOT NULL,
	"prompt" text NOT NULL,
	"options" jsonb,
	"correct_index" integer,
	"explanation" text,
	"ideal_answer" text,
	"student_choice" integer,
	"student_answer" text,
	"is_correct" boolean,
	"score" integer,
	"feedback" text
);
--> statement-breakpoint
CREATE TABLE "self_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"subject" text DEFAULT '' NOT NULL,
	"topic" text DEFAULT '' NOT NULL,
	"mode" "self_mode" NOT NULL,
	"difficulty" "difficulty" DEFAULT 'medium' NOT NULL,
	"pdf_hash" text,
	"total_questions" integer DEFAULT 0 NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"score_pct" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "self_attempt_questions" ADD CONSTRAINT "self_attempt_questions_attempt_id_self_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."self_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "self_attempts" ADD CONSTRAINT "self_attempts_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "self_attempt_questions_attempt_idx" ON "self_attempt_questions" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "self_attempts_student_idx" ON "self_attempts" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "self_attempts_hash_idx" ON "self_attempts" USING btree ("pdf_hash");