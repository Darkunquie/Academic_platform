CREATE TABLE "web_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"web_question_id" uuid NOT NULL,
	"label" text NOT NULL,
	"expression" text NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "web_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" uuid NOT NULL,
	"title" text NOT NULL,
	"prompt" text NOT NULL,
	"html_starter" text DEFAULT '' NOT NULL,
	"css_starter" text DEFAULT '' NOT NULL,
	"js_starter" text DEFAULT '' NOT NULL,
	"difficulty" "difficulty" DEFAULT 'easy' NOT NULL,
	"source" "content_source" DEFAULT 'human' NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "web_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"web_question_id" uuid NOT NULL,
	"html" text DEFAULT '' NOT NULL,
	"css" text DEFAULT '' NOT NULL,
	"js" text DEFAULT '' NOT NULL,
	"status" "submission_status" DEFAULT 'queued' NOT NULL,
	"passed" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"score" numeric DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "web_checks" ADD CONSTRAINT "web_checks_web_question_id_web_questions_id_fk" FOREIGN KEY ("web_question_id") REFERENCES "public"."web_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "web_questions" ADD CONSTRAINT "web_questions_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "web_submissions" ADD CONSTRAINT "web_submissions_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "web_submissions" ADD CONSTRAINT "web_submissions_web_question_id_web_questions_id_fk" FOREIGN KEY ("web_question_id") REFERENCES "public"."web_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "web_checks_q_idx" ON "web_checks" USING btree ("web_question_id");--> statement-breakpoint
CREATE INDEX "web_questions_topic_idx" ON "web_questions" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "web_submissions_student_idx" ON "web_submissions" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "web_submissions_q_idx" ON "web_submissions" USING btree ("web_question_id");