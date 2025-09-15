---
applyTo: "**/*.test.js"
---

# Jest Unit Testing Instructions

This file provides specific guidance for working with Jest unit tests (files matching `*.test.js` pattern).

## Project Context

This is a **Hapi.js server-side application** where Jest tests focus on:
- **Controller functions** with `(request, h)` signatures
- **API integration** mocking with `fetch`
- **Error handling** and logging patterns
- **Data transformation** and formatting logic

## Test Structure Patterns

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

## API Integration Testing

### Fetch Mocking Pattern
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
Test all specific status codes your controllers handle:

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
    message: 'The code review you are looking for does not exist. This may be because:',
    messageList: [
      'the URL is incorrect',
      'the code review has been deleted',
      'you do not have permission to view this code review'
    ]
  })
})
```

## Controller Testing Patterns

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

### Error Logging Tests
```javascript
it('should log errors with context', async () => {
  const error = new Error('Test error')
  fetchSpy.mockRejectedValueOnce(error)

  await controllerFunction(mockRequest, mockH)

  expect(mockRequest.logger.error).toHaveBeenCalledWith(
    expect.stringContaining('Error description'),
    error
  )
})
```

## Data Transformation Testing

### Date Formatting Tests
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

  it('should handle midnight (12am)', async () => {
    const midnightReview = {
      ...mockReview,
      created_at: '2024-01-14T00:00:00Z'
    }

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(midnightReview)
    })

    await getCodeReviewById(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith('code-reviews/detail', {
      pageTitle: 'Code Review Details', 
      review: expect.objectContaining({
        created_at: '14 January 2024 at 12:00am'
      })
    })
  })
})
```

### GOV.UK Table Data Formatting
```javascript
it('should format table data correctly for govukTable macro', async () => {
  await getCodeReviews(mockRequest, mockH)

  expect(mockH.view).toHaveBeenCalledWith('code-reviews/index', {
    pageTitle: 'Code Reviews',
    tableRows: [
      [
        {
          html: expect.stringContaining('<a href="/code-reviews/'),
          attributes: { 'data-label': 'Code Repository' }
        },
        {
          html: expect.stringContaining('<time datetime="'),
          attributes: { 'data-label': 'Created' }
        },
        {
          html: expect.stringContaining('govuk-tag'),
          attributes: { 'data-label': 'Status' }
        }
      ]
    ]
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
  expect(tableRows[0][3].html).toContain('govuk-tag--red')      // failed
  expect(tableRows[1][3].html).toContain('govuk-tag--green')    // completed  
  expect(tableRows[2][3].html).not.toContain('govuk-tag--')     // pending (default)
})
```

## API Response Testing

### JSON API Tests
```javascript
it('should return JSON response for API endpoints', async () => {
  fetchSpy.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(mockReview)
  })

  await getCodeReviewStatus(mockRequest, mockH)

  expect(mockH.response).toHaveBeenCalledWith({
    id: mockReview._id,
    status: mockReview.status
  })
})
```

## Markdown Processing Tests
```javascript
it('should format markdown in compliance reports', async () => {
  const reviewWithReports = {
    ...mockReview,
    compliance_reports: [
      {
        id: '1',
        report: '# Test Report\n- Item 1\n- Item 2'
      }
    ]
  }

  fetchSpy.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(reviewWithReports)
  })

  await getCodeReviewById(mockRequest, mockH)

  expect(mockH.view).toHaveBeenCalledWith('code-reviews/detail', {
    pageTitle: 'Code Review Details',
    review: expect.objectContaining({
      compliance_reports: [
        expect.objectContaining({
          report: expect.stringContaining('<h1>Test Report</h1>')
        })
      ]
    })
  })
})
```

## Testing Best Practices

1. **Test user-visible behavior**, not implementation details
2. **Mock external dependencies** (fetch, Redis, etc.)
3. **Use descriptive test names** that explain the scenario
4. **Group related tests** with `describe` blocks
5. **Test edge cases**: empty data, network errors, invalid responses
6. **Verify error logging** happens with appropriate context
7. **Test data transformations** (dates, status colors, markdown)

## Commands to Run Tests

```bash
npm test                   # Run all Jest tests with coverage
npm run test:watch         # Run tests in watch mode
```

## Debugging Tips

- Use `console.log` in tests to inspect mock call arguments
- Check `mockH.view.mock.calls` to see actual template data
- Verify `fetchSpy.mock.calls` to ensure correct API calls
- Test both success and error scenarios for complete coverage