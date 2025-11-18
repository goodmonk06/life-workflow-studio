import { z } from 'zod'

// Node data validation schemas
export const nodeDataSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  category: z.enum(['trigger', 'action', 'utility']),
  type: z.string(),
  config: z.record(z.any()).optional(),
})

export const nodeSchema = z.object({
  id: z.string(),
  type: z.string().optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: nodeDataSchema,
})

export const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional().nullable(),
  targetHandle: z.string().optional().nullable(),
})

export const workflowGraphSchema = z.object({
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
})

// Workflow CRUD validation schemas
export const createWorkflowSchema = z.object({
  name: z.string().min(1, 'Workflow name is required').max(100, 'Workflow name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  graph: workflowGraphSchema.optional(),
  isActive: z.boolean().optional().default(false),
})

export const updateWorkflowSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  graph: workflowGraphSchema.optional(),
  isActive: z.boolean().optional(),
})

export const runWorkflowSchema = z.object({
  variables: z.record(z.any()).optional().default({}),
})

// Export types
export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>
export type RunWorkflowInput = z.infer<typeof runWorkflowSchema>
