import { describe, it, expect } from 'vitest'
import { successResponse, errorResponse, handleApiError } from '../lib/api-response'
import { ZodError, z } from 'zod'

describe('API Response Utilities', () => {
  describe('successResponse', () => {
    it('should create a success response with data', () => {
      const data = { id: '123', name: 'Test' }
      const response = successResponse(data)

      expect(response.status).toBe(200)
    })

    it('should support custom status codes', () => {
      const data = { created: true }
      const response = successResponse(data, 201)

      expect(response.status).toBe(201)
    })
  })

  describe('errorResponse', () => {
    it('should create an error response', () => {
      const response = errorResponse('Something went wrong', 500)

      expect(response.status).toBe(500)
    })

    it('should include error code when provided', () => {
      const response = errorResponse('Not found', 404, 'NOT_FOUND')

      expect(response.status).toBe(404)
    })
  })

  describe('handleApiError', () => {
    it('should handle Zod validation errors', () => {
      const schema = z.object({
        name: z.string().min(1),
      })

      try {
        schema.parse({ name: '' })
      } catch (error) {
        const response = handleApiError(error)
        expect(response.status).toBe(400)
      }
    })

    it('should handle standard Error objects', () => {
      const error = new Error('Test error')
      const response = handleApiError(error)

      expect(response.status).toBe(500)
    })

    it('should handle Prisma P2025 (not found) errors', () => {
      const prismaError = {
        code: 'P2025',
        meta: {},
      }

      const response = handleApiError(prismaError)
      expect(response.status).toBe(404)
    })

    it('should handle Prisma P2002 (duplicate) errors', () => {
      const prismaError = {
        code: 'P2002',
        meta: {},
      }

      const response = handleApiError(prismaError)
      expect(response.status).toBe(409)
    })

    it('should handle unknown errors', () => {
      const response = handleApiError('unknown error')
      expect(response.status).toBe(500)
    })
  })
})
