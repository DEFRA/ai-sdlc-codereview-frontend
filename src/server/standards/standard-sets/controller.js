import { config } from '~/src/config/config.js'
import { buildNavigation } from '~/src/config/nunjucks/context/build-navigation.js'

/**
 * Get all standard sets
 * @param {import('@hapi/hapi').Request} request
 * @param {import('@hapi/hapi').ResponseToolkit} h
 */
export async function getStandardSets(request, h) {
  try {
    const response = await fetch(
      `${config.get('apiBaseUrl')}/api/v1/standard-sets`
    )

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const standardSets = await response.json()

    return h.view('standards/standard-sets/index', {
      pageTitle: 'Manage Standard Sets',
      standardSets,
      navigation: buildNavigation(request)
    })
  } catch (err) {
    request.logger.error('Error fetching standard sets:', err)
    return h.view('error/index', {
      statusCode: 500,
      title: 'Internal Server Error',
      message: 'Unable to fetch standard sets. Please try again later.'
    })
  }
}

/**
 * Create a new standard set
 * @param {import('@hapi/hapi').Request} request
 * @param {import('@hapi/hapi').ResponseToolkit} h
 */
export async function createStandardSet(request, h) {
  const data = {
    name: request.payload.name,
    repository_url: request.payload.repository_url,
    custom_prompt: request.payload.custom_prompt || ''
  }

  // Validate input
  const errors = {}
  if (!data.name) {
    errors.name = {
      field: 'name',
      message: 'Enter a standard set name'
    }
  }
  if (!data.repository_url) {
    errors.repository_url = {
      field: 'repository_url',
      message: 'Enter a repository URL'
    }
  }

  if (Object.keys(errors).length > 0) {
    return h
      .view('standards/standard-sets/index', {
        pageTitle: 'Manage Standard Sets',
        navigation: buildNavigation(request),
        errors,
        values: data,
        standardSets: []
      })
      .code(400)
  }

  try {
    const response = await fetch(
      `${config.get('apiBaseUrl')}/api/v1/standard-sets`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(data)
      }
    )

    const responseText = await response.text()
    let errorData = {}

    try {
      errorData = JSON.parse(responseText)
    } catch (e) {
      request.logger.error('Failed to parse API response', {
        error: e.message,
        responseText
      })
    }

    if (!response.ok) {
      request.logger.error('Failed to create standard set', {
        status: response.status,
        error: errorData.message || 'Unknown error'
      })

      // Handle API validation errors
      if (response.status === 400 && errorData.errors) {
        return h
          .view('standards/standard-sets/index', {
            pageTitle: 'Manage Standard Sets',
            navigation: buildNavigation(request),
            errors: errorData.errors,
            values: data,
            standardSets: []
          })
          .code(400)
      }

      // Handle other API errors
      return h
        .view('standards/standard-sets/index', {
          pageTitle: 'Manage Standard Sets',
          navigation: buildNavigation(request),
          errors: {
            api: {
              message:
                errorData.message ||
                'Unable to create standard set. Please try again later.'
            }
          },
          values: data,
          standardSets: []
        })
        .code(400)
    }

    return h.redirect('/standards/standard-sets')
  } catch (err) {
    request.logger.error('Error creating standard set', {
      error: err.message
    })
    return h
      .view('standards/standard-sets/index', {
        pageTitle: 'Manage Standard Sets',
        navigation: buildNavigation(request),
        errors: {
          api: {
            message: 'Unable to create standard set. Please try again later.'
          }
        },
        values: data,
        standardSets: []
      })
      .code(500)
  }
}

/**
 * Delete a standard set
 * @param {import('@hapi/hapi').Request} request
 * @param {import('@hapi/hapi').ResponseToolkit} h
 */
export async function deleteStandardSet(request, h) {
  const { id } = request.params
  try {
    const response = await fetch(
      `${config.get('apiBaseUrl')}/api/v1/standard-sets/${id}`,
      {
        method: 'DELETE'
      }
    )

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    return h.redirect('/standards/standard-sets')
  } catch (err) {
    request.logger.error('Error deleting standard set:', err)
    return h.view('error/index', {
      statusCode: 500,
      title: 'Internal Server Error',
      message: 'Unable to delete standard set. Please try again later.'
    })
  }
}

/**
 * Show the create standard set form
 * @param {import('@hapi/hapi').Request} request
 * @param {import('@hapi/hapi').ResponseToolkit} h
 */
export function showCreateStandardSet(request, h) {
  return h.view('standards/standard-sets/create', {
    pageTitle: 'Add Standard Set',
    navigation: buildNavigation(request)
  })
}
