---
applyTo: '**/*.njk,src/client/**/*'
---

# Frontend Patterns - Templates & Client JavaScript

## Project Context

**Server-side rendered application** using Nunjucks templates with GOV.UK Frontend components and progressive enhancement JavaScript.

## Template Requirements

- Extend `layouts/page.njk` and import GOV.UK macros
- Use semantic HTML with ARIA labels
- Include `data-review-id` attributes for status polling
- Use `govuk-width-container` for layout
- Format status tags with proper color classes
- Use consistent indentation (2 spaces)

## Client JavaScript Patterns

- Progressive enhancement only - pages work without JS
- Initialize GOV.UK components with `createAll()`
- Export internal functions via `__testing__` for unit tests
- Use data attributes for DOM targeting, not classes
- Feature detection before enhancement
- Handle missing DOM elements gracefully

## Status Polling

- Check `data-review-id` elements every 10 seconds
- Include `role="status"` for status indicators
- Provide loading states and error feedback
- Cache DOM queries for performance

## GOV.UK Components

- Use role-based selectors in tests
- Follow BEM naming with `app-` prefix for custom styles
- Include accessibility attributes
- Test responsive behavior especially tables
