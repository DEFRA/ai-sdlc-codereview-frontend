---
applyTo: '**/*.test.js,tests/**/*'
---

# Testing Patterns - Jest & Playwright

This file provides comprehensive guidance for Jest unit tests and Playwright end-to-end testing.

## Project Context

This is a **Hapi.js server-side application** testing:

- **Controller functions** with `(request, h)` signatures
- **API integration** mocking with `fetch`
- **GOV.UK Frontend** components with role-based selectors
- **Real user journeys** from form submission to result display

## Jest Unit Testing Patterns

### Standard Test Setup

```javascript
import { controllerFunction } from './controller.js'
import { config } from '~/src/config/config.js'

describe('Controller Name', () => {
  let mockRequest, mockH, fetchSpy

  beforeEach(() => {
    mockRequest = {
      logger: { error: jest.fn() },
      params: { id: 'test-id' }
    }
    mockH = {
      view: jest.fn().mockReturnThis(),
      response: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis()
    }
    fetchSpy = jest.spyOn(global, 'fetch')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
})
```

### Mock Data Patterns

```javascript
const mockReview = {
  _id: '123456789012345678901234',
  repository_url: 'https://github.com/test/repo1',
  status: 'completed',
  created_at: '2024-01-14T12:00:00Z',
  updated_at: '2024-01-14T13:00:00Z'
}
```

### API Integration Testing

```javascript
describe('API calls', () => {
  it('should handle successful API response', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData)
    })

    await controllerFunction(mockRequest, mockH)

    expect(fetchSpy).toHaveBeenCalledWith(
      `${config.get('apiBaseUrl')}/api/v1/endpoint`
    )
    expect(mockH.view).toHaveBeenCalledWith('template-name', expectedData)
  })

  it('should handle API errors', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('API Error'))

    await controllerFunction(mockRequest, mockH)

    expect(mockRequest.logger.error).toHaveBeenCalled()
    expect(mockH.view).toHaveBeenCalledWith('error/index', {
      statusCode: 500,
      message: 'User-friendly message'
    })
  })
})
```

### HTTP Status Code Testing

```javascript
it('should handle 404 errors', async () => {
  fetchSpy.mockResolvedValueOnce({
    ok: false,
    status: 404
  })

  await getCodeReviewById(mockRequest, mockH)

  expect(mockH.view).toHaveBeenCalledWith('error/index', {
    pageTitle: 'Code review not found',
    heading: 'Code review not found',
    message:
      'The code review you are looking for does not exist. This may be because:',
    messageList: [
      'the URL is incorrect',
      'the code review has been deleted',
      'you do not have permission to view this code review'
    ]
  })
})
```

### View Rendering Tests

```javascript
it('should render template with correct data', async () => {
  fetchSpy.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(mockReviews)
  })

  await getCodeReviews(mockRequest, mockH)

  expect(mockH.view).toHaveBeenCalledWith('code-reviews/index', {
    pageTitle: 'Code Reviews',
    tableRows: expect.arrayContaining([
      expect.arrayContaining([
        expect.objectContaining({
          html: expect.stringContaining(mockReview.repository_url),
          attributes: { 'data-label': 'Code Repository' }
        })
      ])
    ])
  })
})
```

### Data Transformation Testing

```javascript
describe('formatDate', () => {
  it('should handle noon (12pm)', async () => {
    const noonReview = {
      ...mockReview,
      created_at: '2024-01-14T12:00:00Z'
    }

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(noonReview)
    })

    await getCodeReviewById(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith('code-reviews/detail', {
      pageTitle: 'Code Review Details',
      review: expect.objectContaining({
        created_at: '14 January 2024 at 12:00pm'
      })
    })
  })
})
```

### Status Tag Testing

```javascript
it('should apply correct status tag colors', async () => {
  const reviews = [
    { ...mockReview, status: 'failed' },
    { ...mockReview, status: 'completed' },
    { ...mockReview, status: 'pending' }
  ]

  fetchSpy.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(reviews)
  })

  await getCodeReviews(mockRequest, mockH)

  const tableRows = mockH.view.mock.calls[0][1].tableRows
  expect(tableRows[0][3].html).toContain('govuk-tag--red') // failed
  expect(tableRows[1][3].html).toContain('govuk-tag--green') // completed
  expect(tableRows[2][3].html).not.toContain('govuk-tag--') // pending (default)
})
```

## Playwright End-to-End Testing

### Test Structure and Organization

```javascript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should complete user journey', async ({ page }) => {
    // Test implementation
  })
})
```

### GOV.UK Component Testing

#### Selector Priority (Use in this order)

1. **Role-based selectors** (preferred):

```javascript
page.getByRole('button', { name: 'Generate code review' })
page.getByRole('textbox', { name: 'Repository URL' })
page.getByRole('heading', { name: 'Code Review Details' })
page.getByRole('columnheader', { name: 'Status' })
```

2. **GOV.UK-specific selectors** with scoping:

```javascript
// Scope to avoid strict mode violations
const firstDataRow = page.getByRole('row').nth(1)
await expect(firstDataRow.getByRole('link', { name: REPOSITORY })).toBeVisible()

// Status tags with specific roles
page.getByRole('status', { name: 'Review status: Started' })
```

#### Tables

```javascript
// Table headers
await expect(
  page.getByRole('columnheader', { name: 'Code Repository' })
).toBeVisible()

// Table rows with scoping
const firstDataRow = page.getByRole('row').nth(1)
await expect(firstDataRow).toBeVisible()
```

#### Status Tags

```javascript
// Status tags use role="status"
await expect(
  page.getByRole('status', { name: 'Review status: Started' })
).toBeVisible()
```

#### Forms and Inputs

```javascript
// Form fields by label
await page.getByRole('textbox', { name: 'Repository URL' }).fill(REPOSITORY)
await page.getByRole('checkbox', { name: 'Test Standards' }).check()
```

### User Journey Testing

```javascript
test('should navigate through code review workflow', async ({ page }) => {
  // Start at home page
  await page.goto('/')

  // Submit form
  await page.getByRole('textbox', { name: 'Repository URL' }).fill(REPOSITORY)
  await page.getByRole('button', { name: 'Generate code review' }).click()

  // Verify navigation to details page
  await expect(
    page.getByRole('heading', { name: 'Code Review Details' })
  ).toBeVisible()

  // Navigate back to list
  await page.getByRole('link', { name: 'Return to code reviews list' }).click()
  await expect(
    page.getByRole('heading', { name: 'Code Reviews' })
  ).toBeVisible()
})
```

### Accessibility Testing

```javascript
import AxeBuilder from '@axe-core/playwright'

test('should meet accessibility standards', async ({ page }) => {
  await page.goto('/code-reviews')

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
```

### Error Handling Tests

```javascript
test('should handle API errors gracefully', async ({ page }) => {
  // Test error states, 404 pages, validation errors
  // Verify user-friendly error messages appear
})
```

## Testing Best Practices

### Jest Unit Tests

1. **Test user-visible behavior**, not implementation details
2. **Mock external dependencies** (fetch, Redis, etc.)
3. **Use descriptive test names** that explain the scenario
4. **Group related tests** with `describe` blocks
5. **Test edge cases**: empty data, network errors, invalid responses
6. **Verify error logging** happens with appropriate context
7. **Test data transformations** (dates, status colors, markdown)

### Playwright E2E Tests

1. **Use constants for test data**:
   ```javascript
   const REPOSITORY = 'https://github.com/DEFRA/find-ffa-data-ingester'
   ```
2. **Test status polling behavior** - verify initial status and transitions
3. **Verify GOV.UK styling** - check heading hierarchy, table structure
4. **Test realistic user flows** - complete form submissions, navigation
5. **Use role-based selectors** - preferred for GOV.UK components
6. **Scope selectors properly** - avoid strict mode violations

## Running Tests

### Jest Commands

```bash
npm test                   # Run all Jest tests with coverage
npm run test:watch         # Run tests in watch mode
```

### Playwright Commands

```bash
npm run test:e2e           # Run all Playwright tests
npm run test:e2e:ui        # Run with Playwright UI
npm run test:e2e:debug     # Debug mode
npm run test:e2e:report    # View test report
```

## Debugging Tips

### Jest

- Use `console.log` in tests to inspect mock call arguments
- Check `mockH.view.mock.calls` to see actual template data
- Verify `fetchSpy.mock.calls` to ensure correct API calls
- Test both success and error scenarios for complete coverage

### Playwright

- Use `await page.pause()` to debug interactively
- Check for strict mode violations by scoping selectors properly
- Verify GOV.UK component roles match expected patterns
- Test with real data that matches production scenarios
