import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    return NextResponse.json(logs)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
