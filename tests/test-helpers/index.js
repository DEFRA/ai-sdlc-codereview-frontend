/**
 * @typedef {import('@playwright/test').Page} Page
 */

/**
 * Navigate to home page and verify basic structure
 * @param {Page} page - Playwright page object
 */
export async function navigateToHome(page) {
  await page.goto('/')
  await page.waitForSelector('[data-module="govuk-header"]')
}

/**
 * Get text content from a GDS component
 * @param {Page} page - Playwright page object
 * @param {string} selector - Component selector
 * @returns {Promise<string>} Text content
 */
export async function getGdsComponentText(page, selector) {
  return page.locator(selector).textContent()
}
