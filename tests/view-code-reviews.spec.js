import { test, expect } from '@playwright/test'

test.describe('Code Reviews', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display existing code reviews correctly', async ({ page }) => {
    // Navigate to code reviews page
    await page.getByRole('link', { name: 'View code reviews' }).click()
    await expect(
      page.getByRole('heading', { name: 'Code Reviews' })
    ).toBeVisible()

    // Verify table caption and structure
    await expect(
      page.getByRole('table', {
        name: 'List of all code reviews with their status'
      })
    ).toBeVisible()
    await expect(page.getByText('Current Code Reviews')).toBeVisible()

    // Verify table headers
    await expect(
      page.getByRole('columnheader', { name: 'Code Repository' })
    ).toBeVisible()
    await expect(
      page.getByRole('columnheader', { name: 'Created' })
    ).toBeVisible()
    await expect(
      page.getByRole('columnheader', { name: 'Updated' })
    ).toBeVisible()
    await expect(
      page.getByRole('columnheader', { name: 'Status' })
    ).toBeVisible()

    // Verify first code review in the list
    const firstRow = page.getByRole('row').nth(1) // 0 is header row
    await expect(
      firstRow.getByRole('link', {
        name: /github\.com\/DEFRA\/find-ffa-data-ingester/
      })
    ).toBeVisible()
    await expect(
      firstRow.getByRole('status', { name: 'Review status: Completed' })
    ).toBeVisible()

    // Verify link navigation
    const repoLink = firstRow.getByRole('link', {
      name: /View details for code review of.*find-ffa-data-ingester/
    })
    await expect(repoLink).toBeVisible()
    await expect(repoLink).toHaveAttribute(
      'href',
      expect.stringContaining('/code-reviews/')
    )

    // Verify status tag styling
    const statusTag = firstRow.getByRole('status')
    await expect(statusTag).toHaveClass(/govuk-tag--green/)
  })
})
