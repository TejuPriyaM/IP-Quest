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

APPWRITE_PASSWORD_RECOVERY_API_KEY

PASSWORD_RECOVERY_SECRET

RESEND_API_KEY

PASSWORD_RECOVERY_FROM_EMAIL

OPENROUTER_API_KEY

OPENROUTER_MODEL

- APPWRITE_QUIZ_API_KEY is used by server-side quiz, learning-content, and teacher-content operations.
- APPWRITE_PASSWORD_RECOVERY_API_KEY is used only by the server-side password recovery flow. It requires users.read, users.write, rows.read, and rows.write scopes for the configured Appwrite project/database.
- PASSWORD_RECOVERY_SECRET is a server-only HMAC key of at least 32 bytes. Generate a unique random value for each environment; it protects stored verification-code hashes and recovery identifiers.
- RESEND_API_KEY is used only by the server-side Resend email adapter. Password recovery also requires a verified sender address in PASSWORD_RECOVERY_FROM_EMAIL.
- PASSWORD_RECOVERY_FROM_EMAIL is the verified Resend sender, for example `IP Quest <accounts@example.org>`; configure a domain you control.
- Password recovery codes expire in 10 minutes, have a 75-second resend cooldown, allow at most five sends per email per hour, and allow at most five incorrect code attempts per recovery request.
- The recovery route uses `x-real-ip` or the first `x-forwarded-for` address for a 10-request-per-minute IP limit. Configure the trusted hosting proxy to overwrite these headers; if neither exists, requests share a conservative fallback bucket.
- Teacher Progress and assignment requests also use APPWRITE_QUIZ_API_KEY for server-side Users API email lookup; it requires the users.read scope in addition to the relevant TablesDB row read/write scopes.
- APPWRITE_API_KEY is used by the server-side teacher signup flow to add a newly registered Teacher account to the existing `teachers` team; it needs the minimum required team membership write scope.
- OPENROUTER_API_KEY is used only by the server-side AI chat route.
- OPENROUTER_MODEL selects the OpenRouter model and is not a secret.
- Teacher server routes verify authenticated membership in the existing `teachers` team.
- Public signup may store a Student or Teacher account role; only the initial server profile-creation flow can create teacher team membership.

## Rules

- Public variables may be used by the browser.
- API keys must remain server-side.
- Never commit .env.local.
- Never paste API keys into AI prompts.
- Never place API keys in client components.
- Never expose student marks, assessment responses, unpublished lessons, or quiz answer keys to the AI chat context.
- Use separate development and production credentials where practical.
- Password recovery fails closed when its Appwrite key, HMAC secret, or Resend settings are missing. Do not add any of these variables to a `NEXT_PUBLIC_` name.

## Current Values

Values will be added after Appwrite Console configuration.

Do not add secrets to this documentation file.