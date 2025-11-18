import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, handleApiError } from '@/lib/api-response'

// GET /api/runs/[runId]/logs - 実行ログを取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params
    const logs = await prisma.workflowRunLog.findMany({
      where: { runId },
      orderBy: { createdAt: 'asc' },
    })

    return successResponse(logs)
  } catch (error) {
    return handleApiError(error)
  }
}
