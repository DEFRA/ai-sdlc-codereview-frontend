# Testing Patterns - Jest & Playwright

## Project Context

**Hapi.js server-side application** testing controllers with `(request, h)` signatures, API integration with mocked `fetch`, and GOV.UK Frontend components.

## Jest Unit Testing

### Controller Testing

- Test `(request, h)` function signatures
- Mock `fetch` API calls and Redis operations
- Test error scenarios with `request.logger.error()`
- Verify template data formatting
- Test edge cases: empty data, network errors

### Test Structure

```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup mocks
  })

  test('should handle success scenario', async () => {
    // Test implementation
  })
})
```

## Playwright End-to-End Testing

### Selector Priority

1. **Role-based selectors** (preferred):

   - `page.getByRole('button', { name: 'Generate code review' })`
   - `page.getByRole('textbox', { name: 'Repository URL' })`
   - `page.getByRole('status', { name: 'Review status: Started' })`

2. **Scoped selectors** to avoid strict mode violations:
   - `page.getByRole('row').nth(1).getByRole('link')`

### Test Organization

- Use constants for test data
- Test complete user journeys
- Verify GOV.UK component styling
- Test status polling behavior
- Include accessibility checks with `AxeBuilder`

## Commands

```bash
npm test                   # Jest tests with coverage
npm run test:e2e           # Playwright tests
npm run test:e2e:ui        # Playwright UI mode
```
