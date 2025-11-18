import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createWorkflowSchema } from '@/lib/validations/workflow'
import { successResponse, handleApiError } from '@/lib/api-response'

// GET /api/workflows - 全ワークフローを取得
export async function GET() {
  try {
    const workflows = await prisma.workflow.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        runs: {
          take: 5,
          orderBy: { startedAt: 'desc' },
        },
      },
    })

    return successResponse(workflows)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/workflows - 新規ワークフローを作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createWorkflowSchema.parse(body)

    const workflow = await prisma.workflow.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        graphJson: validatedData.graph || { nodes: [], edges: [] },
        isActive: validatedData.isActive,
      },
    })

    return successResponse(workflow, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
