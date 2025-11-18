import { BaseNodeExecutor } from './base'
import { WorkflowNodeData, ExecutionContext, NodeExecutionResult, HttpRequestData, NotificationData } from '@/types/workflow'
import axios from 'axios'

export class HttpRequestExecutor extends BaseNodeExecutor {
  async execute(
    nodeData: WorkflowNodeData,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    try {
      const config = (nodeData as HttpRequestData).config
      
      // URLと本文の変数を補間
      const url = this.interpolateVariables(config.url, context)
      const body = config.body ? this.interpolateVariables(config.body, context) : undefined
      
      const response = await axios({
        method: config.method,
        url,
        headers: config.headers || {},
        data: body ? JSON.parse(body) : undefined,
        timeout: 30000,
      })
      
      return this.createResult(
        context.runId,
        nodeData.label,
        'success',
        {
          status: response.status,
          data: response.data,
          headers: response.headers,
        }
      )
    } catch (error: any) {
      return this.createResult(
        context.runId,
        nodeData.label,
        'error',
        undefined,
        error.message
      )
    }
  }
}

export class NotificationExecutor extends BaseNodeExecutor {
  async execute(
    nodeData: WorkflowNodeData,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    try {
      const config = (nodeData as NotificationData).config
      
      // メッセージの変数を補間
      const message = this.interpolateVariables(config.message, context)
      const title = config.title ? this.interpolateVariables(config.title, context) : undefined
      
      // 実際の通知送信はここで実装
      // 今はダミーとして成功を返す
      console.log(`[Notification] ${config.channel} to ${config.recipient}:`, message)
      
      // 将来的にはunified-notification-hubへのAPI呼び出しを実装
      // await axios.post('/api/notifications', {
      //   channel: config.channel,
      //   recipient: config.recipient,
      //   message,
      //   title,
      // })
      
      return this.createResult(
        context.runId,
        nodeData.label,
        'success',
        {
          sent: true,
          channel: config.channel,
          recipient: config.recipient,
          message,
          timestamp: new Date().toISOString(),
        }
      )
    } catch (error: any) {
      return this.createResult(
        context.runId,
        nodeData.label,
        'error',
        undefined,
        error.message
      )
    }
  }
}
