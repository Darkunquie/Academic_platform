import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  bigint,
  boolean,
  numeric,
  timestamp,
  jsonb,
  unique,
  index,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export const roleEnum = pgEnum("role", ["super_admin", "admin", "student"]);
export const userStatusEnum = pgEnum("user_status", [
  "pending",
  "approved",
  "rejected",
]);
export const sectionCodeEnum = pgEnum("section_code", [
  "school",
  "intermediate",
  "college",
  "postgrad",
  "professional",
]);
export const providerKindEnum = pgEnum("provider_kind", ["board", "university"]);
export const questionTypeEnum = pgEnum("question_type", ["mcq", "subjective"]);
export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);
export const contentSourceEnum = pgEnum("content_source", ["human", "ai"]);
export const assetKindEnum = pgEnum("asset_kind", ["pdf", "image", "audio"]);
export const attemptStatusEnum = pgEnum("attempt_status", [
  "in_progress",
  "submitted",
]);
export const submissionStatusEnum = pgEnum("submission_status", [
  "queued",
  "running",
  "accepted",
  "wrong",
  "error",
  "tle",
]);
export const interviewModeEnum = pgEnum("interview_mode", ["voice", "text"]);
export const interviewStatusEnum = pgEnum("interview_status", [
  "active",
  "completed",
]);
export const genTypeEnum = pgEnum("gen_type", [
  "mock_test",
  "interview",
  "coding",
]);
export const interviewQSourceEnum = pgEnum("interview_q_source", [
  "ai",
  "cache",
]);

/* ------------------------------------------------------------------ */
/* Curriculum tree                                                     */
/* ------------------------------------------------------------------ */

export const sections = pgTable("sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: sectionCodeEnum("code").notNull().unique(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const providers = pgTable(
  "providers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => sections.id, { onDelete: "cascade" }),
    kind: providerKindEnum("kind").notNull(),
    name: text("name").notNull(),
    code: text("code"),
    country: text("country"),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("providers_section_name_uq").on(t.sectionId, t.name),
    index("providers_section_idx").on(t.sectionId),
  ]
);

export const grades = pgTable(
  "grades",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.id, { onDelete: "cascade" }),
    name: text("name").notNull(), // "Class 5", "B.Tech Year 2"
    level: integer("level").notNull().default(0),
    createdBy: uuid("created_by"),
  },
  (t) => [
    unique("grades_provider_name_uq").on(t.providerId, t.name),
    index("grades_provider_idx").on(t.providerId),
  ]
);

export const subjects = pgTable(
  "subjects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gradeId: uuid("grade_id")
      .notNull()
      .references(() => grades.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    isCore: boolean("is_core").notNull().default(true),
    isCoding: boolean("is_coding").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdBy: uuid("created_by"),
  },
  (t) => [index("subjects_grade_idx").on(t.gradeId)]
);

export const chapters = pgTable(
  "chapters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("chapters_subject_idx").on(t.subjectId)]
);

export const topics = pgTable(
  "topics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    chapterId: uuid("chapter_id")
      .notNull()
      .references(() => chapters.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("topics_chapter_idx").on(t.chapterId)]
);

/* ------------------------------------------------------------------ */
/* Identity & access                                                   */
/* ------------------------------------------------------------------ */

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    phone: text("phone"),
    country: text("country"),
    state: text("state"),
    passwordHash: text("password_hash").notNull(),
    role: roleEnum("role").notNull().default("student"),
    status: userStatusEnum("status").notNull().default("pending"),
    // student scope (set at signup):
    sectionId: uuid("section_id").references(() => sections.id),
    providerId: uuid("provider_id").references(() => providers.id),
    gradeId: uuid("grade_id").references(() => grades.id),
    approvedBy: uuid("approved_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("users_status_idx").on(t.status),
    index("users_role_idx").on(t.role),
  ]
);

export const adminScope = pgTable(
  "admin_scope",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    adminId: uuid("admin_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.id, { onDelete: "cascade" }),
  },
  (t) => [unique("admin_scope_uq").on(t.adminId, t.providerId)]
);

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

export const topicContent = pgTable("topic_content", {
  id: uuid("id").primaryKey().defaultRandom(),
  topicId: uuid("topic_id")
    .notNull()
    .unique()
    .references(() => topics.id, { onDelete: "cascade" }),
  bodyHtml: text("body_html").notNull().default(""),
  updatedBy: uuid("updated_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const contentAssets = pgTable(
  "content_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    topicId: uuid("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    kind: assetKindEnum("kind").notNull(),
    r2Key: text("r2_key").notNull(),
    filename: text("filename").notNull(),
    mime: text("mime"),
    sizeBytes: bigint("size_bytes", { mode: "number" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("content_assets_topic_idx").on(t.topicId)]
);

/* ------------------------------------------------------------------ */
/* Mock test                                                           */
/* ------------------------------------------------------------------ */

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    topicId: uuid("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    type: questionTypeEnum("type").notNull().default("mcq"),
    prompt: text("prompt").notNull(),
    explanation: text("explanation"),
    difficulty: difficultyEnum("difficulty").notNull().default("medium"),
    source: contentSourceEnum("source").notNull().default("human"),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("questions_topic_source_idx").on(t.topicId, t.source)]
);

export const questionOptions = pgTable(
  "question_options",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    isCorrect: boolean("is_correct").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("question_options_question_idx").on(t.questionId)]
);

export const testAttempts = pgTable(
  "test_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    topicId: uuid("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    total: integer("total").notNull().default(0),
    score: numeric("score").notNull().default("0"),
    status: attemptStatusEnum("status").notNull().default("in_progress"),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
  },
  (t) => [
    index("test_attempts_student_idx").on(t.studentId),
    index("test_attempts_topic_idx").on(t.topicId),
  ]
);

export const testAnswers = pgTable("test_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  attemptId: uuid("attempt_id")
    .notNull()
    .references(() => testAttempts.id, { onDelete: "cascade" }),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  selectedOptionId: uuid("selected_option_id").references(
    () => questionOptions.id
  ),
  answerText: text("answer_text"),
  isCorrect: boolean("is_correct"),
  awarded: numeric("awarded").notNull().default("0"),
});

/* ------------------------------------------------------------------ */
/* Coding                                                              */
/* ------------------------------------------------------------------ */

export const codingQuestions = pgTable(
  "coding_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    topicId: uuid("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    prompt: text("prompt").notNull(),
    languages: text("languages").array().notNull().default([]),
    starterCode: jsonb("starter_code").notNull().default({}),
    timeLimitMs: integer("time_limit_ms").notNull().default(2000),
    memLimitKb: integer("mem_limit_kb").notNull().default(128000),
    difficulty: difficultyEnum("difficulty").notNull().default("medium"),
    source: contentSourceEnum("source").notNull().default("human"),
    createdBy: uuid("created_by"),
  },
  (t) => [index("coding_questions_topic_idx").on(t.topicId)]
);

export const codingTestCases = pgTable(
  "coding_test_cases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    codingQuestionId: uuid("coding_question_id")
      .notNull()
      .references(() => codingQuestions.id, { onDelete: "cascade" }),
    stdin: text("stdin").notNull().default(""),
    expectedOutput: text("expected_output").notNull().default(""),
    isSample: boolean("is_sample").notNull().default(false),
    weight: integer("weight").notNull().default(1),
  },
  (t) => [index("coding_test_cases_q_idx").on(t.codingQuestionId)]
);

export const codingSubmissions = pgTable(
  "coding_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    codingQuestionId: uuid("coding_question_id")
      .notNull()
      .references(() => codingQuestions.id, { onDelete: "cascade" }),
    language: text("language").notNull(),
    sourceCode: text("source_code").notNull(),
    status: submissionStatusEnum("status").notNull().default("queued"),
    passed: integer("passed").notNull().default(0),
    total: integer("total").notNull().default(0),
    score: numeric("score").notNull().default("0"),
    stdout: text("stdout"),
    stderr: text("stderr"),
    judge0Token: text("judge0_token"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("coding_submissions_student_idx").on(t.studentId),
    index("coding_submissions_q_idx").on(t.codingQuestionId),
  ]
);

/* ------------------------------------------------------------------ */
/* Mock interview                                                      */
/* ------------------------------------------------------------------ */

export const interviewSessions = pgTable(
  "interview_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // An interview spans MULTIPLE topics (across one or more chapters).
    // The selected topics are stored in interview_session_topics.
    // subjectId scopes the session for analytics/cache; topics imply subject.
    subjectId: uuid("subject_id").references(() => subjects.id, {
      onDelete: "set null",
    }),
    mode: interviewModeEnum("mode").notNull().default("text"),
    status: interviewStatusEnum("status").notNull().default("active"),
    overallScore: numeric("overall_score"),
    feedback: text("feedback"),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [
    index("interview_sessions_student_idx").on(t.studentId),
    index("interview_sessions_subject_idx").on(t.subjectId),
  ]
);

// Many-to-many: a session selects multiple topics (from multiple chapters).
export const interviewSessionTopics = pgTable(
  "interview_session_topics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => interviewSessions.id, { onDelete: "cascade" }),
    topicId: uuid("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
  },
  (t) => [
    unique("interview_session_topic_uq").on(t.sessionId, t.topicId),
    index("interview_session_topics_session_idx").on(t.sessionId),
    index("interview_session_topics_topic_idx").on(t.topicId),
  ]
);

export const interviewQuestions = pgTable(
  "interview_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => interviewSessions.id, { onDelete: "cascade" }),
    seq: integer("seq").notNull().default(0),
    question: text("question").notNull(),
    idealAnswer: text("ideal_answer"),
    source: interviewQSourceEnum("source").notNull().default("ai"),
  },
  (t) => [index("interview_questions_session_idx").on(t.sessionId)]
);

export const interviewAnswers = pgTable("interview_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  interviewQuestionId: uuid("interview_question_id")
    .notNull()
    .references(() => interviewQuestions.id, { onDelete: "cascade" }),
  transcript: text("transcript"),
  audioR2Key: text("audio_r2_key"),
  score: numeric("score"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* ------------------------------------------------------------------ */
/* AI cache + progress + audit                                         */
/* ------------------------------------------------------------------ */

export const generatedContent = pgTable("generated_content", {
  id: uuid("id").primaryKey().defaultRandom(),
  cacheKey: text("cache_key").notNull().unique(),
  type: genTypeEnum("type").notNull(),
  payload: jsonb("payload").notNull(),
  model: text("model"),
  hits: integer("hits").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const progress = pgTable(
  "progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    topicId: uuid("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    contentViewed: boolean("content_viewed").notNull().default(false),
    testBest: numeric("test_best"),
    interviewBest: numeric("interview_best"),
    codingSolved: integer("coding_solved").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("progress_student_topic_uq").on(t.studentId, t.topicId)]
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id"),
    action: text("action").notNull(),
    entity: text("entity"),
    entityId: uuid("entity_id"),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("audit_log_actor_idx").on(t.actorId)]
);
