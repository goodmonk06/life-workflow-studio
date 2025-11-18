'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { WorkflowNodeData } from '@/types/workflow'

const CustomNode = ({ data, selected }: NodeProps<WorkflowNodeData>) => {
  const getCategoryColor = () => {
    switch (data.category) {
      case 'trigger':
        return 'bg-green-500'
      case 'action':
        return 'bg-blue-500'
      case 'utility':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getCategoryBorder = () => {
    switch (data.category) {
      case 'trigger':
        return 'border-green-600'
      case 'action':
        return 'border-blue-600'
      case 'utility':
        return 'border-purple-600'
      default:
        return 'border-gray-600'
    }
  }

  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 bg-white shadow-md min-w-[180px]
        ${selected ? 'ring-2 ring-offset-2 ring-blue-400' : ''}
        ${getCategoryBorder()}
      `}
    >
      {data.category !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3"
        />
      )}

      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${getCategoryColor()}`} />
        <div className="font-semibold text-sm">{data.label}</div>
      </div>

      <div className="text-xs text-gray-500 mt-1">
        {data.type}
      </div>

      {data.type === 'branch' ? (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            className="w-3 h-3 left-[30%]"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            className="w-3 h-3 left-[70%]"
          />
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3"
        />
      )}
    </div>
  )
}

export default memo(CustomNode)
