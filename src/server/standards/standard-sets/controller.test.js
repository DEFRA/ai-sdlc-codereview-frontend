import { jest } from '@jest/globals'
import { config } from '~/src/config/config.js'
import {
  getStandardSets,
  showCreateStandardSet,
  createStandardSet,
  deleteStandardSet
} from './controller.js'

describe('Standard Sets Controller', () => {
  const request = {
    logger: {
      error: jest.fn(),
      info: jest.fn()
    }
  }

  const h = {
    view: jest.fn().mockReturnValue({ code: jest.fn() }),
    redirect: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
    config.get = jest.fn().mockReturnValue('http://test-api')
  })

  describe('getStandardSets', () => {
    it('should render standard sets page with data', async () => {
      const standardSets = [
        { _id: '1', name: 'Test Set', repository_url: 'http://test.com' }
      ]
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(standardSets)
      })

      await getStandardSets(request, h)

      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api/api/v1/standard-sets'
      )
      expect(h.view).toHaveBeenCalledWith('standards/standard-sets/index', {
        pageTitle: 'Manage Standard Sets',
        standardSets,
        navigation: expect.any(Object)
      })
    })

    it('should handle API errors', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500
      })

      await getStandardSets(request, h)

      expect(h.view).toHaveBeenCalledWith('error/index', {
        statusCode: 500,
        title: 'Internal Server Error',
        message: 'Unable to fetch standard sets. Please try again later.'
      })
    })
  })

  describe('showCreateStandardSet', () => {
    it('should render create standard set form', () => {
      showCreateStandardSet(request, h)

      expect(h.view).toHaveBeenCalledWith('standards/standard-sets/create', {
        pageTitle: 'Add Standard Set',
        navigation: expect.any(Object)
      })
    })
  })

  describe('createStandardSet', () => {
    const validPayload = {
      name: 'Test Set',
      repository_url: 'http://test.com',
      custom_prompt: 'test prompt'
    }

    it('should create standard set and redirect on success', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('{"success": true}')
      })

      await createStandardSet({ ...request, payload: validPayload }, h)

      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api/api/v1/standard-sets',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            name: validPayload.name,
            repository_url: validPayload.repository_url,
            custom_prompt: validPayload.custom_prompt
          })
        }
      )
      expect(h.redirect).toHaveBeenCalledWith('/standards/standard-sets')
    })

    it('should validate required fields', async () => {
      const invalidPayload = {}
      const mockViewResponse = { code: jest.fn() }
      h.view.mockReturnValue(mockViewResponse)

      await createStandardSet({ ...request, payload: invalidPayload }, h)

      expect(h.view).toHaveBeenCalledWith('standards/standard-sets/index', {
        pageTitle: 'Manage Standard Sets',
        navigation: expect.any(Object),
        errors: {
          name: {
            field: 'name',
            message: 'Enter a standard set name'
          },
          repository_url: {
            field: 'repository_url',
            message: 'Enter a repository URL'
          }
        },
        values: {
          name: undefined,
          repository_url: undefined,
          custom_prompt: ''
        },
        standardSets: []
      })
      expect(mockViewResponse.code).toHaveBeenCalledWith(400)
    })

    it('should handle API errors', async () => {
      const errorMessage = 'Server error'
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve(JSON.stringify({ message: errorMessage }))
      })

      const mockViewResponse = { code: jest.fn() }
      h.view.mockReturnValue(mockViewResponse)

      await createStandardSet({ ...request, payload: validPayload }, h)

      expect(h.view).toHaveBeenCalledWith('standards/standard-sets/index', {
        pageTitle: 'Manage Standard Sets',
        navigation: expect.any(Object),
        errors: {
          api: {
            message: errorMessage
          }
        },
        values: {
          name: validPayload.name,
          repository_url: validPayload.repository_url,
          custom_prompt: validPayload.custom_prompt
        },
        standardSets: []
      })
      expect(mockViewResponse.code).toHaveBeenCalledWith(400)
    })
  })

  describe('deleteStandardSet', () => {
    it('should delete standard set and redirect', async () => {
      global.fetch.mockResolvedValue({ ok: true })

      await deleteStandardSet({ ...request, params: { id: '123' } }, h)

      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api/api/v1/standard-sets/123',
        {
          method: 'DELETE'
        }
      )
      expect(h.redirect).toHaveBeenCalledWith('/standards/standard-sets')
    })

    it('should handle API errors', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500
      })

      await deleteStandardSet({ ...request, params: { id: '123' } }, h)

      expect(h.view).toHaveBeenCalledWith('error/index', {
        statusCode: 500,
        title: 'Internal Server Error',
        message: 'Unable to delete standard set. Please try again later.'
      })
    })
  })
})
