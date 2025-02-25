import {
  getClassifications,
  createClassification,
  deleteClassification
} from './controller.js'
import { config } from '~/src/config/config.js'
import { buildNavigation } from '~/src/config/nunjucks/context/build-navigation.js'

jest.mock('~/src/config/nunjucks/context/build-navigation.js')

describe('Classifications Controller', () => {
  let mockRequest
  let mockH
  let fetchSpy

  beforeEach(() => {
    mockRequest = {
      logger: {
        info: jest.fn(),
        error: jest.fn()
      },
      params: {
        id: '123456789012345678901234'
      },
      payload: {}
    }

    mockH = {
      view: jest.fn().mockReturnThis(),
      redirect: jest.fn(),
      code: jest.fn().mockReturnThis()
    }

    fetchSpy = jest.spyOn(global, 'fetch')
    buildNavigation.mockReturnValue([])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getClassifications', () => {
    const mockClassifications = [
      { _id: '1', name: 'Security' },
      { _id: '2', name: 'Performance' }
    ]

    it('should fetch and display classifications', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockClassifications)
      })

      await getClassifications(mockRequest, mockH)

      const apiBaseUrl = config.get('apiBaseUrl')
      const apiEndpoint = `${apiBaseUrl}/api/v1/classifications`

      expect(mockRequest.logger.info).toHaveBeenCalledWith(
        `Fetching classifications from: ${apiEndpoint}`
      )
      expect(fetchSpy).toHaveBeenCalledWith(apiEndpoint)
      expect(mockH.view).toHaveBeenCalledWith(
        'standards/classifications/index',
        {
          pageTitle: 'Manage Classifications',
          classifications: mockClassifications,
          navigation: []
        }
      )
    })

    it('should handle API errors', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('API Error'))

      await getClassifications(mockRequest, mockH)

      expect(mockRequest.logger.error).toHaveBeenCalled()
      expect(mockH.view).toHaveBeenCalledWith('error/index', {
        statusCode: 500,
        title: 'Internal Server Error',
        message: 'Unable to fetch classifications. Please try again later.'
      })
    })

    it('should handle non-ok response', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      await getClassifications(mockRequest, mockH)

      expect(mockRequest.logger.error).toHaveBeenCalled()
      expect(mockH.view).toHaveBeenCalledWith('error/index', {
        statusCode: 500,
        title: 'Internal Server Error',
        message: 'Unable to fetch classifications. Please try again later.'
      })
    })
  })

  describe('createClassification', () => {
    it('should create a new classification', async () => {
      mockRequest.payload = { name: 'Test Classification' }
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ _id: '3', name: 'Test Classification' })
      })

      await createClassification(mockRequest, mockH)

      const apiBaseUrl = config.get('apiBaseUrl')
      const apiEndpoint = `${apiBaseUrl}/api/v1/classifications`

      expect(mockRequest.logger.info).toHaveBeenCalledWith(
        `Creating classification at: ${apiEndpoint}`
      )
      expect(fetchSpy).toHaveBeenCalledWith(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: 'Test Classification' })
      })
      expect(mockH.redirect).toHaveBeenCalledWith('/standards/classifications')
    })

    it('should validate classification name', async () => {
      mockRequest.payload = { name: '' }

      await createClassification(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        'standards/classifications/index',
        {
          pageTitle: 'Manage Classifications',
          navigation: [],
          errors: {
            name: {
              field: 'name',
              message: 'Enter a classification name'
            }
          },
          data: { name: '' }
        }
      )
      expect(mockH.code).toHaveBeenCalledWith(400)
    })

    it('should validate classification name format', async () => {
      mockRequest.payload = { name: 'Invalid@Name$' }

      await createClassification(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        'standards/classifications/index',
        {
          pageTitle: 'Manage Classifications',
          navigation: [],
          errors: {
            name: {
              field: 'name',
              message:
                'Classification name can only contain letters, numbers, spaces, dots, hyphens and hash symbols'
            }
          },
          data: { name: 'Invalid@Name$' }
        }
      )
      expect(mockH.code).toHaveBeenCalledWith(400)
    })

    it('should handle non-ok response from API', async () => {
      mockRequest.payload = { name: 'Test Classification' }
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      await createClassification(mockRequest, mockH)

      expect(mockRequest.logger.error).toHaveBeenCalled()
      expect(mockH.view).toHaveBeenCalledWith('error/index', {
        statusCode: 500,
        title: 'Internal Server Error',
        message: 'Unable to create classification. Please try again later.'
      })
    })
  })

  describe('deleteClassification', () => {
    it('should delete a classification', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true
      })

      await deleteClassification(mockRequest, mockH)

      const apiBaseUrl = config.get('apiBaseUrl')
      const apiEndpoint = `${apiBaseUrl}/api/v1/classifications/${mockRequest.params.id}`

      expect(mockRequest.logger.info).toHaveBeenCalledWith(
        `Deleting classification at: ${apiEndpoint}`
      )
      expect(fetchSpy).toHaveBeenCalledWith(apiEndpoint, {
        method: 'DELETE'
      })
      expect(mockH.redirect).toHaveBeenCalledWith('/standards/classifications')
    })

    it('should handle delete errors', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('API Error'))

      await deleteClassification(mockRequest, mockH)

      expect(mockRequest.logger.error).toHaveBeenCalled()
      expect(mockH.view).toHaveBeenCalledWith('error/index', {
        statusCode: 500,
        title: 'Internal Server Error',
        message: 'Unable to delete classification. Please try again later.'
      })
    })

    it('should handle non-ok response from API', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      await deleteClassification(mockRequest, mockH)

      expect(mockRequest.logger.error).toHaveBeenCalled()
      expect(mockH.view).toHaveBeenCalledWith('error/index', {
        statusCode: 500,
        title: 'Internal Server Error',
        message: 'Unable to delete classification. Please try again later.'
      })
    })
  })
})
