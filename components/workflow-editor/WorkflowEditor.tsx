'use client'

import { useCallback, useState, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import CustomNode from './CustomNode'
import NodePalette from './NodePalette'
import NodeConfigPanel from './NodeConfigPanel'
import { WorkflowNode, WorkflowEdge, NodeType, NODE_DEFINITIONS } from '@/types/workflow'

interface WorkflowEditorProps {
  workflowId: string
  initialNodes?: WorkflowNode[]
  initialEdges?: WorkflowEdge[]
  onSave: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void
  onRun: () => void
}

export default function WorkflowEditor({
  workflowId,
  initialNodes = [],
  initialEdges = [],
  onSave,
  onRun,
}: WorkflowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      default: CustomNode,
    }),
    []
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds))
    },
    [setEdges]
  )

  const onAddNode = useCallback(
    (nodeType: NodeType) => {
      const nodeDefinition = NODE_DEFINITIONS[nodeType]
      const newNode: WorkflowNode = {
        id: `${nodeType}-${Date.now()}`,
        type: 'default',
        position: {
          x: Math.random() * 400 + 100,
          y: Math.random() * 400 + 100,
        },
        data: {
          label: nodeDefinition.label,
          category: nodeDefinition.category,
          type: nodeType,
          config: { ...nodeDefinition.defaultConfig },
        },
      }

      setNodes((nds) => [...nds, newNode])
    },
    [setNodes]
  )

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: WorkflowNode) => {
      setSelectedNode(node)
    },
    []
  )

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const onUpdateNode = useCallback(
    (nodeId: string, data: Partial<WorkflowNode['data']>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...data,
              },
            }
          }
          return node
        })
      )

      // xžUŒ_ÎüÉnÅ1‚ô°
      setSelectedNode((current) => {
        if (current && current.id === nodeId) {
          return {
            ...current,
            data: {
              ...current.data,
              ...data,
            },
          }
        }
        return current
      })
    },
    [setNodes]
  )

  const onDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId))
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
      setSelectedNode(null)
    },
    [setNodes, setEdges]
  )

  const handleSave = useCallback(() => {
    onSave(nodes, edges)
  }, [nodes, edges, onSave])

  return (
    <div className="flex h-screen">
      <NodePalette onAddNode={onAddNode} />

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Workflow Editor</h1>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              ÝX
            </button>
            <button
              onClick={onRun}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Æ¹ÈŸL
            </button>
          </div>
        </div>

        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>

      <NodeConfigPanel
        node={selectedNode}
        onUpdate={onUpdateNode}
        onDelete={onDeleteNode}
      />
    </div>
  )
}
