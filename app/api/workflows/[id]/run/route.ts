import { NextRequest, NextResponse } from 'next/server'
import { WorkflowExecutor } from '@/engine/executor'

// POST /api/workflows/[id]/run - ワークフローを実行
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const variables = body.variables || {}

    const executor = new WorkflowExecutor()
    const runId = await executor.executeWorkflow(id, variables)

    return NextResponse.json({ 
      success: true,
      runId,
      message: 'Workflow execution started'
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
