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