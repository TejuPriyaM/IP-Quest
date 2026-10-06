# Appwrite Environment Variables

## Local File

.env.local

## Public Variables

NEXT_PUBLIC_APPWRITE_ENDPOINT

NEXT_PUBLIC_APPWRITE_PROJECT_ID

NEXT_PUBLIC_APPWRITE_DATABASE_ID

## Server-Only Variables

APPWRITE_API_KEY

APPWRITE_QUIZ_API_KEY

- APPWRITE_API_KEY is used by the server-side Teachers team membership flow.
- APPWRITE_QUIZ_API_KEY is used by the server-side quiz submission and result flows.

## Rules

- Public variables may be used by the browser.
- API keys must remain server-side.
- Never commit .env.local.
- Never paste API keys into AI prompts.
- Never place API keys in client components.
- Use separate development and production credentials where practical.

## Current Values

Values will be added after Appwrite Console configuration.

Do not add secrets to this documentation file.