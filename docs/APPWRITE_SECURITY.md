# Appwrite Security Rules

## General

- Never expose an Appwrite API key in frontend code.
- Never commit .env.local.
- Do not share secrets with AI coding tools.
- Use the minimum required API key scopes.
- Validate all user input.
- Validate authorization on the server.
- Do not trust client-side quiz scores.
- Do not expose correct quiz answers unnecessarily.

## Student Privacy

The application targets school students.

Therefore:
- Collect minimal personal information.
- Do not require unnecessary sensitive data.
- Avoid exposing student performance publicly.
- Use appropriate document and row permissions.
- Avoid unrestricted AI conversations.
- Keep the AI assistant focused on educational IP topics.

## AI Chat

- Keep the OpenRouter key in `OPENROUTER_API_KEY` on the server; never prefix it with `NEXT_PUBLIC_` or include it in a client bundle.
- Derive the chat role from the validated Appwrite JWT and server-verified Teachers team membership; ignore client-supplied roles and user IDs.
- Give students only published learning context that has been verified server-side. Do not pass quiz questions, answer keys, marks, assessment responses, profile records, or unpublished content to the provider.
- Give teachers page labels only; do not retrieve student records for chat context unless a separately approved server authorization explicitly allows it.
- Bound request size and conversation history, use provider timeouts, avoid logging prompts or provider responses, and do not persist chat transcripts by default.

## Database

- Use appropriate table permissions.
- Use row-level permissions where needed.
- Separate public learning content from private student records.
- Restrict administrative operations.
- Do not give every user update or delete access to all records.

## Development

Before implementing a privileged operation:
1. Explain why server-side access is required.
2. Identify the required Appwrite permission or API scope.
3. Confirm that the secret is not exposed to the browser.

## Teacher Authorization

- Public signup may store a student or teacher account role. A client-selected profile role is never proof of teacher access.
- Server routes must validate the Appwrite JWT, derive the user ID from the authenticated account, and verify membership in the existing `teachers` team for every teacher-only operation.
- Never authorize a teacher operation from a URL, request body, profile role, client guard, or chat prompt.
- Only initial server-side profile creation may add a new account to the Teachers team, after validating the signup role and authenticated account.
- Never add teacher membership to an existing account solely because its editable profile role is `teacher`.
- Do not expose student quiz attempts, scores, written responses, or progress without a separate approved teacher-student authorization relationship.