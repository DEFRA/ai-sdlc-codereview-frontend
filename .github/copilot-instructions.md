# AI-Powered Code Review Frontend

This project is a web application for submitting code repositories for AI-powered code review. This frontend service provides an interface for submitting repositories and reviewing the generated code analysis reports. It is built using Node.js with the Hapi.js framework, and employs server-side rendering with Nunjucks templates styled with GOV.UK Frontend. It calls backend REST APIs that handle the actual code logic.

**Stack**: Node.js + Hapi.js, GOV.UK Frontend, Nunjucks  
**Pattern**: Server-side rendered with minimal client-side JavaScript

## Essential Workflow

```bash
npm run format && npm run lint:fix && npm test  # Required before commits
npm run dev                                     # Development with hot reload
npm run test:e2e                                # Playwright end-to-end tests
```

**Critical**: Always run `format` and `lint:fix` after any code changes.

## Architecture Patterns

### Folder Structure

```
src/
├── client/        # Client-side JavaScript (progressive enhancement only)
├── config/        # Application configuration with convict
├── server/        # Server-side code (Hapi.js controllers, plugins, templates)
tests/             # Playwright end-to-end tests
```

### Feature Folder Structure

```
src/server/feature-name/
├── controller.js      # Route handlers with (request, h) signature
├── controller.test.js # Jest unit tests
├── index.js           # Hapi plugin with route definitions
└── *.njk              # Nunjucks templates
```

### Key Conventions

- **Config**: Use `convict`, access via `import { config } from '~/src/config/config.js'`
- **Imports**: Use `~` alias for absolute paths
- **Templates**: Include `pageTitle` in all view calls
- **Styles**: BEM naming with `app-` prefix for custom components
- **Testing**: Role-based selectors for Playwright, mock `fetch` for Jest

## File Creation Rules

### Controllers (`controller.js`)

- Use `(request, h)` function signatures
- Include try/catch with `request.logger.error()` for errors
- Return `h.view()` for templates, `h.response()` for JSON
- Format data for GOV.UK components (table rows, status tags)

### Templates (`*.njk`)

- Extend `layouts/page.njk`, import GOV.UK macros
- Use semantic HTML with ARIA labels
- Include `data-review-id` attributes for status polling
- Format status tags with proper color classes

### Client JavaScript (`src/client/`)

- Progressive enhancement only
- Initialize GOV.UK components with `createAll()`
- Export internal functions via `__testing__` for unit tests
- Use data attributes for DOM targeting

### Tests

- **Jest** (`*.test.js`): Mock `fetch` and Redis, test error scenarios, verify template data
- **Playwright** (`tests/`): Use role-based selectors, test complete user journeys, include accessibility checks

## Common Patterns

- **Error Handling**: Always log with context, show user-friendly messages
- **Date Display**: Use consistent `formatDate()` function
- **Status Polling**: Check `data-review-id` elements every 10 seconds
- **API Calls**: Handle all HTTP status codes explicitly
- **Security**: Follow patterns in `security-review.instructions.md`

## Detailed Instructions

For comprehensive patterns and examples, see:

- **Backend**: `.github/instructions/backend-patterns.instructions.md`
- **Frontend**: `.github/instructions/frontend-patterns.instructions.md`
- **Testing**: `.github/instructions/testing-patterns.instructions.md`
