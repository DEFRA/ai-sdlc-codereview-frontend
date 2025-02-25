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
    const apiBaseUrl = config.get('apiBaseUrl')
    const apiEndpoint = `${apiBaseUrl}/api/v1/classifications`

    request.logger.info(`Fetching classifications from: ${apiEndpoint}`)

    const response = await fetch(apiEndpoint)

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
    const apiBaseUrl = config.get('apiBaseUrl')
    request.logger.error({
      msg: 'Error fetching classifications',
      error: err.message,
      stack: err.stack,
      apiBaseUrl,
      endpoint: '/api/v1/classifications',
      fullUrl: `${apiBaseUrl}/api/v1/classifications`
    })
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
    const apiBaseUrl = config.get('apiBaseUrl')
    const apiEndpoint = `${apiBaseUrl}/api/v1/classifications`

    request.logger.info(`Creating classification at: ${apiEndpoint}`)

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    return h.redirect('/standards/classifications')
  } catch (err) {
    const apiBaseUrl = config.get('apiBaseUrl')
    request.logger.error({
      msg: 'Error creating classification',
      error: err.message,
      stack: err.stack,
      apiBaseUrl,
      endpoint: '/api/v1/classifications',
      fullUrl: `${apiBaseUrl}/api/v1/classifications`,
      data
    })
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
    const apiBaseUrl = config.get('apiBaseUrl')
    const apiEndpoint = `${apiBaseUrl}/api/v1/classifications/${request.params.id}`

    request.logger.info(`Deleting classification at: ${apiEndpoint}`)

    const response = await fetch(apiEndpoint, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    return h.redirect('/standards/classifications')
  } catch (err) {
    const apiBaseUrl = config.get('apiBaseUrl')
    request.logger.error({
      msg: 'Error deleting classification',
      error: err.message,
      stack: err.stack,
      apiBaseUrl,
      endpoint: `/api/v1/classifications/${request.params.id}`,
      fullUrl: `${apiBaseUrl}/api/v1/classifications/${request.params.id}`,
      classificationId: request.params.id
    })
    return h.view('error/index', {
      statusCode: 500,
      title: 'Internal Server Error',
      message: 'Unable to delete classification. Please try again later.'
    })
  }
}
