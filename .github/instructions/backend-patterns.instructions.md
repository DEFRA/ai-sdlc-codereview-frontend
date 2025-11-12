---
applyTo: '**/controller.js'
---

# Backend Patterns - Controllers & API Integration

## Project Context

**Hapi.js server-side application** where controllers handle HTTP requests, fetch external API data, and render Nunjucks templates.

## Controller Requirements

- Use `(request, h)` function signatures
- Include try/catch with `request.logger.error()` for errors
- Return `h.view()` for templates with `pageTitle`
- Format data for GOV.UK components (table rows, status tags)
- Handle all HTTP status codes explicitly
- Include `data-review-id` attributes for status polling
- Use consistent `formatDate()` function

## API Integration

- Mock `fetch` calls in tests
- Handle network timeouts and error responses
- Transform API data for template consumption
- Never expose internal errors to users
- Log errors with descriptive context

## Data Formatting

- Format dates consistently using project helper
- Structure table data as arrays of objects
- Use proper GOV.UK status tag color classes
- Include accessibility attributes in generated HTML
