import { describe, it, expect, beforeEach } from 'vitest'
import { DelayExecutor, BranchExecutor } from '../engine/nodes/utilities'
import { ExecutionContext } from '../types/workflow'

describe('Node Executors', () => {
  let context: ExecutionContext

  beforeEach(() => {
    context = {
      runId: 'test-run-1',
      workflowId: 'test-workflow-1',
      variables: {},
      previousOutputs: {},
    }
  })

  describe('DelayExecutor', () => {
    it('should delay for specified duration', async () => {
      const executor = new DelayExecutor()
      const nodeData = {
        label: 'Test Delay',
        category: 'utility' as const,
        type: 'delay' as const,
        config: {
          duration: 100,
        },
      }

      const startTime = Date.now()
      const result = await executor.execute(nodeData, context)
      const endTime = Date.now()

      expect(result.status).toBe('success')
      expect(endTime - startTime).toBeGreaterThanOrEqual(90) // Account for some variance
      expect(result.output?.delayed).toBe(100)
    })
  })

  describe('BranchExecutor', () => {
    it('should evaluate simple true condition', async () => {
      const executor = new BranchExecutor()
      const nodeData = {
        label: 'Test Branch',
        category: 'utility' as const,
        type: 'branch' as const,
        config: {
          condition: 'true',
          trueLabel: 'Yes',
          falseLabel: 'No',
        },
      }

      const result = await executor.execute(nodeData, context)

      expect(result.status).toBe('success')
      expect(result.output?.result).toBe(true)
      expect(result.output?.branch).toBe('true')
    })

    it('should evaluate simple false condition', async () => {
      const executor = new BranchExecutor()
      const nodeData = {
        label: 'Test Branch',
        category: 'utility' as const,
        type: 'branch' as const,
        config: {
          condition: 'false',
          trueLabel: 'Yes',
          falseLabel: 'No',
        },
      }

      const result = await executor.execute(nodeData, context)

      expect(result.status).toBe('success')
      expect(result.output?.result).toBe(false)
      expect(result.output?.branch).toBe('false')
    })

    it('should evaluate numeric comparison', async () => {
      const executor = new BranchExecutor()
      const nodeData = {
        label: 'Test Branch',
        category: 'utility' as const,
        type: 'branch' as const,
        config: {
          condition: '10 > 5',
          trueLabel: 'Greater',
          falseLabel: 'NotGreater',
        },
      }

      const result = await executor.execute(nodeData, context)

      expect(result.status).toBe('success')
      expect(result.output?.result).toBe(true)
    })

    it('should handle variable interpolation in conditions', async () => {
      const executor = new BranchExecutor()
      context.previousOutputs = {
        'node-1': { value: 25 },
      }

      const nodeData = {
        label: 'Test Branch',
        category: 'utility' as const,
        type: 'branch' as const,
        config: {
          condition: '{{node-1.value}} > 20',
          trueLabel: 'Hot',
          falseLabel: 'Cold',
        },
      }

      const result = await executor.execute(nodeData, context)

      expect(result.status).toBe('success')
      expect(result.output?.result).toBe(true)
    })
  })
})
