import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    return NextResponse.json(workflows)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/workflows - 新規ワークフローを作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, graph, isActive } = body

    const workflow = await prisma.workflow.create({
      data: {
        name,
        description,
        graphJson: graph || { nodes: [], edges: [] },
        isActive: isActive ?? false,
      },
    })

    return NextResponse.json(workflow, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
