# Domain modules

Business logic lives here, organized by domain (modular monolith).
Route handlers in `src/app/api/**` and pages in `src/app/**` stay thin —
they call into these modules.

- `auth/` — signup, login, session, RBAC, approval (Phase 1)
- `curriculum/` — sections → providers → grades → subjects → chapters → topics (Phase 2)
- `content/` — topic content, PDF/asset upload, TTS (Phase 3)
- `assessment/` — mock tests, AI generation, scoring (Phase 4)
- `interview/` — voice/text mock interview (Phase 5)
- `coding/` — sandbox submissions, grading (Phase 6)
- `analytics/` — drill-down metrics (Phase 7)

Shared helpers (DB scope guards, etc.) go in `src/lib/`.
