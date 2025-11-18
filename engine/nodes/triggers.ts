import { BaseNodeExecutor } from './base'
import { WorkflowNodeData, ExecutionContext, NodeExecutionResult } from '@/types/workflow'

export class ManualTriggerExecutor extends BaseNodeExecutor {
  async execute(
    nodeData: WorkflowNodeData,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    // Manual triggerは単に成功を返す
    return this.createResult(
      context.runId,
      nodeData.label,
      'success',
      { triggered: true, timestamp: new Date().toISOString() }
    )
  }
}

export class CronTriggerExecutor extends BaseNodeExecutor {
  async execute(
    nodeData: WorkflowNodeData,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    // Cron triggerも実行時は単に成功を返す
    // スケジューリングは別のワーカーで処理
    return this.createResult(
      context.runId,
      nodeData.label,
      'success',
      { 
        triggered: true, 
        timestamp: new Date().toISOString(),
        schedule: nodeData.config?.schedule 
      }
    )
  }
}
