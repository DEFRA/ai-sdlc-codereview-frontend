# AI-Powered Code Review Frontend - AI Agent Instructions

A DEFRA digital service for AI-powered code review using Node.js + Hapi.js, GOV.UK Frontend, and Nunjucks.

## Architecture Overview

This is a **server-side rendered web application** with minimal client-side JavaScript:
- **Backend**: Hapi.js server with plugin-based architecture
- **Frontend**: GOV.UK Frontend components with Nunjucks templates
- **Data Flow**: Frontend → Backend API → External Code Review API
- **Session Management**: Redis for production, memory for development
- **Build**: Webpack for client assets, Babel for server transpilation

## Development Workflow

Essential commands in this exact order:
```bash
npm run format && npm run lint:fix && npm test  # Required before commits
npm run dev                                      # Start development with hot reload
npm run test:e2e                                # Playwright end-to-end tests
```

**Critical**: Always run `format` and `lint:fix` after any code changes.

## Project Structure Patterns

### Server Architecture (`src/server/`)
Each feature follows this exact pattern:
```
feature-name/
├── controller.js      # Route handlers with (request, h) signature
├── controller.test.js # Jest unit tests
├── index.js          # Hapi plugin with route definitions
└── *.njk             # Nunjucks templates
```

**Controller Example**: See `.github/copilot-instructions/controllers.instructions.md` for detailed patterns.

### Configuration (`src/config/`)
- Use `convict` for all configuration management
- Access config via `import { config } from '~/src/config/config.js'`
- Environment-aware defaults (production vs development)

### Client-Side (`src/client/`)
- **JavaScript**: See `.github/copilot-instructions/client.instructions.md`
- **Stylesheets**: SCSS with BEM naming, `app-` prefix for custom components
- **Import Pattern**: Use `~` alias for absolute imports

## GOV.UK Frontend Conventions

Template patterns are handled by path-specific custom instructions:
- **Nunjucks templates** (`*.njk`): See `.github/copilot-instructions/templates.instructions.md`

## API Integration Patterns

API integration is handled by path-specific custom instructions:
- **Controller patterns**: See `.github/copilot-instructions/controllers.instructions.md`
- **Client-side fetch**: See `.github/copilot-instructions/client.instructions.md`

## Testing

Testing is handled by path-specific custom instructions:
- **Jest unit tests** (`*.test.js`): See `.github/copilot-instructions/jest.instructions.md`
- **Playwright E2E tests** (`tests/`): See `.github/copilot-instructions/tests.instructions.md`

Key commands:
```bash
npm test                   # Jest unit tests with coverage
npm run test:e2e          # Playwright end-to-end tests
```

## Build System Specifics

### Webpack Configuration
- **Entry**: `application.js` + `application.scss` bundled together
- **Output**: Production adds content hashes, development uses simple names
- **Aliases**: `/public/assets` → GOV.UK Frontend assets
- **SCSS**: Load paths include component directories

### Babel Setup
- Transpiles server code from `src/` to `.server/` directory
- Excludes `*.test.js` and `test-helpers/` from server build
- Use ES modules with named exports throughout

## Common Patterns to Follow

1. **Route Registration**: Always use Hapi plugins in `router.js`
2. **Error Logging**: Use `request.logger.error()` with context
3. **Template Context**: Include `pageTitle` in all view calls
4. **Date Handling**: Consistent format using project's `formatDate()`
5. **Status Polling**: Use `data-review-id` attributes for client-side updates
6. **Accessibility**: Include ARIA labels, semantic HTML, proper heading hierarchy

## File Creation Guidelines

File creation follows path-specific patterns:
- **New Features**: Follow `src/server/feature-name/` pattern
- **Templates** (`*.njk`): See `.github/copilot-instructions/templates.instructions.md`
- **Controllers** (`controller.js`): See `.github/copilot-instructions/controllers.instructions.md`
- **Client-side** (`src/client/`): See `.github/copilot-instructions/client.instructions.md`
- **Tests**: Co-locate with source files, use descriptive test names
- **Styles**: Add to `src/client/stylesheets/components/` with BEM naming

## Code Review Focus Areas

When reviewing code, include:
- Avoiding redundant code and ensuring DRY principles. IMPORTANT: Check vs existing code to avoid duplication.
- Apply the security best practices outlined in `.github/copilot-instructions/security-review.instructions.md`.