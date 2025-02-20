import {
  getCodeReviews,
  getCodeReviewById,
  getCodeReviewStatus
} from './controller.js'

/**
 * @satisfies {ServerRegisterPluginObject<void>}
 */
export const codeReviews = {
  plugin: {
    name: 'code-reviews',
    register: (server) => {
      server.route([
        {
          method: 'GET',
          path: '/code-reviews',
          handler: getCodeReviews,
          options: {
            auth: false,
            description: 'Code reviews list page',
            tags: ['api', 'code-reviews']
          }
        },
        {
          method: 'GET',
          path: '/code-reviews/{id}',
          handler: getCodeReviewById,
          options: {
            auth: false,
            description: 'Code review detail page',
            tags: ['api', 'code-reviews']
          }
        },
        {
          method: 'GET',
          path: '/api/code-reviews/{id}/status',
          handler: getCodeReviewStatus,
          options: {
            auth: false,
            description: 'Get code review status',
            tags: ['api', 'code-reviews']
          }
        }
      ])
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
