import { describe, it, expect } from 'vitest'
import {
  createWorkflowSchema,
  updateWorkflowSchema,
  runWorkflowSchema,
} from '../lib/validations/workflow'

describe('Workflow Validations', () => {
  describe('createWorkflowSchema', () => {
    it('should validate a valid workflow creation', () => {
      const validData = {
        name: 'Test Workflow',
        description: 'A test workflow',
        graph: {
          nodes: [],
          edges: [],
        },
        isActive: false,
      }

      const result = createWorkflowSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Test Workflow')
      }
    })

    it('should reject workflow with empty name', () => {
      const invalidData = {
        name: '',
        description: 'A test workflow',
      }

      const result = createWorkflowSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject workflow with name too long', () => {
      const invalidData = {
        name: 'a'.repeat(101),
        description: 'A test workflow',
      }

      const result = createWorkflowSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should use default values for optional fields', () => {
      const minimalData = {
        name: 'Minimal Workflow',
      }

      const result = createWorkflowSchema.safeParse(minimalData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isActive).toBe(false)
      }
    })
  })

  describe('updateWorkflowSchema', () => {
    it('should validate partial updates', () => {
      const updateData = {
        name: 'Updated Name',
      }

      const result = updateWorkflowSchema.safeParse(updateData)
      expect(result.success).toBe(true)
    })

    it('should allow empty updates', () => {
      const result = updateWorkflowSchema.safeParse({})
      expect(result.success).toBe(true)
    })
  })

  describe('runWorkflowSchema', () => {
    it('should use default empty object for variables', () => {
      const result = runWorkflowSchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.variables).toEqual({})
      }
    })
  })
})
