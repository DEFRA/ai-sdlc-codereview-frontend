import { createServer } from '~/src/server/index.js'
import { statusCodes } from '~/src/server/common/constants/status-codes.js'

describe('Home Controller', () => {
  /** @type {Server} */
  let server
  let fetchSpy

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  describe('GET /', () => {
    test('Should render home page with form', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/'
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(expect.stringContaining('Generate Code Review'))
      expect(result).toEqual(expect.stringContaining('repository-url'))
      expect(result).toEqual(expect.stringContaining('Generate code review'))
    })

    test('Should handle non-ok response when fetching standard sets', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/'
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(expect.stringContaining('Generate Code Review'))
      expect(result).toEqual(expect.stringContaining('repository-url'))
      // Should still render the page with empty standard sets
      expect(result).not.toEqual(expect.stringContaining('standard-sets'))
    })
  })

  describe('POST /', () => {
    test('Should validate empty repository URL', async () => {
      const { result, statusCode } = await server.inject({
        method: 'POST',
        url: '/',
        payload: {
          repository_url: ''
        }
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(expect.stringContaining('Enter a repository URL'))
    })

    test('Should validate invalid repository URL', async () => {
      const { result, statusCode } = await server.inject({
        method: 'POST',
        url: '/',
        payload: {
          repository_url: 'not-a-url'
        }
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(expect.stringContaining('Enter a valid URL'))
    })

    test('Should handle API errors', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('API Error'))

      const { result, statusCode } = await server.inject({
        method: 'POST',
        url: '/',
        payload: {
          repository_url: 'https://github.com/test/repo'
        }
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(
        expect.stringContaining('Error creating code review')
      )
    })

    test('Should handle non-ok API response', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: statusCodes.badRequest
      })

      const { result, statusCode } = await server.inject({
        method: 'POST',
        url: '/',
        payload: {
          repository_url: 'https://github.com/test/repo'
        }
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(
        expect.stringContaining('Error creating code review')
      )
    })

    test('Should successfully create code review and redirect', async () => {
      const mockReview = {
        _id: '123456789012345678901234',
        repository_url: 'https://github.com/test/repo',
        status: 'started'
      }

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockReview)
      })

      const { statusCode, headers } = await server.inject({
        method: 'POST',
        url: '/',
        payload: {
          repository_url: 'https://github.com/test/repo'
        }
      })

      expect(statusCode).toBe(302) // HTTP 302 Found/Redirect
      expect(headers.location).toBe(`/code-reviews/${mockReview._id}`)
    })
  })
})

/**
 * @import { Server } from '@hapi/hapi'
 */
