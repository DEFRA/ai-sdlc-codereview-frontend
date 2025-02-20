import { getStandardsHome } from './controller.js'
import {
  getClassifications,
  createClassification,
  deleteClassification
} from './classifications/controller.js'
import {
  getStandardSets,
  createStandardSet,
  deleteStandardSet
} from './standard-sets/controller.js'

/**
 * Standards plugin
 * @satisfies {ServerRegisterPluginObject<void>}
 */
export const standards = {
  plugin: {
    name: 'standards',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/standards',
          handler: getStandardsHome,
          options: {
            auth: false,
            description: 'Standards management landing page',
            tags: ['api', 'standards']
          }
        },
        {
          method: 'GET',
          path: '/standards/classifications',
          handler: getClassifications,
          options: {
            auth: false,
            description: 'Classifications management page',
            tags: ['api', 'standards']
          }
        },
        {
          method: 'POST',
          path: '/standards/classifications',
          handler: createClassification,
          options: {
            auth: false,
            description: 'Create a new classification',
            tags: ['api', 'standards']
          }
        },
        {
          method: 'POST',
          path: '/standards/classifications/{id}/delete',
          handler: deleteClassification,
          options: {
            auth: false,
            description: 'Delete a classification',
            tags: ['api', 'standards']
          }
        },
        {
          method: 'GET',
          path: '/standards/standard-sets',
          handler: getStandardSets,
          options: {
            auth: false,
            description: 'Standard sets management page',
            tags: ['api', 'standards']
          }
        },
        {
          method: 'POST',
          path: '/standards/standard-sets',
          handler: createStandardSet,
          options: {
            auth: false,
            description: 'Create a new standard set',
            tags: ['api', 'standards']
          }
        },
        {
          method: 'POST',
          path: '/standards/standard-sets/{id}/delete',
          handler: deleteStandardSet,
          options: {
            auth: false,
            description: 'Delete a standard set',
            tags: ['api', 'standards']
          }
        }
      ])
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
