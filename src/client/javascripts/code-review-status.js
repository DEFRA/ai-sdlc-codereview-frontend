/**
 * @typedef {object} CodeReviewStatus
 * @property {string} id - The code review ID
 * @property {string} status - The current status
 */

/**
 * Updates the status tag element with new status
 * @param {HTMLElement} statusElement - The status tag element to update
 * @param {string} newStatus - The new status value
 */
function updateStatusElement(statusElement, newStatus) {
  const formattedStatus = newStatus.replace('_', ' ')
  const titleStatus =
    formattedStatus.charAt(0).toUpperCase() + formattedStatus.slice(1)

  statusElement.textContent = titleStatus
  statusElement.setAttribute('aria-label', `Review status: ${titleStatus}`)

  // Update tag color
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
 * @param {string} reviewId - The ID of the review to check
 * @returns {Promise<CodeReviewStatus>}
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

/**
 * Checks if a status needs polling
 * @param {string} status - The status to check
 * @returns {boolean} - Whether the status needs polling
 */
function needsPolling(status) {
  const pollStatuses = ['pending', 'in progress', 'started']
  return pollStatuses.includes(status.toLowerCase().trim())
}

/**
 * Polls for status updates of pending/in-progress reviews
 */
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
          // Keep polling if new status still needs polling
          hasInProgressReviews = hasInProgressReviews || needsPolling(status)
        } catch (error) {
          hasInProgressReviews = true // Keep polling on error
        }
      }
    }

    // Stop polling if no reviews are pending/in progress
    if (!hasInProgressReviews && pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  // Start polling every 10 seconds
  pollingInterval = setInterval(() => {
    checkStatuses().catch(() => {
      // Error handling is done silently
    })
  }, 10000)

  // Run initial check
  checkStatuses().catch(() => {
    // Error handling is done silently
  })
}

// Export internal functions only for testing
export const __testing__ = {
  updateStatusElement,
  fetchReviewStatus,
  needsPolling
}
