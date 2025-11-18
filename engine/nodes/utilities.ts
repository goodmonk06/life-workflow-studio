import { BaseNodeExecutor } from './base'
import { WorkflowNodeData, ExecutionContext, NodeExecutionResult, DelayData, BranchData } from '@/types/workflow'

export class DelayExecutor extends BaseNodeExecutor {
  async execute(
    nodeData: WorkflowNodeData,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    try {
      const config = (nodeData as DelayData).config
      const duration = config.duration || 1000
      
      await new Promise(resolve => setTimeout(resolve, duration))
      
      return this.createResult(
        context.runId,
        nodeData.label,
        'success',
        {
          delayed: duration,
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

export class BranchExecutor extends BaseNodeExecutor {
  async execute(
    nodeData: WorkflowNodeData,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    try {
      const config = (nodeData as BranchData).config
      
      // 条件式を評価
      // セキュリティ上の理由から、evalの代わりに安全な評価を使用すべき
      // ここでは簡易実装として、単純な比較のみをサポート
      let result = false
      
      try {
        // 変数を補間した条件式を評価
        const condition = this.interpolateVariables(config.condition, context)
        
        // 簡易的な評価（本番環境では式評価ライブラリを使用すべき）
        // 例: "{{node1.value}} > 10"
        result = this.evaluateCondition(condition, context)
      } catch (error) {
        console.error('Condition evaluation error:', error)
        result = false
      }
      
      return this.createResult(
        context.runId,
        nodeData.label,
        'success',
        {
          result,
          branch: result ? 'true' : 'false',
          condition: config.condition,
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

  private evaluateCondition(condition: string, context: ExecutionContext): boolean {
    // 安全な条件評価（簡易版）
    // 本番環境では、式評価ライブラリ（例: expr-eval）を使用
    
    // 数値比較をサポート
    const comparisonRegex = /^(.+?)\s*(===|!==|==|!=|>=|<=|>|<)\s*(.+)$/
    const match = condition.match(comparisonRegex)
    
    if (match) {
      const [, left, operator, right] = match
      const leftValue = this.parseValue(left.trim())
      const rightValue = this.parseValue(right.trim())
      
      switch (operator) {
        case '===':
        case '==':
          return leftValue == rightValue
        case '!==':
        case '!=':
          return leftValue != rightValue
        case '>':
          return Number(leftValue) > Number(rightValue)
        case '<':
          return Number(leftValue) < Number(rightValue)
        case '>=':
          return Number(leftValue) >= Number(rightValue)
        case '<=':
          return Number(leftValue) <= Number(rightValue)
      }
    }
    
    // boolean値として評価
    return condition === 'true' || condition === '1'
  }

  private parseValue(value: string): any {
    // 数値変換を試みる
    const num = Number(value)
    if (!isNaN(num)) return num
    
    // 文字列として扱う（引用符を除去）
    return value.replace(/^["'](.*)["']$/, '$1')
  }
}
