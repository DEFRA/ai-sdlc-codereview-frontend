/**
 * @param {Partial<Request> | null} request
 */
export function buildNavigation(request) {
  return [
    {
      text: 'Generate code review',
      url: '/',
      isActive: request?.path === '/'
    },
    {
      text: 'View code reviews',
      url: '/code-reviews',
      isActive: request?.path?.startsWith('/code-reviews')
    },
    {
      text: 'Standards',
      url: '/standards',
      isActive: request?.path?.startsWith('/standards')
    }
  ]
}

/**
 * @import { Request } from '@hapi/hapi'
 */
