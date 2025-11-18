import { BaseNodeExecutor } from './base'
import { WorkflowNodeData, ExecutionContext, NodeExecutionResult, LLMActionData } from '@/types/workflow'
import OpenAI from 'openai'

export class LLMActionExecutor extends BaseNodeExecutor {
  private openai: OpenAI

  constructor() {
    super()
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  async execute(
    nodeData: WorkflowNodeData,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    try {
      const config = (nodeData as LLMActionData).config
      
      // プロンプトの変数を補間
      const prompt = this.interpolateVariables(config.prompt, context)
      const systemPrompt = config.systemPrompt 
        ? this.interpolateVariables(config.systemPrompt, context)
        : undefined
      
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []
      
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt })
      }
      
      messages.push({ role: 'user', content: prompt })
      
      const response = await this.openai.chat.completions.create({
        model: config.model || 'gpt-4o-mini',
        messages,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 1000,
      })
      
      const output = response.choices[0]?.message?.content || ''
      
      return this.createResult(
        context.runId,
        nodeData.label,
        'success',
        {
          output,
          model: config.model,
          usage: response.usage,
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
