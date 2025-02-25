import { config } from '~/src/config/config.js'

/**
 * Validates a URL string
 * @param {string} url - The URL to validate
 * @returns {boolean} Whether the URL is valid
 */
function isValidUrl(url) {
  try {
    return Boolean(new URL(url))
  } catch {
    return false
  }
}

/**
 * Handler for GET requests to home page
 */
export async function getHome(_request, h) {
  let standardSets = []
  try {
    const apiBaseUrl = config.get('apiBaseUrl')
    const apiEndpoint = `${apiBaseUrl}/api/v1/standard-sets`

    _request.logger.info(`Fetching standard sets from: ${apiEndpoint}`)

    const response = await fetch(apiEndpoint)

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    standardSets = await response.json()
  } catch (err) {
    const apiBaseUrl = config.get('apiBaseUrl')
    _request.logger.error({
      msg: 'Error fetching standard sets for home page',
      error: err.message,
      stack: err.stack,
      apiBaseUrl,
      endpoint: '/api/v1/standard-sets',
      fullUrl: `${apiBaseUrl}/api/v1/standard-sets`
    })
  }

  return h.view('home/index', {
    pageTitle: 'Home',
    heading: 'Generate Code Review',
    values: {
      repositoryUrl: '',
      standardSets: []
    },
    errors: null,
    standardSets
  })
}

/**
 * Handler for POST requests to create a code review
 */
export async function postHome(request, h) {
  const { repository_url: repositoryUrl, standard_sets: rawStandardSets } =
    request.payload
  // Ensure standard_sets is always an array
  const standardSets = Array.isArray(rawStandardSets)
    ? rawStandardSets
    : rawStandardSets
      ? [rawStandardSets]
      : []

  // Validate input
  if (!repositoryUrl) {
    return h.view('home/index', {
      pageTitle: 'Home',
      heading: 'Generate Code Review',
      values: { repositoryUrl, standardSets },
      errors: {
        repositoryUrl: {
          text: 'Enter a repository URL'
        },
        items: [
          {
            text: 'Enter a repository URL',
            href: '#repository-url'
          }
        ]
      }
    })
  }

  if (!isValidUrl(repositoryUrl)) {
    return h.view('home/index', {
      pageTitle: 'Home',
      heading: 'Generate Code Review',
      values: { repositoryUrl, standardSets },
      errors: {
        repositoryUrl: {
          text: 'Enter a valid URL'
        },
        items: [
          {
            text: 'Enter a valid URL',
            href: '#repository-url'
          }
        ]
      }
    })
  }

  try {
    const apiBaseUrl = config.get('apiBaseUrl')
    const apiEndpoint = `${apiBaseUrl}/api/v1/code-reviews`

    request.logger.info(`Creating code review at: ${apiEndpoint}`, {
      repositoryUrl,
      standardSetsCount: standardSets.length
    })

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        repository_url: repositoryUrl,
        standard_sets: standardSets
      })
    })

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    const review = await response.json()
    return h.redirect(`/code-reviews/${review._id}`)
  } catch (err) {
    const apiBaseUrl = config.get('apiBaseUrl')
    request.logger.error({
      msg: 'Error creating code review',
      error: err.message,
      stack: err.stack,
      apiBaseUrl,
      endpoint: '/api/v1/code-reviews',
      fullUrl: `${apiBaseUrl}/api/v1/code-reviews`,
      repositoryUrl,
      standardSetsCount: standardSets.length
    })
    return h.view('home/index', {
      pageTitle: 'Home',
      heading: 'Generate Code Review',
      values: { repositoryUrl, standardSets },
      errors: {
        repositoryUrl: {
          text: 'Error creating code review. Please try again.'
        },
        items: [
          {
            text: 'Error creating code review. Please try again.',
            href: '#repository-url'
          }
        ]
      }
    })
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
