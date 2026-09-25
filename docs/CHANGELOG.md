# Project Changelog

## Format

Each change must include:
- Date
- Change
- Reason
- Affected files
- Migration or compatibility notes

## Changes

### Initial Architecture

- Date: 2026-09-20
- Change: Selected Next.js, TypeScript, Tailwind CSS, Appwrite TablesDB, Appwrite Auth, and OpenRouter.
- Reason: Reduce initial complexity and support a low-cost MVP.
- Affected files: Project architecture documentation.
- Migration notes: Native PostgreSQL may be considered in a future phase.

### Phase 1 UI Foundation

- Date: 2026-09-20
- Change: Created a responsive Next.js app with a landing page, navigation, learning topics, mock dashboard, quiz entry page, and reusable UI components using mock data.
- Reason: Establish the visual foundation and learning flows for the MVP without adding database or authentication complexity.
- Affected files: app/, components/, data/, package.json, tailwind.config.ts, app/globals.css, docs/CURRENT_PHASE.md.
- Migration notes: Appwrite integration and real authentication will be added in Phase 2; current data is intentionally mock-only and clearly separated.

### Phase 1 Student Dashboard

- Date: 2026-09-21
- Change: Expanded the student dashboard with mock XP, level, lesson progress, daily challenge, recent activity, achievements, and quick actions using responsive reusable card layouts.
- Reason: Complete the Phase 1 student dashboard workflow with a clearer educational gaming experience.
- Affected files: app/dashboard/page.tsx, components/DashboardCard.tsx, data/dashboardData.ts, docs/CURRENT_PHASE.md, docs/PHASE_1_TASKS.md.
- Migration notes: All dashboard values remain mock data; no Appwrite, authentication, or AI integration was added.

### Phase 1 Games and Quiz Interface

- Date: 2026-09-21
- Change: Added a topic-based quiz hub, reusable one-question-at-a-time quiz runner, ten mock IP questions, daily and future game cards, and a temporary results page.
- Reason: Complete the Phase 1 interactive games workflow with accessible, responsive quiz practice.
- Affected files: app/games/page.tsx, app/games/quiz/page.tsx, app/games/results/page.tsx, components/QuizRunner.tsx, data/quizData.ts, data/quizScoring.ts, docs/CURRENT_PHASE.md, docs/PHASE_1_TASKS.md.
- Migration notes: Answer checking and results are browser-only prototype logic. No scores are persisted and no Appwrite, authentication, or AI integration was added.

### Phase 1 Frontend QA Fixes

- Date: 2026-09-21
- Change: Completed responsive and workflow QA, fixed duplicate final-answer scoring, restored page-level heading semantics, made learning topic actions functional, and improved mobile navigation semantics.
- Reason: Remove correctness and accessibility issues before Phase 2 planning.
- Affected files: components/QuizRunner.tsx, components/SectionHeader.tsx, components/TopicCard.tsx, components/Navbar.tsx, app/learn/page.tsx, app/games/page.tsx, app/progress/page.tsx, docs/CURRENT_PHASE.md, docs/PHASE_1_TASKS.md.
- Migration notes: Quiz state remains temporary browser-only prototype state; no backend or security behavior changed.