import { NextRequest } from 'next/server'
import { WorkflowExecutor } from '@/engine/executor'
import { runWorkflowSchema } from '@/lib/validations/workflow'
import { successResponse, handleApiError } from '@/lib/api-response'

// POST /api/workflows/[id]/run - ワークフローを実行
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const validatedData = runWorkflowSchema.parse(body)

    const executor = new WorkflowExecutor()
    const runId = await executor.executeWorkflow(id, validatedData.variables)

    return successResponse({
      runId,
      message: 'Workflow execution started',
    })
  } catch (error) {
    return handleApiError(error)
  }
}
