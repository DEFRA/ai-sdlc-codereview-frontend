---
applyTo: '**/*.njk,src/client/**/*'
---

# Frontend Patterns - Templates & Client JavaScript

This file provides comprehensive guidance for Nunjucks templates and client-side JavaScript patterns.

## Project Context

This is a **server-side rendered application** using:

- **Nunjucks** templating engine with GOV.UK Frontend components
- **Progressive enhancement** with minimal client-side JavaScript
- **GOV.UK Design System** components and styling
- **Accessibility-first** approach with proper ARIA labels and semantic HTML

## Template Patterns

### Standard Template Layout

```njk
{% extends "layouts/page.njk" %}

{% from "govuk/components/button/macro.njk" import govukButton %}
{% from "govuk/components/table/macro.njk" import govukTable %}
{% from "govuk/components/tag/macro.njk" import govukTag %}
{% from "govuk/components/summary-list/macro.njk" import govukSummaryList %}

{% block pageTitle %}Page Title - Intelligent Code Reviewer{% endblock %}

{% block content %}
  <div class="govuk-width-container">
    <h1 class="govuk-heading-l">Page Heading</h1>
    <!-- Content here -->
  </div>
{% endblock %}
```

### Required Template Blocks

- **`pageTitle`**: Always include with " - Intelligent Code Reviewer" suffix
- **`content`**: Main content area wrapped in `govuk-width-container`
- **`beforeContent`**: For breadcrumbs and back links (optional)

## GOV.UK Component Usage

### Tables with Data Labels

```njk
{{ govukTable({
  caption: "Code Reviews",
  captionClasses: "govuk-table__caption--l",
  head: [
    { text: "Code Repository" },
    { text: "Created" },
    { text: "Updated" },
    { text: "Status" }
  ],
  rows: tableRows
}) }}
```

**Controller must format data as:**

```javascript
const tableRows = data.map((item) => [
  {
    html: `<a href="/link" class="govuk-link">${item.url}</a>`,
    attributes: { 'data-label': 'Code Repository' }
  },
  {
    html: `<time datetime="${item.created}">${formatDate(item.created)}</time>`,
    attributes: { 'data-label': 'Created' }
  }
])
```

### Status Tags with Colors

```njk
{{ govukTag({
  text: review.status | replace("_", " ") | title,
  classes: "govuk-tag--" + (
    review.status | lower == "failed" and "red" or
    (review.status | lower == "completed" and "green" or "blue")
  ),
  attributes: {
    "role": "status",
    "aria-label": "Review status: " + (review.status | replace("_", " ") | title),
    "data-review-id": review._id
  }
}) }}
```

### Summary Lists for Details Pages

```njk
{{ govukSummaryList({
  role: "contentinfo",
  ariaLabel: "Code review information",
  rows: [
    {
      key: { text: "Code Repository", classes: "govuk-!-width-one-third" },
      value: {
        html: '<a href="' + review.repository_url + '" class="govuk-link" target="_blank" rel="noopener noreferrer">' + review.repository_url + ' (opens in new tab)</a>',
        classes: "govuk-!-width-two-thirds"
      }
    }
  ]
}) }}
```

## Accessibility Patterns

### Semantic HTML and ARIA

```njk
<!-- Status indicators -->
<strong class="govuk-tag" role="status" aria-label="Review status: {{ status }}">
  {{ status }}
</strong>

<!-- External links -->
<a href="{{ url }}" class="govuk-link" target="_blank" rel="noopener noreferrer">
  {{ text }} (opens in new tab)
</a>

<!-- Navigation links -->
<a href="/code-reviews" class="govuk-link" aria-label="Return to code reviews list">
  Back to code reviews
</a>
```

### Proper Heading Hierarchy

```njk
<!-- Always start with h1 -->
<h1 class="govuk-heading-l">Main Page Title</h1>

<!-- Subsections use h2 -->
<h2 class="govuk-heading-m">Subsection</h2>

<!-- Details use h3 -->
<h3 class="govuk-heading-s">Detail Section</h3>
```

## Error and Empty States

### Error Messages

```njk
{% if error %}
  <div class="govuk-error-summary" aria-labelledby="error-summary-title" role="alert">
    <h2 class="govuk-error-summary__title" id="error-summary-title">
      There is a problem
    </h2>
    <div class="govuk-error-summary__body">
      <p class="govuk-body">{{ error.message }}</p>
    </div>
  </div>
{% endif %}
```

### Empty States

```njk
{% if items and items | length > 0 %}
  <!-- Display items -->
{% else %}
  <div class="govuk-inset-text" role="region" aria-label="No results">
    <p class="govuk-body">No compliance reports available yet.</p>
    <p class="govuk-body">Reports will appear here once the code review is completed.</p>
  </div>
{% endif %}
```

## Client JavaScript Patterns

### Architecture Principles

- **Server-side rendering first** - pages work without JavaScript
- **JavaScript enhances** existing functionality, doesn't replace it
- **GOV.UK components** handle most interactive behavior
- **Progressive enhancement** with feature detection

### Entry Point Pattern

```javascript
// src/client/javascripts/application.js
import { createAll } from 'govuk-frontend'
import { initStatusPolling } from './code-review-status.js'

// Initialize GOV.UK components
createAll()

// Initialize custom features
if (document.querySelector('[data-review-id]')) {
  initStatusPolling()
}
```

### GOV.UK Frontend Integration

```javascript
import { createAll } from 'govuk-frontend'

// Initialize all GOV.UK components on page load
createAll()

// Or initialize specific components
import { Button } from 'govuk-frontend'
const buttons = document.querySelectorAll('[data-module="govuk-button"]')
buttons.forEach((button) => new Button(button).init())
```

### Module Structure

```javascript
/**
 * @typedef {object} StatusResponse
 * @property {string} id - The review ID
 * @property {string} status - Current status
 */

/**
 * Main initialization function
 */
export function initFeature() {
  // Feature logic here
}

/**
 * Internal helper functions
 */
function helperFunction() {
  // Implementation
}

/**
 * Export internal functions for testing only
 */
export const __testing__ = {
  helperFunction,
  otherInternalFunction
}
```

### Status Polling Implementation

```javascript
/**
 * Updates the status tag element with new status
 * @param {HTMLElement} statusElement - The status tag element
 * @param {string} newStatus - The new status value
 */
function updateStatusElement(statusElement, newStatus) {
  const formattedStatus = newStatus.replace('_', ' ')
  const titleStatus =
    formattedStatus.charAt(0).toUpperCase() + formattedStatus.slice(1)

  statusElement.textContent = titleStatus
  statusElement.setAttribute('aria-label', `Review status: ${titleStatus}`)

  // Update tag color classes
  statusElement.className = 'govuk-tag'
  if (newStatus === 'failed') {
    statusElement.classList.add('govuk-tag--red')
  } else if (newStatus === 'completed') {
    statusElement.classList.add('govuk-tag--green')
  } else {
    statusElement.classList.add('govuk-tag--blue')
  }
}

export function initStatusPolling() {
  let pollingInterval = null

  async function checkStatuses() {
    const statusElements = document.querySelectorAll('[data-review-id]')
    let hasInProgressReviews = false

    for (const element of statusElements) {
      const currentStatus = element.textContent.toLowerCase().trim()
      const reviewId = element.getAttribute('data-review-id')

      if (needsPolling(currentStatus)) {
        hasInProgressReviews = true
        try {
          const { status } = await fetchReviewStatus(reviewId)
          if (status !== currentStatus) {
            updateStatusElement(element, status)
          }
          hasInProgressReviews = hasInProgressReviews || needsPolling(status)
        } catch (error) {
          hasInProgressReviews = true // Keep polling on error
        }
      }
    }

    // Stop polling when no active reviews
    if (!hasInProgressReviews && pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  // Start polling every 10 seconds
  pollingInterval = setInterval(() => {
    checkStatuses().catch(() => {})
  }, 10000)

  checkStatuses().catch(() => {})
}
```

### API Integration

```javascript
async function fetchReviewStatus(reviewId) {
  const response = await fetch(`/api/code-reviews/${reviewId}/status`)
  if (!response.ok) {
    throw new Error(
      `Failed to fetch status for review ${reviewId}: ${response.status}`
    )
  }
  return response.json()
}

async function submitData(data) {
  const response = await fetch('/api/endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error(`Submission failed: ${response.status}`)
  }

  return response.json()
}
```

### Event Handling

```javascript
function initFormEnhancements() {
  const form = document.querySelector('#code-review-form')
  if (!form) return

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    try {
      await submitForm(form)
    } catch (error) {
      displayError('Unable to submit form. Please try again.')
    }
  })
}

// Use event delegation for dynamic content
document.addEventListener('click', (event) => {
  if (event.target.matches('.js-toggle-details')) {
    toggleDetails(event.target)
  }
})
```

## Frontend Best Practices

### Templates

1. **Always import macros at the top** of the template
2. **Use consistent indentation** (2 spaces) for readability
3. **Include ARIA labels** for interactive elements
4. **Wrap content in `govuk-width-container`** for proper layout
5. **Use semantic HTML elements** (time, section, article)
6. **Include data attributes** for JavaScript targeting (`data-review-id`)

### Client JavaScript

1. **Progressive Enhancement** - all functionality works without JavaScript
2. **Feature Detection** - check for element existence before manipulation
3. **Error Boundaries** - wrap async operations in try/catch
4. **User Feedback** - provide clear loading states and error messages
5. **Performance** - cache DOM queries and debounce expensive operations
6. **Testing** - export internal functions with `__testing__` pattern

## Common Gotchas

### Templates

- **Don't format dates in templates** - use formatted data from controllers
- **Always include `role="status"`** for status indicators
- **Use `target="_blank" rel="noopener noreferrer"`** for external links
- **Test responsive behavior** especially for tables on mobile

### Client JavaScript

- **Check for required browser features** before enhancement
- **Use data attributes** for DOM targeting, not classes
- **Handle missing DOM elements** gracefully
- **Clean up event listeners** when needed
