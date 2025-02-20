import { getStandardsHome } from './controller.js'
import { buildNavigation } from '~/src/config/nunjucks/context/build-navigation.js'

jest.mock('~/src/config/nunjucks/context/build-navigation.js')

describe('Standards Controller', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = {
      logger: {
        error: jest.fn()
      }
    }

    mockH = {
      view: jest.fn().mockReturnThis()
    }

    buildNavigation.mockReturnValue([])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getStandardsHome', () => {
    it('should render the standards home page', () => {
      getStandardsHome(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith('standards/index', {
        pageTitle: 'Standards Management',
        navigation: []
      })
      expect(buildNavigation).toHaveBeenCalledWith(mockRequest)
    })
  })
})
