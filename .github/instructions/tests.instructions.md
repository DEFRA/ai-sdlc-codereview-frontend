---
applyTo: "tests/**/*"
---

# Playwright End-to-End Testing Instructions

This file provides specific guidance for working with Playwright tests in the `/tests` directory.

## Project Context

This is a **server-side rendered DEFRA web application** using:
- **GOV.UK Frontend** components with specific role-based selectors
- **Hapi.js backend** serving Nunjucks templates
- **Real user journeys** from form submission to result display

## Test Structure and Organization

### File Naming Convention
- Place all E2E tests in `/tests` directory
- Use `.spec.js` extension (e.g., `code-reviews-journey.spec.js`)
- Name tests after user journeys, not technical features

### Standard Test Setup
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

## GOV.UK Component Testing Patterns

### Selector Priority (Use in this order)
1. **Role-based selectors** (preferred for GOV.UK components):
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

3. **ARIA labels and semantic HTML**:
   ```javascript
   page.getByRole('link', { name: 'Return to code reviews list' })
   ```

### Common GOV.UK Components

#### Tables
```javascript
// Table headers
await expect(page.getByRole('columnheader', { name: 'Code Repository' })).toBeVisible()

// Table rows with scoping
const firstDataRow = page.getByRole('row').nth(1)
await expect(firstDataRow).toBeVisible()
```

#### Status Tags
```javascript
// Status tags use role="status"
await expect(page.getByRole('status', { name: 'Review status: Started' })).toBeVisible()
```

#### Forms and Inputs
```javascript
// Form fields by label
await page.getByRole('textbox', { name: 'Repository URL' }).fill(REPOSITORY)
await page.getByRole('checkbox', { name: 'Test Standards' }).check()
```

## Testing Patterns

### User Journey Testing
- **Focus on complete workflows**: Form submission → Processing → Results
- **Test real data flows**: Use actual repository URLs and expected responses
- **Verify state transitions**: Status changes, page redirections, content updates

### Page Navigation
```javascript
test('should navigate through code review workflow', async ({ page }) => {
  // Start at home page
  await page.goto('/')
  
  // Submit form
  await page.getByRole('textbox', { name: 'Repository URL' }).fill(REPOSITORY)
  await page.getByRole('button', { name: 'Generate code review' }).click()
  
  // Verify navigation to details page
  await expect(page.getByRole('heading', { name: 'Code Review Details' })).toBeVisible()
  
  // Navigate back to list
  await page.getByRole('link', { name: 'Return to code reviews list' }).click()
  await expect(page.getByRole('heading', { name: 'Code Reviews' })).toBeVisible()
})
```

### Content Verification
- **Check for exact text matches** when testing GOV.UK content
- **Verify accessibility attributes** (roles, ARIA labels)
- **Test responsive behavior** (tables, forms)

## Error Handling and Edge Cases

### Test Server Errors
```javascript
test('should handle API errors gracefully', async ({ page }) => {
  // Test error states, 404 pages, validation errors
  // Verify user-friendly error messages appear
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

## Project-Specific Testing Rules

1. **Use constants for test data**:
   ```javascript
   const REPOSITORY = 'https://github.com/DEFRA/find-ffa-data-ingester'
   ```

2. **Test status polling behavior**:
   - Verify initial "Started" status
   - Test status transitions (if applicable)
   - Check `data-review-id` attributes

3. **Verify GOV.UK styling**:
   - Check for proper heading hierarchy
   - Verify table structure and responsiveness
   - Test form validation messages

4. **Test realistic user flows**:
   - Complete form submissions
   - Navigation between pages
   - Back button behavior

## Commands to Run Tests

```bash
npm run test:e2e           # Run all Playwright tests
npm run test:e2e:ui        # Run with Playwright UI
npm run test:e2e:debug     # Debug mode
npm run test:e2e:report    # View test report
```

## Debugging Tips

- Use `await page.pause()` to debug interactively
- Check for strict mode violations by scoping selectors properly
- Verify GOV.UK component roles match expected patterns
- Test with real data that matches production scenarios