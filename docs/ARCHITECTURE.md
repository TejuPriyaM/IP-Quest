# Application Architecture

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- App Router

## Backend

- Next.js Server Actions and API Routes
- Server-side validation
- Server-side privileged operations

## Authentication

- Appwrite Authentication

## Database

- Appwrite TablesDB for the initial MVP

## Storage

- Appwrite Storage for educational images and assets

## AI

- OpenRouter through the server-side `/api/chat` route
- Role and page context are validated server-side; only published learning material is retrieved for student Learn pages
- Teacher chat does not retrieve student records
- `OPENROUTER_API_KEY` remains server-only; `OPENROUTER_MODEL` selects the configured model

## Deployment

- Vercel for the Next.js application
- Appwrite Cloud for backend services

## Architectural Pattern

Use a modular monolithic architecture.

Do not introduce microservices during the MVP.

## Important Rules

- Never expose private API keys in client-side code.
- Keep database operations in dedicated server-side modules.
- Keep UI components reusable.
- Separate mock data from production database logic.
- Use TypeScript types for application data.
- Use environment variables for credentials.
- Avoid unnecessary dependencies.