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