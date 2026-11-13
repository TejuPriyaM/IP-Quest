# IP Quest UI Design System

## Direction

IP Quest uses a polished educational product interface: friendly for students, clear for teachers, and restrained for administration. The Next.js app uses Tailwind utilities plus shared CSS tokens in `app/globals.css`; the mounted Gamification app is scoped under `#ip-quest-gamification` and uses the same palette without sharing its gameplay styles.

## Tokens

- Primary: indigo `#4f46e5`; strong primary `#3730a3`.
- Secondary: turquoise `#16a995`; deep turquoise `#11675f`.
- Warm accent: gold `#eea83a`, reserved for highlights and game rewards.
- Supporting violet: `#8066df`; use sparingly.
- Background: `#f5f7fc`; surface: `#ffffff`; soft surface: `#f0f2fa`.
- Text: `#222442`; muted text: `#626781`; border: `#e2e5f0`.
- Success: `#0e8175`; warning: `#b76a16`; error: `#b52f4a`.
- Body type: Plus Jakarta Sans; display type: Outfit.
- Standard card radius: 14px; control radius: 10px.
- Card shadow: `0 12px 32px rgba(38, 44, 91, 0.08)`; raised shadow: `0 18px 42px rgba(38, 44, 91, 0.13)`.

Tailwind colors, typography, shadows, and radii are defined in `tailwind.config.ts`. Use `btn-primary`, `btn-secondary`, `glass-card`, `section-shell`, `status-error`, `status-success`, and `status-warning` for common patterns.

## Layout

- The root layout provides the responsive sticky navigation, page content, shared footer, and assistant.
- Use `section-shell` for a consistent maximum width and responsive horizontal padding.
- Use `SectionHeader` for route titles; it renders an H1 by default. Set `level={2}` for nested sections.
- Use `workspace-page` for student, teacher, and administrator work areas. Use `learn-experience` for lesson routes.
- The site footer is omitted in `/games` so the immersive game interface retains its own shell.

## Interaction

- Buttons, links, inputs, selects, and textareas have visible focus indicators.
- Inputs and validation stay connected to their existing state handlers and API calls.
- Use `role="status"` for progress/success and `role="alert"` for errors. Do not rely on color alone.
- Respect reduced-motion preferences. Keep transitions short and avoid movement that shifts page layout.
- At narrow widths, the main navigation collapses to a keyboard-accessible menu. Tables remain horizontally scrollable where columns cannot fit.

## Data and Access

- Continue using Appwrite-backed topic, lesson, profile, progress, quiz, and assignment data.
- Do not create fake learner statistics, sample records, or static dashboard progress.
- Keep `AuthGuard`, server authorization, route contracts, and API boundaries unchanged during visual work.
- When data is unavailable, show loading, error, or empty states instead of placeholder records.
- `/games` uses the existing Gamification local-storage state and game interactions; visual updates must not alter its game state or callbacks.