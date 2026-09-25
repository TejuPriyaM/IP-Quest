# Development Rules

## General

- Write clean, readable TypeScript.
- Prefer simple solutions over complicated abstractions.
- Do not modify unrelated files.
- Explain important changes briefly.
- Do not generate placeholder functionality that appears to be complete.
- Clearly identify mock functionality.

## UI

- Design mobile-first.
- Ensure responsive layouts.
- Use accessible buttons, labels, and navigation.
- Maintain consistent spacing and typography.
- Avoid excessive animations.
- Use reusable components.

## Security

- Never expose API keys in frontend code.
- Validate user input.
- Validate AI responses.
- Do not trust client-side scores.
- Keep correct quiz answers on the server when the quiz system is implemented.
- Do not collect unnecessary personal information from children.

## AI Development

Before changing the architecture, explain the reason.

Before adding a new dependency, explain its purpose.

Do not replace Appwrite with another database without explicit approval.

Do not implement advanced features before completing the current phase.

After each task, report:
1. Files created
2. Files modified
3. Features completed
4. Remaining issues
5. Commands required to test