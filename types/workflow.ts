import { Node, Edge } from '@xyflow/react'

// ========================================
// ノード種別の定義
// ========================================

export type NodeCategory = 'trigger' | 'action' | 'utility'

export type NodeType =
  // Triggers
  | 'manual-trigger'
  | 'cron-trigger'
  // Actions
  | 'http-request'
  | 'notification'
  | 'llm-action'
  // Utilities
  | 'delay'
  | 'branch'

// ========================================
// ノードデータ型
// ========================================

export interface BaseNodeData {
  label: string
  category: NodeCategory
  type: NodeType
  config?: Record<string, any>
}

// Trigger Nodes
export interface ManualTriggerData extends BaseNodeData {
  type: 'manual-trigger'
  category: 'trigger'
}

export interface CronTriggerData extends BaseNodeData {
  type: 'cron-trigger'
  category: 'trigger'
  config: {
    schedule: string // cron expression
    timezone?: string
  }
}

// Action Nodes
export interface HttpRequestData extends BaseNodeData {
  type: 'http-request'
  category: 'action'
  config: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    url: string
    headers?: Record<string, string>
    body?: string
  }
}

export interface NotificationData extends BaseNodeData {
  type: 'notification'
  category: 'action'
  config: {
    channel: 'slack' | 'email' | 'webhook'
    recipient: string
    message: string
    title?: string
  }
}

export interface LLMActionData extends BaseNodeData {
  type: 'llm-action'
  category: 'action'
  config: {
    model?: string
    prompt: string
    temperature?: number
    maxTokens?: number
    systemPrompt?: string
  }
}

// Utility Nodes
export interface DelayData extends BaseNodeData {
  type: 'delay'
  category: 'utility'
  config: {
    duration: number // milliseconds
  }
}

export interface BranchData extends BaseNodeData {
  type: 'branch'
  category: 'utility'
  config: {
    condition: string // JavaScript expression
    trueLabel?: string
    falseLabel?: string
  }
}

export type WorkflowNodeData =
  | ManualTriggerData
  | CronTriggerData
  | HttpRequestData
  | NotificationData
  | LLMActionData
  | DelayData
  | BranchData

// React Flow用の型
export type WorkflowNode = Node<WorkflowNodeData>
export type WorkflowEdge = Edge

// ========================================
// ワークフロー定義
// ========================================

export interface WorkflowGraph {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

export interface WorkflowDefinition {
  id: string
  name: string
  description?: string
  graph: WorkflowGraph
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ========================================
// 実行コンテキスト
// ========================================

export interface ExecutionContext {
  runId: string
  workflowId: string
  variables: Record<string, any>
  previousOutputs: Record<string, any> // nodeId -> output
}

export interface NodeExecutionResult {
  nodeId: string
  nodeName: string
  status: 'success' | 'error'
  output?: any
  error?: string
}

// ========================================
// ノード定義テンプレート
// ========================================

export interface NodeDefinition {
  type: NodeType
  category: NodeCategory
  label: string
  description: string
  icon?: string
  defaultConfig: Record<string, any>
  configSchema?: {
    type: 'object'
    properties: Record<string, any>
  }
}

export const NODE_DEFINITIONS: Record<NodeType, NodeDefinition> = {
  'manual-trigger': {
    type: 'manual-trigger',
    category: 'trigger',
    label: 'Manual Trigger',
    description: '手動でワークフローを開始',
    defaultConfig: {},
  },
  'cron-trigger': {
    type: 'cron-trigger',
    category: 'trigger',
    label: 'Cron Trigger',
    description: 'スケジュールに基づいてワークフローを実行',
    defaultConfig: {
      schedule: '0 9 * * *', // 毎日9時
      timezone: 'Asia/Tokyo',
    },
  },
  'http-request': {
    type: 'http-request',
    category: 'action',
    label: 'HTTP Request',
    description: 'HTTPリクエストを送信',
    defaultConfig: {
      method: 'GET',
      url: '',
      headers: {},
    },
  },
  'notification': {
    type: 'notification',
    category: 'action',
    label: 'Notification',
    description: '通知を送信（Slack, Email等）',
    defaultConfig: {
      channel: 'slack',
      recipient: '',
      message: '',
    },
  },
  'llm-action': {
    type: 'llm-action',
    category: 'action',
    label: 'LLM Action',
    description: 'LLMを使用してテキストを生成',
    defaultConfig: {
      model: 'gpt-4o-mini',
      prompt: '',
      temperature: 0.7,
      maxTokens: 1000,
    },
  },
  'delay': {
    type: 'delay',
    category: 'utility',
    label: 'Delay',
    description: '指定時間待機',
    defaultConfig: {
      duration: 1000, // 1秒
    },
  },
  'branch': {
    type: 'branch',
    category: 'utility',
    label: 'Branch',
    description: '条件分岐',
    defaultConfig: {
      condition: 'true',
      trueLabel: 'True',
      falseLabel: 'False',
    },
  },
}
