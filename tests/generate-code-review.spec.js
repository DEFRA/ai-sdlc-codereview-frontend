import { test, expect } from '@playwright/test'
import { navigateToHome, getGdsComponentText } from './test-helpers/index.js'

test.describe('Generate Code Review Journey', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToHome(page)
  })

  test('should have correct page structure and navigation', async ({
    page
  }) => {
    // Page title
    await expect(page).toHaveTitle(/Intelligent Code Reviewer/)

    // Header structure
    const header = page.getByRole('banner')
    await expect(header).toBeVisible()
    await expect(header.getByRole('link', { name: 'GOV.UK' })).toBeVisible()
    await expect(
      getGdsComponentText(page, '.govuk-header__service-name')
    ).resolves.toContain('Intelligent Code Reviewer')

    // Navigation
    const navigation = page.getByRole('navigation')
    const expectedLinks = [
      'Generate code review',
      'View code reviews',
      'Standards'
    ]
    for (const linkText of expectedLinks) {
      await expect(
        navigation.getByRole('link', { name: linkText })
      ).toBeVisible()
    }

    // Main content structure
    await expect(
      page.getByRole('heading', { name: 'Generate Code Review', level: 1 })
    ).toBeVisible()
    await expect(
      page.getByText('Submit a git repository for code review')
    ).toBeVisible()
  })

  test('should handle form submission with validation', async ({ page }) => {
    // Form elements visibility
    const repoUrlInput = page.getByLabel('Repository URL')
    await expect(repoUrlInput).toBeVisible()
    await expect(repoUrlInput).toBeEmpty()

    const standardsGroup = page.getByRole('group', { name: 'Standards' })
    await expect(standardsGroup).toBeVisible()

    // Standards selection and associated links
    const standards = [
      {
        checkbox: 'DEFRA Software Development Standards',
        link: 'DEFRA Software Development Standards (opens in new tab)'
      },
      {
        checkbox: 'Test Standards',
        link: 'Test Standards (opens in new tab)'
      }
    ]

    for (const standard of standards) {
      await expect(page.getByLabel(standard.checkbox)).toBeVisible()
      await expect(
        page.getByRole('link', { name: standard.link })
      ).toBeVisible()
    }

    // Test form submission
    await repoUrlInput.fill('https://github.com/DEFRA/find-ffa-data-ingester')

    // Select standards
    for (const standard of standards) {
      const checkbox = page.getByLabel(standard.checkbox)
      await checkbox.check()
      await expect(checkbox).toBeChecked()
    }

    // Ready to submit form - not this test though
    const submitButton = page.getByRole('button', {
      name: 'Generate code review'
    })
    await expect(submitButton).toBeVisible()
  })
})
