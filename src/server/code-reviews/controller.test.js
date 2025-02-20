import {
  getCodeReviews,
  getCodeReviewById,
  getCodeReviewStatus
} from './controller.js'
import { config } from '~/src/config/config.js'

describe('Code Reviews Controller', () => {
  let mockRequest
  let mockH
  let fetchSpy
  const mockReview = {
    _id: '123456789012345678901234',
    repository_url: 'https://github.com/test/repo1',
    status: 'completed',
    created_at: '2024-01-14T12:00:00Z',
    updated_at: '2024-01-14T13:00:00Z'
  }

  beforeEach(() => {
    mockRequest = {
      logger: {
        error: jest.fn()
      },
      params: {
        id: '123456789012345678901234'
      }
    }

    mockH = {
      view: jest.fn().mockReturnThis()
    }

    fetchSpy = jest.spyOn(global, 'fetch')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getCodeReviews', () => {
    const mockReviews = [mockReview]

    it('should fetch and format code reviews', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockReviews)
      })

      await getCodeReviews(mockRequest, mockH)

      expect(fetchSpy).toHaveBeenCalledWith(
        `${config.get('apiBaseUrl')}/api/v1/code-reviews`
      )
      expect(mockH.view).toHaveBeenCalledWith('code-reviews/index', {
        pageTitle: 'Code Reviews',
        tableRows: [
          [
            {
              html: `<a href="/code-reviews/${mockReview._id}" class="govuk-link" aria-label="View details for code review of ${mockReview.repository_url}">${mockReview.repository_url}</a>`,
              attributes: {
                'data-label': 'Code Repository'
              }
            },
            {
              html: `<time datetime="${mockReview.created_at}">14 January 2024 at 12:00pm</time>`,
              attributes: {
                'data-label': 'Created'
              }
            },
            {
              html: `<time datetime="${mockReview.updated_at}">14 January 2024 at 1:00pm</time>`,
              attributes: {
                'data-label': 'Updated'
              }
            },
            {
              html: `<strong class="govuk-tag govuk-tag--green" role="status" data-review-id="${mockReview._id}" aria-label="Review status: Completed">Completed</strong>`,
              attributes: {
                'data-label': 'Status'
              }
            }
          ]
        ]
      })
    })

    it('should handle API errors', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('API Error'))

      await getCodeReviews(mockRequest, mockH)

      expect(mockRequest.logger.error).toHaveBeenCalled()
      expect(mockH.view).toHaveBeenCalledWith('error/index', {
        statusCode: 500,
        title: 'Error',
        message: 'Unable to fetch code reviews'
      })
    })

    it('should handle non-ok response', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      await getCodeReviews(mockRequest, mockH)

      expect(mockRequest.logger.error).toHaveBeenCalled()
      expect(mockH.view).toHaveBeenCalledWith('error/index', {
        statusCode: 500,
        title: 'Error',
        message: 'Unable to fetch code reviews'
      })
    })
  })

  describe('getCodeReviewById', () => {
    it('should fetch and format a single code review', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockReview)
      })

      await getCodeReviewById(mockRequest, mockH)

      expect(fetchSpy).toHaveBeenCalledWith(
        `${config.get('apiBaseUrl')}/api/v1/code-reviews/${mockRequest.params.id}`
      )
      expect(mockH.view).toHaveBeenCalledWith('code-reviews/detail', {
        pageTitle: 'Code Review Details',
        review: expect.objectContaining({
          _id: mockReview._id,
          repository_url: mockReview.repository_url,
          status: mockReview.status,
          created_at: '14 January 2024 at 12:00pm',
          updated_at: '14 January 2024 at 1:00pm'
        })
      })
    })

    it('should handle 404 errors', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      await getCodeReviewById(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith('error/index', {
        pageTitle: 'Code review not found',
        heading: 'Code review not found',
        message:
          'The code review you are looking for does not exist. This may be because:',
        messageList: [
          'the URL is incorrect',
          'the code review has been deleted',
          'you do not have permission to view this code review'
        ]
      })
    })

    it('should handle 401 errors', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 401
      })

      await getCodeReviewById(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith('error/index', {
        pageTitle: 'Unauthorized',
        heading: 'You are not authorized to view this code review',
        message:
          'Please check that you have the correct permissions and try again.'
      })
    })

    it('should handle 403 errors', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 403
      })

      await getCodeReviewById(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith('error/index', {
        pageTitle: 'Forbidden',
        heading: 'You do not have permission to view this code review',
        message:
          'Please contact your administrator if you believe this is incorrect.'
      })
    })

    it('should handle other non-ok responses', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      await getCodeReviewById(mockRequest, mockH)

      expect(mockRequest.logger.error).toHaveBeenCalled()
      expect(mockH.view).toHaveBeenCalledWith('error/index', {
        pageTitle: 'Sorry, there is a problem with the service',
        heading: 'Sorry, there is a problem with the service',
        message:
          'Try again later. If the problem persists, please contact support.',
        statusCode: 500
      })
    })

    it('should handle API errors', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('API Error'))

      await getCodeReviewById(mockRequest, mockH)

      expect(mockRequest.logger.error).toHaveBeenCalled()
      expect(mockH.view).toHaveBeenCalledWith('error/index', {
        pageTitle: 'Sorry, there is a problem with the service',
        heading: 'Sorry, there is a problem with the service',
        message:
          'Try again later. If the problem persists, please contact support.',
        statusCode: 500
      })
    })

    it('should format markdown in compliance reports', async () => {
      const reviewWithReports = {
        ...mockReview,
        compliance_reports: [
          {
            id: '1',
            report: '# Test Report\n- Item 1\n- Item 2'
          }
        ]
      }

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(reviewWithReports)
      })

      await getCodeReviewById(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith('code-reviews/detail', {
        pageTitle: 'Code Review Details',
        review: expect.objectContaining({
          compliance_reports: [
            expect.objectContaining({
              id: '1',
              report: expect.stringContaining('<h1>Test Report</h1>')
            })
          ]
        })
      })
    })
  })

  describe('getCodeReviewStatus', () => {
    it('should return review status successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockReview)
      }

      fetchSpy.mockResolvedValueOnce(mockResponse)

      const mockStatusH = {
        response: jest.fn().mockReturnThis(),
        code: jest.fn().mockReturnThis()
      }

      await getCodeReviewStatus(mockRequest, mockStatusH)

      expect(fetchSpy).toHaveBeenCalledWith(
        `${config.get('apiBaseUrl')}/api/v1/code-reviews/${mockRequest.params.id}`
      )
      expect(mockStatusH.response).toHaveBeenCalledWith({
        id: mockReview._id,
        status: mockReview.status
      })
    })

    it('should handle non-ok response', async () => {
      const mockResponse = {
        ok: false,
        status: 404
      }

      fetchSpy.mockResolvedValueOnce(mockResponse)

      const mockStatusH = {
        response: jest.fn().mockReturnThis(),
        code: jest.fn().mockReturnThis()
      }

      await getCodeReviewStatus(mockRequest, mockStatusH)

      expect(mockStatusH.response).toHaveBeenCalledWith({
        error: 'Failed to fetch review status'
      })
      expect(mockStatusH.code).toHaveBeenCalledWith(404)
    })

    it('should handle API errors', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('API Error'))

      const mockStatusH = {
        response: jest.fn().mockReturnThis(),
        code: jest.fn().mockReturnThis()
      }

      await getCodeReviewStatus(mockRequest, mockStatusH)

      expect(mockRequest.logger.error).toHaveBeenCalled()
      expect(mockStatusH.response).toHaveBeenCalledWith({
        error: 'Internal server error'
      })
      expect(mockStatusH.code).toHaveBeenCalledWith(500)
    })
  })

  describe('formatDate', () => {
    it('should handle noon (12pm)', async () => {
      const noonReview = {
        ...mockReview,
        created_at: '2024-01-14T12:00:00Z',
        updated_at: '2024-01-14T12:00:00Z'
      }

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(noonReview)
      })

      await getCodeReviewById(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith('code-reviews/detail', {
        pageTitle: 'Code Review Details',
        review: expect.objectContaining({
          created_at: '14 January 2024 at 12:00pm',
          updated_at: '14 January 2024 at 12:00pm'
        })
      })
    })

    it('should handle midnight (12am)', async () => {
      const midnightReview = {
        ...mockReview,
        created_at: '2024-01-14T00:00:00Z',
        updated_at: '2024-01-14T00:00:00Z'
      }

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(midnightReview)
      })

      await getCodeReviewById(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith('code-reviews/detail', {
        pageTitle: 'Code Review Details',
        review: expect.objectContaining({
          created_at: '14 January 2024 at 12:00am',
          updated_at: '14 January 2024 at 12:00am'
        })
      })
    })
  })
})

/**
 * @import { Server } from '@hapi/hapi'
 */
