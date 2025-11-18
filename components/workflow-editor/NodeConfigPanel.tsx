'use client'

import { WorkflowNode } from '@/types/workflow'

interface NodeConfigPanelProps {
  node: WorkflowNode | null
  onUpdate: (nodeId: string, data: Partial<WorkflowNode['data']>) => void
  onDelete: (nodeId: string) => void
}

export default function NodeConfigPanel({ node, onUpdate, onDelete }: NodeConfigPanelProps) {
  if (!node) {
    return (
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-4">
        <div className="text-center text-gray-500 mt-8">
          ÎüÉ’xžWf-š’èÆ
        </div>
      </div>
    )
  }

  const handleConfigChange = (key: string, value: any) => {
    onUpdate(node.id, {
      config: {
        ...node.data.config,
        [key]: value,
      },
    })
  }

  const handleLabelChange = (label: string) => {
    onUpdate(node.id, { label })
  }

  const renderConfigFields = () => {
    const { type, config = {} } = node.data

    switch (type) {
      case 'cron-trigger':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Schedule (Cron)</label>
              <input
                type="text"
                value={config.schedule || ''}
                onChange={(e) => handleConfigChange('schedule', e.target.value)}
                placeholder="0 9 * * *"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">‹: 0 9 * * * (Îå9B)</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Timezone</label>
              <input
                type="text"
                value={config.timezone || 'Asia/Tokyo'}
                onChange={(e) => handleConfigChange('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </>
        )

      case 'http-request':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Method</label>
              <select
                value={config.method || 'GET'}
                onChange={(e) => handleConfigChange('method', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
                <option>PATCH</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">URL</label>
              <input
                type="text"
                value={config.url || ''}
                onChange={(e) => handleConfigChange('url', e.target.value)}
                placeholder="https://api.example.com/endpoint"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Body (JSON)</label>
              <textarea
                value={config.body || ''}
                onChange={(e) => handleConfigChange('body', e.target.value)}
                placeholder='{"key": "value"}'
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
              />
            </div>
          </>
        )

      case 'notification':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Channel</label>
              <select
                value={config.channel || 'slack'}
                onChange={(e) => handleConfigChange('channel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option>slack</option>
                <option>email</option>
                <option>webhook</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Recipient</label>
              <input
                type="text"
                value={config.recipient || ''}
                onChange={(e) => handleConfigChange('recipient', e.target.value)}
                placeholder="#general or user@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={config.title || ''}
                onChange={(e) => handleConfigChange('title', e.target.value)}
                placeholder="ån¿¤Èë"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                value={config.message || ''}
                onChange={(e) => handleConfigChange('message', e.target.value)}
                placeholder="åáÃ»ü¸"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </>
        )

      case 'llm-action':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Model</label>
              <select
                value={config.model || 'gpt-4o-mini'}
                onChange={(e) => handleConfigChange('model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option>gpt-4o</option>
                <option>gpt-4o-mini</option>
                <option>gpt-4-turbo</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">System Prompt</label>
              <textarea
                value={config.systemPrompt || ''}
                onChange={(e) => handleConfigChange('systemPrompt', e.target.value)}
                placeholder="·¹Æà×íó×Èª×·çó	"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Prompt</label>
              <textarea
                value={config.prompt || ''}
                onChange={(e) => handleConfigChange('prompt', e.target.value)}
                placeholder="×íó×È"
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Temperature</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={config.temperature ?? 0.7}
                onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </>
        )

      case 'delay':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Duration (ms)</label>
            <input
              type="number"
              value={config.duration || 1000}
              onChange={(e) => handleConfigChange('duration', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        )

      case 'branch':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Condition</label>
              <input
                type="text"
                value={config.condition || ''}
                onChange={(e) => handleConfigChange('condition', e.target.value)}
                placeholder="‹: {{node1.value}} > 10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">True Label</label>
              <input
                type="text"
                value={config.trueLabel || 'True'}
                onChange={(e) => handleConfigChange('trueLabel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">False Label</label>
              <input
                type="text"
                value={config.falseLabel || 'False'}
                onChange={(e) => handleConfigChange('falseLabel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
      <div className="mb-4">
        <h2 className="text-lg font-bold mb-2">ÎüÉ-š</h2>
        <div className="text-sm text-gray-600 mb-4">{node.data.type}</div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Label</label>
          <input
            type="text"
            value={node.data.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {renderConfigFields()}

        <button
          onClick={() => onDelete(node.id)}
          className="w-full mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          ÎüÉ’Jd
        </button>
      </div>
    </div>
  )
}
