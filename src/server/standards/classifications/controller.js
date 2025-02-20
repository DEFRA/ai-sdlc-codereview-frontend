import { config } from '~/src/config/config.js'
import { buildNavigation } from '~/src/config/nunjucks/context/build-navigation.js'

/**
 * @typedef {object} Classification
 * @property {string} _id - The classification ID
 * @property {string} name - The classification name
 */

/**
 * Handler for the classifications management page
 * @param {import('@hapi/hapi').Request} request - The request object
 * @param {import('@hapi/hapi').ResponseToolkit} h - The response toolkit
 * @returns {Promise<import('@hapi/hapi').ResponseObject>} The response
 */
export async function getClassifications(request, h) {
  try {
    const response = await fetch(
      `${config.get('apiBaseUrl')}/api/v1/classifications`
    )

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const classifications = await response.json()

    return h.view('standards/classifications/index', {
      pageTitle: 'Manage Classifications',
      classifications,
      navigation: buildNavigation(request)
    })
  } catch (err) {
    request.logger.error('Error fetching classifications:', err)
    return h.view('error/index', {
      statusCode: 500,
      title: 'Internal Server Error',
      message: 'Unable to fetch classifications. Please try again later.'
    })
  }
}

/**
 * Handler for creating a new classification
 * @param {import('@hapi/hapi').Request} request - The request object
 * @param {import('@hapi/hapi').ResponseToolkit} h - The response toolkit
 * @returns {Promise<import('@hapi/hapi').ResponseObject>} The response
 */
export async function createClassification(request, h) {
  const data = { name: request.payload.name }

  // Validate input
  const errors = {}
  if (!data.name) {
    errors.name = {
      field: 'name',
      message: 'Enter a classification name'
    }
  } else if (!/^[A-Za-z0-9\s#.-]+$/.test(data.name)) {
    errors.name = {
      field: 'name',
      message:
        'Classification name can only contain letters, numbers, spaces, dots, hyphens and hash symbols'
    }
  }

  if (Object.keys(errors).length > 0) {
    return h
      .view('standards/classifications/index', {
        pageTitle: 'Manage Classifications',
        navigation: buildNavigation(request),
        errors,
        data
      })
      .code(400)
  }

  try {
    const response = await fetch(
      `${config.get('apiBaseUrl')}/api/v1/classifications`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    )

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    return h.redirect('/standards/classifications')
  } catch (err) {
    request.logger.error('Error creating classification:', err)
    return h.view('error/index', {
      statusCode: 500,
      title: 'Internal Server Error',
      message: 'Unable to create classification. Please try again later.'
    })
  }
}

/**
 * Handler for deleting a classification
 * @param {import('@hapi/hapi').Request} request - The request object
 * @param {import('@hapi/hapi').ResponseToolkit} h - The response toolkit
 * @returns {Promise<import('@hapi/hapi').ResponseObject>} The response
 */
export async function deleteClassification(request, h) {
  try {
    const response = await fetch(
      `${config.get('apiBaseUrl')}/api/v1/classifications/${request.params.id}`,
      {
        method: 'DELETE'
      }
    )

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    return h.redirect('/standards/classifications')
  } catch (err) {
    request.logger.error('Error deleting classification:', err)
    return h.view('error/index', {
      statusCode: 500,
      title: 'Internal Server Error',
      message: 'Unable to delete classification. Please try again later.'
    })
  }
}
