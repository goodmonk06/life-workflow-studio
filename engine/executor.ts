import { WorkflowGraph, WorkflowNode, ExecutionContext, NodeExecutionResult, NodeType } from '@/types/workflow'
import { prisma } from '@/lib/prisma'
import { ManualTriggerExecutor, CronTriggerExecutor } from './nodes/triggers'
import { HttpRequestExecutor, NotificationExecutor } from './nodes/actions'
import { LLMActionExecutor } from './nodes/llm'
import { DelayExecutor, BranchExecutor } from './nodes/utilities'
import { NodeExecutor } from './nodes/base'

export class WorkflowExecutor {
  private executors: Map<NodeType, NodeExecutor>

  constructor() {
    this.executors = new Map()
    
    // Trigger executors
    this.executors.set('manual-trigger', new ManualTriggerExecutor())
    this.executors.set('cron-trigger', new CronTriggerExecutor())
    
    // Action executors
    this.executors.set('http-request', new HttpRequestExecutor())
    this.executors.set('notification', new NotificationExecutor())
    this.executors.set('llm-action', new LLMActionExecutor())
    
    // Utility executors
    this.executors.set('delay', new DelayExecutor())
    this.executors.set('branch', new BranchExecutor())
  }

  async executeWorkflow(workflowId: string, initialVariables: Record<string, any> = {}): Promise<string> {
    // ワークフロー定義を取得
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    })

    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`)
    }

    const graph = workflow.graphJson as WorkflowGraph

    // 実行記録を作成
    const run = await prisma.workflowRun.create({
      data: {
        workflowId,
        status: 'running',
      },
    })

    try {
      // 実行コンテキストを初期化
      const context: ExecutionContext = {
        runId: run.id,
        workflowId,
        variables: initialVariables,
        previousOutputs: {},
      }

      // トリガーノードを見つける
      const triggerNodes = graph.nodes.filter(
        node => node.data.category === 'trigger'
      )

      if (triggerNodes.length === 0) {
        throw new Error('No trigger node found in workflow')
      }

      // トリガーから実行を開始
      for (const triggerNode of triggerNodes) {
        await this.executeNode(triggerNode, graph, context)
      }

      // 実行完了
      await prisma.workflowRun.update({
        where: { id: run.id },
        data: {
          status: 'completed',
          finishedAt: new Date(),
        },
      })

      return run.id
    } catch (error: any) {
      // エラー時の処理
      await prisma.workflowRun.update({
        where: { id: run.id },
        data: {
          status: 'failed',
          finishedAt: new Date(),
          error: error.message,
        },
      })

      throw error
    }
  }

  private async executeNode(
    node: WorkflowNode,
    graph: WorkflowGraph,
    context: ExecutionContext
  ): Promise<void> {
    const executor = this.executors.get(node.data.type)

    if (!executor) {
      throw new Error(`No executor found for node type: ${node.data.type}`)
    }

    // ログ記録を作成（実行開始）
    const log = await prisma.workflowRunLog.create({
      data: {
        runId: context.runId,
        nodeId: node.id,
        nodeName: node.data.label,
        status: 'running',
      },
    })

    try {
      // ノードを実行
      const result = await executor.execute(node.data, context)

      // 出力を保存
      context.previousOutputs[node.id] = result.output

      // ログを更新
      await prisma.workflowRunLog.update({
        where: { id: log.id },
        data: {
          status: result.status,
          outputJson: result.output || {},
          error: result.error,
        },
      })

      if (result.status === 'error') {
        throw new Error(result.error || 'Node execution failed')
      }

      // 次のノードを見つけて実行
      const nextNodes = this.getNextNodes(node, graph, result)
      
      for (const nextNode of nextNodes) {
        await this.executeNode(nextNode, graph, context)
      }
    } catch (error: any) {
      // エラーログを記録
      await prisma.workflowRunLog.update({
        where: { id: log.id },
        data: {
          status: 'error',
          error: error.message,
        },
      })

      throw error
    }
  }

  private getNextNodes(
    currentNode: WorkflowNode,
    graph: WorkflowGraph,
    result: NodeExecutionResult
  ): WorkflowNode[] {
    // 現在のノードから出ているエッジを探す
    const outgoingEdges = graph.edges.filter(edge => edge.source === currentNode.id)

    if (outgoingEdges.length === 0) {
      return []
    }

    // Branch nodeの場合、結果に応じてエッジを選択
    if (currentNode.data.type === 'branch' && result.output?.result !== undefined) {
      const branchResult = result.output.result as boolean
      const selectedEdge = outgoingEdges.find(edge => {
        // sourceHandleで分岐を識別
        // trueの場合は'true'ハンドル、falseの場合は'false'ハンドル
        return edge.sourceHandle === (branchResult ? 'true' : 'false')
      })

      if (!selectedEdge) {
        return []
      }

      const nextNode = graph.nodes.find(node => node.id === selectedEdge.target)
      return nextNode ? [nextNode] : []
    }

    // 通常のノードは全ての次ノードを返す
    const nextNodes = outgoingEdges
      .map(edge => graph.nodes.find(node => node.id === edge.target))
      .filter((node): node is WorkflowNode => node !== undefined)

    return nextNodes
  }
}
