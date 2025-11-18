import { WorkflowNodeData, ExecutionContext, NodeExecutionResult } from '@/types/workflow'

export interface NodeExecutor {
  execute(
    nodeData: WorkflowNodeData,
    context: ExecutionContext
  ): Promise<NodeExecutionResult>
}

export abstract class BaseNodeExecutor implements NodeExecutor {
  abstract execute(
    nodeData: WorkflowNodeData,
    context: ExecutionContext
  ): Promise<NodeExecutionResult>

  protected createResult(
    nodeId: string,
    nodeName: string,
    status: 'success' | 'error',
    output?: any,
    error?: string
  ): NodeExecutionResult {
    return {
      nodeId,
      nodeName,
      status,
      output,
      error,
    }
  }

  protected interpolateVariables(template: string, context: ExecutionContext): string {
    let result = template
    
    // 前のノードの出力を参照: {{nodeId.field}}
    const nodeOutputPattern = /\{\{([^.]+)\.([^}]+)\}\}/g
    result = result.replace(nodeOutputPattern, (match, nodeId, field) => {
      const output = context.previousOutputs[nodeId]
      if (output && field in output) {
        return String(output[field])
      }
      return match
    })
    
    // 変数を参照: {{variableName}}
    const variablePattern = /\{\{([^.}]+)\}\}/g
    result = result.replace(variablePattern, (match, varName) => {
      if (varName in context.variables) {
        return String(context.variables[varName])
      }
      return match
    })
    
    return result
  }
}
