import { buildNavigation } from '~/src/config/nunjucks/context/build-navigation.js'

/**
 * Handler for the standards landing page
 * @param {import('@hapi/hapi').Request} _request - The request object
 * @param {import('@hapi/hapi').ResponseToolkit} h - The response toolkit
 * @returns {import('@hapi/hapi').ResponseObject} The response
 */
export function getStandardsHome(_request, h) {
  return h.view('standards/index', {
    pageTitle: 'Standards Management',
    navigation: buildNavigation(_request)
  })
}
