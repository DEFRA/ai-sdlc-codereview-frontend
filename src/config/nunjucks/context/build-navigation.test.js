import { buildNavigation } from '~/src/config/nunjucks/context/build-navigation.js'

/**
 * @param {Partial<Request>} [options]
 */
function mockRequest(options) {
  return { ...options }
}

describe('#buildNavigation', () => {
  test('Should provide expected navigation details', () => {
    expect(
      buildNavigation(mockRequest({ path: '/non-existent-path' }))
    ).toEqual([
      {
        isActive: false,
        text: 'Generate code review',
        url: '/'
      },
      {
        isActive: false,
        text: 'View code reviews',
        url: '/code-reviews'
      },
      {
        isActive: false,
        text: 'Standards',
        url: '/standards'
      }
    ])
  })

  test('Should highlight home page in navigation', () => {
    expect(buildNavigation(mockRequest({ path: '/' }))).toEqual([
      {
        isActive: true,
        text: 'Generate code review',
        url: '/'
      },
      {
        isActive: false,
        text: 'View code reviews',
        url: '/code-reviews'
      },
      {
        isActive: false,
        text: 'Standards',
        url: '/standards'
      }
    ])
  })

  test('Should highlight code reviews list page in navigation', () => {
    expect(buildNavigation(mockRequest({ path: '/code-reviews' }))).toEqual([
      {
        isActive: false,
        text: 'Generate code review',
        url: '/'
      },
      {
        isActive: true,
        text: 'View code reviews',
        url: '/code-reviews'
      },
      {
        isActive: false,
        text: 'Standards',
        url: '/standards'
      }
    ])
  })

  test('Should highlight code review detail page in navigation', () => {
    expect(
      buildNavigation(mockRequest({ path: '/code-reviews/123456789' }))
    ).toEqual([
      {
        isActive: false,
        text: 'Generate code review',
        url: '/'
      },
      {
        isActive: true,
        text: 'View code reviews',
        url: '/code-reviews'
      },
      {
        isActive: false,
        text: 'Standards',
        url: '/standards'
      }
    ])
  })

  test('Should highlight standards page in navigation', () => {
    expect(buildNavigation(mockRequest({ path: '/standards' }))).toEqual([
      {
        isActive: false,
        text: 'Generate code review',
        url: '/'
      },
      {
        isActive: false,
        text: 'View code reviews',
        url: '/code-reviews'
      },
      {
        isActive: true,
        text: 'Standards',
        url: '/standards'
      }
    ])
  })
})

/**
 * @import { Request } from '@hapi/hapi'
 */
