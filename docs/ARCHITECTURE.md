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

- OpenRouter through server-side API calls
- Future provider abstraction for Groq and Hugging Face

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