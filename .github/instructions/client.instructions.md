---
applyTo: 'src/client/**/*'
---

# Client-Side JavaScript Instructions

This file provides specific guidance for working with client-side JavaScript files in the `src/client/` directory.

## Project Context

This is a **server-side rendered application** with **minimal client-side JavaScript**:

- **Progressive Enhancement**: All core functionality works without JavaScript
- **GOV.UK Frontend Integration**: Initialize and enhance GOV.UK components
- **Status Polling**: Real-time updates for code review progress
- **ES Modules**: Modern JavaScript with named exports
- **Testing**: Export internal functions for unit testing

## Architecture Principles

### Minimal JavaScript Approach

- **Server-side rendering first** - pages work without JavaScript
- **JavaScript enhances** existing functionality, doesn't replace it
- **GOV.UK components** handle most interactive behavior
- **Custom JavaScript** only for application-specific features

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

## GOV.UK Frontend Integration

### Component Initialization

```javascript
import { createAll } from 'govuk-frontend'

// Initialize all GOV.UK components on page load
createAll()

// Or initialize specific components
import { Button } from 'govuk-frontend'
const buttons = document.querySelectorAll('[data-module="govuk-button"]')
buttons.forEach((button) => new Button(button).init())
```

### Feature Detection

```javascript
// Only initialize features if required elements exist
if (document.querySelector('[data-review-id]')) {
  initStatusPolling()
}

if (document.querySelector('.js-enhanced-form')) {
  enhanceForm()
}
```

## Custom JavaScript Patterns

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

/**
 * Fetches updated status for a code review
 * @param {string} reviewId - The ID of the review
 * @returns {Promise<StatusResponse>}
 */
async function fetchReviewStatus(reviewId) {
  const response = await fetch(`/api/code-reviews/${reviewId}/status`)
  if (!response.ok) {
    throw new Error(
      `Failed to fetch status for review ${reviewId}: ${response.status}`
    )
  }
  return response.json()
}
```

### DOM Manipulation Patterns

```javascript
// Use data attributes for element targeting
const statusElements = document.querySelectorAll('[data-review-id]')

// Check for element existence before manipulation
const form = document.querySelector('#enhanced-form')
if (form) {
  enhanceForm(form)
}

// Use semantic selectors when possible
const submitButton = document.querySelector('input[type="submit"]')
const backLinks = document.querySelectorAll('.govuk-back-link')
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

## API Integration Patterns

### Fetch with Error Handling

```javascript
async function fetchData(url) {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}
```

### POST Requests

```javascript
async function submitData(data) {
  const response = await fetch('/api/endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error(`Submission failed: ${response.status}`)
  }

  return response.json()
}
```

## Polling and Real-Time Updates

### Intelligent Polling

```javascript
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
    checkStatuses().catch(() => {
      // Silent error handling
    })
  }, 10000)

  // Initial check
  checkStatuses().catch(() => {})
}

function needsPolling(status) {
  const pollStatuses = ['pending', 'in progress', 'started']
  return pollStatuses.includes(status.toLowerCase().trim())
}
```

## Testing Export Patterns

### Internal Function Exports

```javascript
// Main feature functions
export function initStatusPolling() {
  // Implementation
}

export function initFormValidation() {
  // Implementation
}

// Test-only exports
export const __testing__ = {
  updateStatusElement,
  fetchReviewStatus,
  needsPolling,
  validateFormField
}
```

### Testable Function Design

```javascript
// Good: Pure function that can be easily tested
function formatStatusText(status) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

// Good: Function with clear inputs/outputs
function isValidUrl(url) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
```

## Import Patterns

### Absolute Imports

```javascript
// Use ~ alias for project files
import { config } from '~/src/config/config.js'
import { helper } from '~/src/client/common/helpers/utility.js'
```

### External Dependencies

```javascript
// GOV.UK Frontend
import { createAll, Button, Details } from 'govuk-frontend'

// Other libraries (when needed)
import axios from 'axios'
```

## Error Handling and User Feedback

### User-Friendly Errors

```javascript
function displayError(message) {
  const errorContainer = document.querySelector('.js-error-container')
  if (errorContainer) {
    errorContainer.innerHTML = `
      <div class="govuk-error-summary" role="alert">
        <h2 class="govuk-error-summary__title">There is a problem</h2>
        <div class="govuk-error-summary__body">
          <p class="govuk-body">${message}</p>
        </div>
      </div>
    `
  }
}
```

### Graceful Degradation

```javascript
function enhanceFeature() {
  // Check for required browser features
  if (!window.fetch || !window.Promise) {
    console.warn('Browser does not support required features')
    return
  }

  // Check for required DOM elements
  const targetElement = document.querySelector('[data-enhance]')
  if (!targetElement) {
    return
  }

  // Apply enhancement
  applyEnhancement(targetElement)
}
```

## Performance Considerations

### Efficient DOM Queries

```javascript
// Cache DOM queries
const statusElements = document.querySelectorAll('[data-review-id]')

// Use efficient selectors
const form = document.getElementById('specific-form')
const buttons = document.getElementsByClassName('js-button')
```

### Event Listener Management

```javascript
class FeatureManager {
  constructor() {
    this.boundHandlers = {
      handleSubmit: this.handleSubmit.bind(this),
      handleChange: this.handleChange.bind(this)
    }
  }

  init() {
    document.addEventListener('submit', this.boundHandlers.handleSubmit)
    document.addEventListener('change', this.boundHandlers.handleChange)
  }

  destroy() {
    document.removeEventListener('submit', this.boundHandlers.handleSubmit)
    document.removeEventListener('change', this.boundHandlers.handleChange)
  }
}
```

## Client-Side Best Practices

1. **Progressive Enhancement** - all functionality works without JavaScript
2. **Feature Detection** - check for element existence before manipulation
3. **Error Boundaries** - wrap async operations in try/catch
4. **User Feedback** - provide clear loading states and error messages
5. **Performance** - cache DOM queries and debounce expensive operations
6. **Accessibility** - maintain ARIA attributes and focus management
7. **Testing** - export internal functions with `__testing__` pattern
8. **Documentation** - use JSDoc for complex functions
9. **Standards Compliance** - follow GOV.UK component patterns
10. **Graceful Degradation** - handle missing browser features
