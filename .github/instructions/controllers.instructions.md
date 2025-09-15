---
applyTo: '**/controller.js'
---

# Hapi.js Controller Instructions

This file provides specific guidance for working with Hapi.js controller files (`**/controller.js`) in this DEFRA application.

## Project Context

This is a **Hapi.js server-side application** where controllers:

- Handle **HTTP requests** with `(request, h)` function signatures
- **Fetch data from external APIs** using the fetch API
- **Render Nunjucks templates** using `h.view()`
- **Handle errors gracefully** with user-friendly messages
- **Log errors with context** using `request.logger.error()`

## Controller Function Patterns

### Standard Function Structure

```javascript
/**
 * Handler for feature list page
 * @param {Request} request - Hapi request object
 * @param {ResponseToolkit} h - Hapi response toolkit
 */
export async function getFeatureList(request, h) {
  try {
    const response = await fetch(`${config.get('apiBaseUrl')}/api/v1/features`)

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    const features = await response.json()

    return h.view('features/index', {
      pageTitle: 'Features',
      features: formatFeaturesForTable(features)
    })
  } catch (err) {
    request.logger.error('Error fetching features:', err)
    return h.view('error/index', {
      statusCode: 500,
      message: 'Unable to fetch features'
    })
  }
}
```

### Function Export Pattern

```javascript
// Always use named exports
export async function getFeature(request, h) {
  /* */
}
export async function createFeature(request, h) {
  /* */
}
export async function updateFeature(request, h) {
  /* */
}
export async function deleteFeature(request, h) {
  /* */
}
```

## API Integration Patterns

### Standard Fetch Pattern

```javascript
const response = await fetch(`${config.get('apiBaseUrl')}/api/v1/endpoint`)

if (!response.ok) {
  throw new Error(`API returned ${response.status}`)
}

const data = await response.json()
```

### POST Requests with Data

```javascript
const response = await fetch(`${config.get('apiBaseUrl')}/api/v1/endpoint`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(requestData)
})
```

## Error Handling Patterns

### HTTP Status Code Handling

```javascript
export async function getCodeReviewById(request, h) {
  try {
    const { id } = request.params
    const response = await fetch(
      `${config.get('apiBaseUrl')}/api/v1/code-reviews/${id}`
    )

    if (response.status === 404) {
      return h.view('error/index', {
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
    }

    if (response.status === 401) {
      return h.view('error/index', {
        pageTitle: 'Unauthorized',
        heading: 'You are not authorized to view this code review',
        message:
          'Please check that you have the correct permissions and try again.'
      })
    }

    if (response.status === 403) {
      return h.view('error/index', {
        pageTitle: 'Forbidden',
        heading: 'You do not have permission to view this code review',
        message:
          'Please contact your administrator if you believe this is incorrect.'
      })
    }

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    const review = await response.json()

    return h.view('code-reviews/detail', {
      pageTitle: 'Code Review Details',
      review: formatReviewData(review)
    })
  } catch (err) {
    request.logger.error('Error fetching code review:', err)
    return h.view('error/index', {
      pageTitle: 'Sorry, there is a problem with the service',
      heading: 'Sorry, there is a problem with the service',
      message:
        'Try again later. If the problem persists, please contact support.',
      statusCode: 500
    })
  }
}
```

### Error Logging Standards

```javascript
// Always log errors with descriptive context
request.logger.error('Error fetching code reviews:', err)
request.logger.error('Error creating code review:', err)
request.logger.error('Error updating code review status:', err)
```

## Response Patterns

### Template Rendering

```javascript
return h.view('template-path', {
  pageTitle: 'Page Title',
  data: formattedData
})
```

### JSON API Responses

```javascript
export async function getCodeReviewStatus(request, h) {
  try {
    const { id } = request.params
    const response = await fetch(
      `${config.get('apiBaseUrl')}/api/v1/code-reviews/${id}`
    )

    if (!response.ok) {
      return h
        .response({ error: 'Failed to fetch review status' })
        .code(response.status)
    }

    const review = await response.json()
    return h.response({
      id: review._id,
      status: review.status
    })
  } catch (err) {
    request.logger.error('Error fetching code review status:', err)
    return h.response({ error: 'Internal server error' }).code(500)
  }
}
```

### Redirects

```javascript
// For successful form submissions
return h.redirect('/code-reviews')

// With status code
return h.redirect('/code-reviews').code(302)
```

## Data Formatting Functions

### Date Formatting

```javascript
/**
 * Formats a date string into GOV.UK standard format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string (e.g., "14 January 2024 at 2:00pm")
 */
function formatDate(dateString) {
  const date = new Date(dateString)
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  let hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'pm' : 'am'
  hours = hours % 12
  hours = hours || 12 // Convert 0 to 12

  return `${day} ${month} ${year} at ${hours}:${minutes}${ampm}`
}
```

### Table Data Formatting for GOV.UK Components

```javascript
function formatCodeReviewsForTable(codeReviews) {
  return codeReviews.map((review) => [
    {
      html: `<a href="/code-reviews/${review._id}" class="govuk-link" aria-label="View details for code review of ${review.repository_url}">${review.repository_url}</a>`,
      attributes: { 'data-label': 'Code Repository' }
    },
    {
      html: `<time datetime="${review.created_at}">${formatDate(review.created_at)}</time>`,
      attributes: { 'data-label': 'Created' }
    },
    {
      html: `<time datetime="${review.updated_at}">${formatDate(review.updated_at)}</time>`,
      attributes: { 'data-label': 'Updated' }
    },
    {
      html: `<strong class="govuk-tag ${getStatusTagClass(review.status)}" role="status" data-review-id="${review._id}" aria-label="Review status: ${formatStatusText(review.status)}">${formatStatusText(review.status)}</strong>`,
      attributes: { 'data-label': 'Status' }
    }
  ])
}

function getStatusTagClass(status) {
  if (status === 'failed') return 'govuk-tag--red'
  if (status === 'completed') return 'govuk-tag--green'
  return '' // Default blue
}

function formatStatusText(status) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}
```

### Markdown Processing

```javascript
import { markdown } from '~/src/config/nunjucks/filters/markdown.js'

// Format compliance reports with markdown
if (review.compliance_reports && review.compliance_reports.length > 0) {
  review.compliance_reports = review.compliance_reports.map((report) => ({
    ...report,
    report: markdown(report.report)
  }))
}
```

## Form Handling Patterns

### GET Handler (Display Form)

```javascript
export function getCreateForm(request, h) {
  return h.view('features/create', {
    pageTitle: 'Create Feature',
    formData: {},
    errors: {}
  })
}
```

### POST Handler (Process Form)

```javascript
export async function postCreateForm(request, h) {
  try {
    const formData = request.payload

    // Validate input
    const errors = validateFormData(formData)
    if (Object.keys(errors).length > 0) {
      return h.view('features/create', {
        pageTitle: 'Create Feature',
        formData,
        errors
      })
    }

    // Submit to API
    const response = await fetch(
      `${config.get('apiBaseUrl')}/api/v1/features`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      }
    )

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    return h.redirect('/features')
  } catch (err) {
    request.logger.error('Error creating feature:', err)
    return h.view('features/create', {
      pageTitle: 'Create Feature',
      formData: request.payload,
      errors: { general: 'Unable to create feature. Please try again.' }
    })
  }
}
```

## Request Parameter Handling

### URL Parameters

```javascript
export async function getFeatureById(request, h) {
  const { id } = request.params
  // Use id...
}
```

### Query Parameters

```javascript
export async function getFeatures(request, h) {
  const { status, page = 1 } = request.query
  // Use query parameters...
}
```

### Request Payload

```javascript
export async function updateFeature(request, h) {
  const { id } = request.params
  const updateData = request.payload
  // Use payload...
}
```

## Controller Best Practices

1. **Always use try/catch blocks** for async operations
2. **Log errors with descriptive context** using `request.logger.error()`
3. **Return user-friendly error messages** - never expose internal errors
4. **Format dates consistently** using the project's `formatDate()` function
5. **Structure table data properly** for GOV.UK components
6. **Include accessibility attributes** in HTML generation
7. **Use descriptive JSDoc comments** for function documentation
8. **Handle all expected HTTP status codes** explicitly
9. **Include `pageTitle` in all view responses**
10. **Use meaningful variable names** that describe the data

## Common Gotchas

- **Don't forget error logging** - always log before returning error views
- **Format data for templates** - don't pass raw API responses to views
- **Include data attributes** for JavaScript (`data-review-id`, etc.)
- **Handle edge cases** - empty arrays, null values, network timeouts
- **Use consistent status tag classes** - follow the established color patterns
- **Test with real API responses** - including error scenarios
