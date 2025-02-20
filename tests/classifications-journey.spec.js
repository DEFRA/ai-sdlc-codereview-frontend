import { test, expect } from '@playwright/test'

test.describe('Classifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/standards')
  })

  test.describe('Classification Management Journey', () => {
    test('should create, view and delete a classification', async ({
      page
    }) => {
      // Navigate to classifications page
      await page.getByRole('link', { name: 'Classifications' }).click()
      await expect(
        page.getByRole('heading', { name: 'Manage Classifications' })
      ).toBeVisible()

      // Verify table headers and structure
      const table = page.getByRole('table', { name: 'Classifications' })
      await expect(table).toBeVisible()
      await expect(
        page.getByRole('columnheader', { name: 'Name' })
      ).toBeVisible()
      await expect(
        page.getByRole('columnheader', { name: 'Creation date' })
      ).toBeVisible()
      await expect(
        page.getByRole('columnheader', { name: 'Actions' })
      ).toBeVisible()

      // Verify existing classifications
      const existingClassifications = ['Javascript', 'Java', 'Node.js', 'C#']
      for (const classification of existingClassifications) {
        const row = page.getByRole('row', { name: new RegExp(classification) })
        await expect(
          row.getByRole('cell', { name: classification, exact: true })
        ).toBeVisible()
      }
      await expect(page.getByRole('cell', { name: '.Net' })).not.toBeVisible()

      // Add new classification .Net
      await page.getByLabel('Add new classification').fill('.Net')
      await page.getByRole('button', { name: 'Add classification' }).click()

      // Verify new classification in list
      const newRow = page.getByRole('row', { name: /.Net/ })
      await expect(
        newRow.getByRole('cell', { name: '.Net', exact: true })
      ).toBeVisible()

      // Verify delete button is accessible
      const deleteButton = page.getByRole('button', {
        name: 'Delete .Net classification'
      })
      await expect(deleteButton).toHaveAttribute(
        'aria-label',
        'Delete .Net classification'
      )

      // Delete the classification
      await deleteButton.click()

      // Verify deletion
      await expect(page.getByRole('cell', { name: '.Net' })).not.toBeVisible()
    })
  })
})
