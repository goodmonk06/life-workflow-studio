'use client'

import { NODE_DEFINITIONS, NodeType } from '@/types/workflow'

interface NodePaletteProps {
  onAddNode: (nodeType: NodeType) => void
}

export default function NodePalette({ onAddNode }: NodePaletteProps) {
  const categories = {
    trigger: Object.values(NODE_DEFINITIONS).filter(n => n.category === 'trigger'),
    action: Object.values(NODE_DEFINITIONS).filter(n => n.category === 'action'),
    utility: Object.values(NODE_DEFINITIONS).filter(n => n.category === 'utility'),
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'trigger':
        return 'bg-green-100 border-green-300 hover:bg-green-200'
      case 'action':
        return 'bg-blue-100 border-blue-300 hover:bg-blue-200'
      case 'utility':
        return 'bg-purple-100 border-purple-300 hover:bg-purple-200'
      default:
        return 'bg-gray-100 border-gray-300 hover:bg-gray-200'
    }
  }

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">ÎüÉ</h2>

      <div className="space-y-4">
        {Object.entries(categories).map(([category, nodes]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-gray-600 mb-2 capitalize">
              {category}
            </h3>
            <div className="space-y-2">
              {nodes.map((node) => (
                <button
                  key={node.type}
                  onClick={() => onAddNode(node.type)}
                  className={`
                    w-full text-left p-3 rounded-lg border cursor-pointer
                    transition-colors duration-150
                    ${getCategoryColor(node.category)}
                  `}
                >
                  <div className="font-medium text-sm">{node.label}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {node.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
