import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateWorkflowSchema } from '@/lib/validations/workflow'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

// GET /api/workflows/[id] - ワークフロー詳細を取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const workflow = await prisma.workflow.findUnique({
      where: { id },
      include: {
        runs: {
          take: 10,
          orderBy: { startedAt: 'desc' },
        },
      },
    })

    if (!workflow) {
      return errorResponse('Workflow not found', 404, 'NOT_FOUND')
    }

    return successResponse(workflow)
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/workflows/[id] - ワークフローを更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateWorkflowSchema.parse(body)

    const workflow = await prisma.workflow.update({
      where: { id },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.graph !== undefined && { graphJson: validatedData.graph }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
      },
    })

    return successResponse(workflow)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/workflows/[id] - ワークフローを削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.workflow.delete({
      where: { id },
    })

    return successResponse({ id, deleted: true })
  } catch (error) {
    return handleApiError(error)
  }
}
