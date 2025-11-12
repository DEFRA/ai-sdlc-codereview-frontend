import { test, expect } from '@playwright/test'

test.describe('Standard Sets', () => {
  const TEST_STANDARD_SET_NAME = 'Test Automation Set'
  const TEST_REPOSITORY_URL = 'https://github.com/test/automation-standards'

  test.beforeEach(async ({ page }) => {
    await page.goto('/standards/standard-sets/')
  })

  test.describe('Standard Set Management Journey', () => {
    test('should manage standard sets through complete lifecycle', async ({
      page
    }) => {
      // Step 1: Initial Page Load and Verification
      await expect(
        page.getByRole('heading', { name: 'Manage Standard Sets' })
      ).toBeVisible()

      // Verify explanatory content
      await expect(page.getByText('Use standard sets to:')).toBeVisible()
      await expect(page.getByText('manage standards sets')).toBeVisible()
      await expect(
        page.getByText('view the standards within a set')
      ).toBeVisible()
      await expect(
        page.getByText('view the classifications of each standard')
      ).toBeVisible()

      // Verify table structure
      const standardSetsTable = page.getByRole('table', {
        name: 'Standard sets list'
      })
      await expect(standardSetsTable).toBeVisible()
      await expect(
        page.getByRole('columnheader', { name: 'Name' })
      ).toBeVisible()
      await expect(
        page.getByRole('columnheader', { name: 'Repository URL' })
      ).toBeVisible()
      await expect(
        page.getByRole('columnheader', { name: 'Actions' })
      ).toBeVisible()

      // Verify add form is present
      await expect(
        page.getByRole('heading', { name: 'Add new standard set' })
      ).toBeVisible()
      await expect(page.getByRole('textbox', { name: 'Name' })).toBeVisible()
      await expect(
        page.getByRole('textbox', { name: 'Repository URL' })
      ).toBeVisible()
      await expect(
        page.getByRole('button', { name: 'Add standard set' })
      ).toBeVisible()

      // Step 2: View Existing Standard Set Details (if any exist)
      const existingStandardSetLink = page
        .getByRole('cell')
        .getByRole('link')
        .first()

      if (await existingStandardSetLink.isVisible()) {
        const standardSetName = await existingStandardSetLink.textContent()

        await existingStandardSetLink.click()

        // Verify detail page
        await expect(
          page.getByRole('heading', { name: standardSetName })
        ).toBeVisible()

        // Verify breadcrumb navigation
        await expect(
          page.getByRole('navigation', { name: 'Breadcrumb' })
        ).toBeVisible()
        await expect(page.getByRole('link', { name: 'Home' })).toBeVisible()
        await expect(
          page.getByRole('link', { name: 'Standards' })
        ).toBeVisible()
        await expect(
          page.getByRole('link', { name: 'Standard Sets' })
        ).toBeVisible()

        // Verify repository URL link is present
        const repositoryLink = page.getByRole('link', {
          name: /https:\/\/github\.com.*/
        })
        await expect(repositoryLink).toBeVisible()

        // Step 3: Navigate Back Using Breadcrumbs
        await page.getByRole('link', { name: 'Standard Sets' }).click()

        // Verify we're back on the main page
        await expect(
          page.getByRole('heading', { name: 'Manage Standard Sets' })
        ).toBeVisible()
      }

      // Step 4: Add New Standard Set
      await page
        .getByRole('textbox', { name: 'Name' })
        .fill(TEST_STANDARD_SET_NAME)
      await page
        .getByRole('textbox', { name: 'Repository URL' })
        .fill(TEST_REPOSITORY_URL)
      await page.getByRole('button', { name: 'Add standard set' }).click()

      // Verify new standard set appears in table
      const newStandardSetRow = page.getByRole('row', {
        name: new RegExp(TEST_STANDARD_SET_NAME)
      })
      await expect(newStandardSetRow).toBeVisible()
      await expect(
        newStandardSetRow.getByRole('cell', { name: TEST_STANDARD_SET_NAME })
      ).toBeVisible()
      await expect(
        newStandardSetRow.getByRole('cell', { name: TEST_REPOSITORY_URL })
      ).toBeVisible()

      // Verify form fields are cleared
      await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('')
      await expect(
        page.getByRole('textbox', { name: 'Repository URL' })
      ).toHaveValue('')

      // Verify delete button is available
      const deleteButton = page.getByRole('button', {
        name: `Delete ${TEST_STANDARD_SET_NAME} standard set`
      })
      await expect(deleteButton).toBeVisible()

      // Step 5: View New Standard Set Details
      const newStandardSetLink = newStandardSetRow.getByRole('link', {
        name: TEST_STANDARD_SET_NAME
      })
      await newStandardSetLink.click()

      // Verify detail page for new standard set
      await expect(
        page.getByRole('heading', { name: TEST_STANDARD_SET_NAME })
      ).toBeVisible()

      // Verify repository URL
      await expect(
        page.getByRole('link', {
          name: `${TEST_REPOSITORY_URL} (opens in new tab)`
        })
      ).toBeVisible()

      // Verify "No standards found" message for new standard set
      await expect(
        page.getByRole('region', { name: 'No standards found' })
      ).toBeVisible()
      await expect(
        page.getByRole('heading', { name: 'No standards found' })
      ).toBeVisible()
      await expect(
        page.getByText('This standard set does not contain any standards yet.')
      ).toBeVisible()

      // Step 6: Return and Delete Standard Set
      await page.getByRole('link', { name: 'Standard Sets' }).click()

      // Verify we're back on main page
      await expect(
        page.getByRole('heading', { name: 'Manage Standard Sets' })
      ).toBeVisible()

      // Delete the test standard set
      await page
        .getByRole('button', {
          name: `Delete ${TEST_STANDARD_SET_NAME} standard set`
        })
        .click()

      // Verify standard set is removed from table
      await expect(
        page.getByRole('cell', { name: TEST_STANDARD_SET_NAME })
      ).not.toBeVisible()
      await expect(
        page.getByRole('cell', { name: TEST_REPOSITORY_URL })
      ).not.toBeVisible()

      // Verify delete button is no longer present
      await expect(
        page.getByRole('button', {
          name: `Delete ${TEST_STANDARD_SET_NAME} standard set`
        })
      ).not.toBeVisible()
    })

    test('should navigate to standard set details and back', async ({
      page
    }) => {
      // Add a test standard set first
      await page
        .getByRole('textbox', { name: 'Name' })
        .fill(TEST_STANDARD_SET_NAME)
      await page
        .getByRole('textbox', { name: 'Repository URL' })
        .fill(TEST_REPOSITORY_URL)
      await page.getByRole('button', { name: 'Add standard set' }).click()

      // Navigate to details
      await page.getByRole('link', { name: TEST_STANDARD_SET_NAME }).click()

      // Verify URL change
      await expect(page).toHaveURL(/\/standards\/standard-sets\/[a-f0-9]+/)

      // Verify page title
      await expect(page).toHaveTitle(
        `${TEST_STANDARD_SET_NAME} - Intelligent Code Reviewer`
      )

      // Verify breadcrumb navigation functionality
      await page.getByRole('link', { name: 'Standard Sets' }).click()
      await expect(page).toHaveURL('/standards/standard-sets')

      // Clean up
      await page
        .getByRole('button', {
          name: `Delete ${TEST_STANDARD_SET_NAME} standard set`
        })
        .click()
    })

    test('should display accessibility-friendly elements', async ({ page }) => {
      // Add a test standard set
      await page
        .getByRole('textbox', { name: 'Name' })
        .fill(TEST_STANDARD_SET_NAME)
      await page
        .getByRole('textbox', { name: 'Repository URL' })
        .fill(TEST_REPOSITORY_URL)
      await page.getByRole('button', { name: 'Add standard set' }).click()

      // Verify accessible elements
      const deleteButton = page.getByRole('button', {
        name: `Delete ${TEST_STANDARD_SET_NAME} standard set`
      })

      // Verify button has proper accessible name
      await expect(deleteButton).toHaveAttribute(
        'aria-label',
        `Delete ${TEST_STANDARD_SET_NAME} standard set`
      )

      // Verify table has proper caption
      await expect(
        page.getByRole('table', { name: 'Standard sets list' })
      ).toBeVisible()

      // Clean up
      await deleteButton.click()
    })
  })
})
