import { getHome, postHome } from '~/src/server/home/controller.js'

/**
 * Sets up the routes used in the home page.
 * These routes are registered in src/server/router.js.
 */

/**
 * @satisfies {ServerRegisterPluginObject<void>}
 */
export const home = {
  plugin: {
    name: 'home',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/',
          handler: getHome,
          options: {
            auth: false,
            description: 'Home page',
            tags: ['api', 'home']
          }
        },
        {
          method: 'POST',
          path: '/',
          handler: postHome,
          options: {
            auth: false,
            description: 'Create code review',
            tags: ['api', 'home']
          }
        }
      ])
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
