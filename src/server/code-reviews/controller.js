import { config } from '~/src/config/config.js'
import { markdown } from '~/src/config/nunjucks/filters/markdown.js'

/**
 * @typedef {object} CodeReview
 * @property {string} _id - The review ID
 * @property {string} repository_url - The repository URL
 * @property {string} status - The review status
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * Formats a date string into GOV.UK standard format (e.g. "14 January 2024 at 2:00pm")
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
  const date = new Date(dateString)
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  let hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'pm' : 'am'
  hours = hours % 12
  hours = hours || 12 // Convert 0 to 12

  return `${day} ${month} ${year} at ${hours}:${minutes}${ampm}`
}

/**
 * Handler for the code reviews list page
 */
export async function getCodeReviews(request, h) {
  try {
    const response = await fetch(
      `${config.get('apiBaseUrl')}/api/v1/code-reviews`
    )
    const codeReviews = await response.json()

    // Format the data exactly as needed by govukTable
    const tableRows = codeReviews.map((review) => [
      {
        html: `<a href="/code-reviews/${review._id}" class="govuk-link" aria-label="View details for code review of ${review.repository_url}">${review.repository_url}</a>`,
        attributes: {
          'data-label': 'Code Repository'
        }
      },
      {
        html: `<time datetime="${review.created_at}">${formatDate(review.created_at)}</time>`,
        attributes: {
          'data-label': 'Created'
        }
      },
      {
        html: `<time datetime="${review.updated_at}">${formatDate(review.updated_at)}</time>`,
        attributes: {
          'data-label': 'Updated'
        }
      },
      {
        html: `<strong class="govuk-tag ${review.status === 'failed' ? 'govuk-tag--red' : review.status === 'completed' ? 'govuk-tag--green' : ''}" role="status" data-review-id="${review._id}" aria-label="Review status: ${review.status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}">${review.status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</strong>`,
        attributes: {
          'data-label': 'Status'
        }
      }
    ])

    return h.view('code-reviews/index', {
      pageTitle: 'Code Reviews',
      tableRows
    })
  } catch (err) {
    request.logger.error('Error fetching code reviews:', err)
    return h.view('error/index', {
      statusCode: 500,
      title: 'Error',
      message: 'Unable to fetch code reviews'
    })
  }
}

/**
 * Handler for the code review detail page
 */
export async function getCodeReviewById(request, h) {
  try {
    const { id } = request.params
    const response = await fetch(
      `${config.get('apiBaseUrl')}/api/v1/code-reviews/${id}`
    )

    if (response.status === 404) {
      return h.view('error/index', {
        pageTitle: 'Code review not found',
        heading: 'Code review not found',
        message:
          'The code review you are looking for does not exist. This may be because:',
        messageList: [
          'the URL is incorrect',
          'the code review has been deleted',
          'you do not have permission to view this code review'
        ]
      })
    }

    if (response.status === 401) {
      return h.view('error/index', {
        pageTitle: 'Unauthorized',
        heading: 'You are not authorized to view this code review',
        message:
          'Please check that you have the correct permissions and try again.'
      })
    }

    if (response.status === 403) {
      return h.view('error/index', {
        pageTitle: 'Forbidden',
        heading: 'You do not have permission to view this code review',
        message:
          'Please contact your administrator if you believe this is incorrect.'
      })
    }

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    const review = await response.json()

    // Format dates
    review.created_at = formatDate(review.created_at)
    review.updated_at = formatDate(review.updated_at)

    // Format compliance reports with markdown
    if (review.compliance_reports && review.compliance_reports.length > 0) {
      review.compliance_reports = review.compliance_reports.map((report) => ({
        ...report,
        report: markdown(report.report)
      }))
    }

    return h.view('code-reviews/detail', {
      pageTitle: 'Code Review Details',
      review
    })
  } catch (err) {
    request.logger.error('Error fetching code review:', err)
    return h.view('error/index', {
      pageTitle: 'Sorry, there is a problem with the service',
      heading: 'Sorry, there is a problem with the service',
      message:
        'Try again later. If the problem persists, please contact support.',
      statusCode: 500
    })
  }
}

/**
 * Handler for fetching a code review's status
 */
export async function getCodeReviewStatus(request, h) {
  try {
    const { id } = request.params
    const response = await fetch(
      `${config.get('apiBaseUrl')}/api/v1/code-reviews/${id}`
    )

    if (!response.ok) {
      return h
        .response({ error: 'Failed to fetch review status' })
        .code(response.status)
    }

    const review = await response.json()
    return h.response({
      id: review._id,
      status: review.status
    })
  } catch (err) {
    request.logger.error('Error fetching code review status:', err)
    return h.response({ error: 'Internal server error' }).code(500)
  }
}
