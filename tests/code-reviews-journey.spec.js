import { test, expect } from '@playwright/test'

test.describe('Code Reviews', () => {
  const REPOSITORY = 'https://github.com/DEFRA/find-ffa-data-ingester'

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Code Review Management Journey', () => {
    test('should generate a code review with status started', async ({
      page
    }) => {
      await page.getByRole('textbox', { name: 'Repository URL' }).click()
      await page
        .getByRole('textbox', { name: 'Repository URL' })
        .fill(REPOSITORY)
      await page.getByRole('textbox', { name: 'Repository URL' }).press('Tab')
      await page.getByRole('checkbox', { name: 'Test Standards' }).check()
      await page.getByRole('button', { name: 'Generate code review' }).click()

      // Code Review Details Page
      await expect(
        page.getByRole('heading', { name: 'Code Review Details' })
      ).toBeVisible()
      await expect(
        page.getByRole('status', { name: 'Review status: Started' })
      ).toBeVisible()
      await expect(page.getByRole('link', { name: REPOSITORY })).toBeVisible()
      await expect(page.getByText('No compliance reports')).toBeVisible()

      await page
        .getByRole('link', { name: 'Return to code reviews list' })
        .click()

      // Code Reviews List Page
      await expect(
        page.getByRole('heading', { name: 'Code Reviews' })
      ).toBeVisible()
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

      // first row is the new code review
      const firstDataRow = page.getByRole('row').nth(1)
      await expect(firstDataRow).toBeVisible()
      await expect(
        firstDataRow.getByRole('link', { name: REPOSITORY })
      ).toBeVisible()
      await expect(
        firstDataRow.getByRole('status', { name: 'Review status: Started' })
      ).toBeVisible()
    })
  })
})
