/**
 * @typedef {import('@playwright/test').Page} Page
 * @typedef {import('@playwright/test').Locator} Locator
 */

/**
 * Get a GDS button by its text
 * @param {Page} page - Playwright page object
 * @param {string} text - Button text
 * @returns {Promise<Locator>} Button locator
 */
export async function getGdsButton(page, text) {
  return page.locator('.govuk-button', { hasText: text })
}

/**
 * Fill a GDS form field
 * @param {Page} page - Playwright page object
 * @param {string} label - Field label text
 * @param {string} value - Value to enter
 */
export async function fillGdsField(page, label, value) {
  const field = page
    .locator('.govuk-label', { hasText: label })
    .locator('..')
    .locator('.govuk-input')
  await field.fill(value)
}

/**
 * Check for GDS error summary
 * @param {Page} page - Playwright page object
 * @returns {Promise<Locator>} Error summary locator
 */
export async function getGdsErrorSummary(page) {
  return page.locator('.govuk-error-summary')
}

/**
 * Get text from a GDS notification banner
 * @param {Page} page - Playwright page object
 * @returns {Promise<string>} Banner text
 */
export async function getGdsBannerText(page) {
  const banner = page.locator('.govuk-notification-banner')
  return banner.locator('.govuk-notification-banner__content').textContent()
}
