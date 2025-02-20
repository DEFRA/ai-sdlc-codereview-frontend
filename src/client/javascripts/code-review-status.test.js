/**
 * @jest-environment jsdom
 */

import { initStatusPolling, __testing__ } from './code-review-status.js'

const { updateStatusElement, fetchReviewStatus, needsPolling } = __testing__

describe('Code Review Status', () => {
  let fetchMock

  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })
    fetchMock = jest.fn()
    global.fetch = fetchMock
    document.body.innerHTML = ''
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
    global.fetch = undefined
  })

  describe('updateStatusElement', () => {
    let statusElement

    beforeEach(() => {
      statusElement = document.createElement('strong')
      statusElement.className = 'govuk-tag'
      document.body.appendChild(statusElement)
    })

    it('updates text content and aria-label', () => {
      updateStatusElement(statusElement, 'completed')
      expect(statusElement.textContent).toBe('Completed')
      expect(statusElement.getAttribute('aria-label')).toBe(
        'Review status: Completed'
      )
    })

    it('formats status with underscores', () => {
      updateStatusElement(statusElement, 'in_progress')
      expect(statusElement.textContent).toBe('In progress')
      expect(statusElement.getAttribute('aria-label')).toBe(
        'Review status: In progress'
      )
    })

    it('adds red tag class for failed status', () => {
      updateStatusElement(statusElement, 'failed')
      expect(statusElement.classList.contains('govuk-tag--red')).toBe(true)
    })

    it('adds green tag class for completed status', () => {
      updateStatusElement(statusElement, 'completed')
      expect(statusElement.classList.contains('govuk-tag--green')).toBe(true)
    })

    it('adds blue tag class for other statuses', () => {
      updateStatusElement(statusElement, 'pending')
      expect(statusElement.classList.contains('govuk-tag--blue')).toBe(true)
    })
  })

  describe('fetchReviewStatus', () => {
    it('fetches status successfully', async () => {
      const mockResponse = { id: '123', status: 'completed' }
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await fetchReviewStatus('123')
      expect(result).toEqual(mockResponse)
      expect(fetchMock).toHaveBeenCalledWith('/api/code-reviews/123/status')
    })

    it('throws error on failed fetch', async () => {
      fetchMock.mockResolvedValueOnce({ ok: false, status: 404 })
      await expect(fetchReviewStatus('123')).rejects.toThrow(
        'Failed to fetch status for review 123: 404'
      )
    })

    it('throws error on network failure', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'))
      await expect(fetchReviewStatus('123')).rejects.toThrow('Network error')
    })
  })

  describe('needsPolling', () => {
    const pollableStatuses = ['pending', 'in progress', 'started']
    pollableStatuses.forEach((status) => {
      it(`returns true for "${status}" status`, () => {
        expect(needsPolling(status)).toBe(true)
      })
    })

    it('handles case insensitivity', () => {
      expect(needsPolling('PENDING')).toBe(true)
      expect(needsPolling('In Progress')).toBe(true)
    })

    it('handles whitespace', () => {
      expect(needsPolling('  pending  ')).toBe(true)
      expect(needsPolling('  completed  ')).toBe(false)
    })

    const completedStatuses = ['completed', 'failed']
    completedStatuses.forEach((status) => {
      it(`returns false for "${status}" status`, () => {
        expect(needsPolling(status)).toBe(false)
      })
    })
  })

  describe('initStatusPolling', () => {
    const createReviewElement = (id, status) => {
      const displayStatus = status.charAt(0).toUpperCase() + status.slice(1)
      return `
        <strong data-review-id="${id}" class="govuk-tag${status.toLowerCase() === 'completed' ? ' govuk-tag--green' : ''}">${displayStatus}</strong>
      `
    }

    it('does not start polling if no reviews are present', async () => {
      document.body.innerHTML = '<div></div>'
      initStatusPolling()
      await jest.runAllTimersAsync()
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('does not poll for completed reviews', async () => {
      document.body.innerHTML = `<div>${createReviewElement('123', 'completed')}</div>`
      initStatusPolling()
      await jest.runAllTimersAsync()
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('polls and updates pending review status', async () => {
      document.body.innerHTML = `<div>${createReviewElement('123', 'pending')}</div>`
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '123', status: 'completed' })
      })

      initStatusPolling()
      await Promise.resolve()
      await jest.advanceTimersByTimeAsync(0)

      const element = document.querySelector('[data-review-id]')
      expect(fetchMock).toHaveBeenCalledWith('/api/code-reviews/123/status')
      expect(element.textContent).toBe('Completed')
      expect(element.className).toContain('govuk-tag--green')
    })

    it('continues polling until review is completed', async () => {
      document.body.innerHTML = `<div>${createReviewElement('123', 'pending')}</div>`

      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: '123', status: 'in progress' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: '123', status: 'completed' })
        })

      initStatusPolling()

      // Initial check: pending -> in progress
      await Promise.resolve()
      await jest.advanceTimersByTimeAsync(0)
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(document.querySelector('[data-review-id]').textContent).toBe(
        'In progress'
      )

      // Second check: in progress -> completed
      await jest.advanceTimersByTimeAsync(10000)
      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(document.querySelector('[data-review-id]').textContent).toBe(
        'Completed'
      )

      // Verify polling stops
      await jest.advanceTimersByTimeAsync(10000)
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('handles multiple reviews with different statuses', async () => {
      document.body.innerHTML = `
        <div>
          ${createReviewElement('123', 'pending')}
          ${createReviewElement('456', 'in progress')}
          ${createReviewElement('789', 'completed')}
        </div>
      `

      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: '123', status: 'completed' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: '456', status: 'in progress' })
        })

      initStatusPolling()
      await Promise.resolve()
      await jest.advanceTimersByTimeAsync(0)

      const elements = document.querySelectorAll('[data-review-id]')
      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(fetchMock).toHaveBeenCalledWith('/api/code-reviews/123/status')
      expect(fetchMock).toHaveBeenCalledWith('/api/code-reviews/456/status')
      expect([...elements].map((el) => el.textContent)).toEqual([
        'Completed',
        'In progress',
        'Completed'
      ])
    })

    it('continues polling on API error', async () => {
      document.body.innerHTML = `<div>${createReviewElement('123', 'pending')}</div>`

      fetchMock
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: '123', status: 'completed' })
        })

      initStatusPolling()

      // First check fails
      await Promise.resolve()
      await jest.advanceTimersByTimeAsync(0)
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(document.querySelector('[data-review-id]').textContent).toBe(
        'Pending'
      )

      // Second check succeeds
      await jest.advanceTimersByTimeAsync(10000)
      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(document.querySelector('[data-review-id]').textContent).toBe(
        'Completed'
      )
    })

    it('continues polling on non-ok API response', async () => {
      document.body.innerHTML = `<div>${createReviewElement('123', 'pending')}</div>`

      fetchMock
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: '123', status: 'completed' })
        })

      initStatusPolling()

      // First check returns error
      await Promise.resolve()
      await jest.advanceTimersByTimeAsync(0)
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(document.querySelector('[data-review-id]').textContent).toBe(
        'Pending'
      )

      // Second check succeeds
      await jest.advanceTimersByTimeAsync(10000)
      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(document.querySelector('[data-review-id]').textContent).toBe(
        'Completed'
      )
    })
  })
})
