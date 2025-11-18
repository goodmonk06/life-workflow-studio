'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import WorkflowEditor from '@/components/workflow-editor/WorkflowEditor'
import { WorkflowNode, WorkflowEdge, WorkflowGraph } from '@/types/workflow'

export default function StudioPage() {
  const params = useParams()
  const router = useRouter()
  const workflowId = params.workflowId as string

  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [edges, setEdges] = useState<WorkflowEdge[]>([])
  const [loading, setLoading] = useState(true)
  const [workflowName, setWorkflowName] = useState('')

  useEffect(() => {
    if (workflowId) {
      fetchWorkflow()
    }
  }, [workflowId])

  const fetchWorkflow = async () => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`)
      if (response.ok) {
        const workflow = await response.json()
        const graph = workflow.graphJson as WorkflowGraph
        setNodes(graph.nodes || [])
        setEdges(graph.edges || [])
        setWorkflowName(workflow.name)
      }
    } catch (error) {
      console.error('Failed to fetch workflow:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (updatedNodes: WorkflowNode[], updatedEdges: WorkflowEdge[]) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          graph: {
            nodes: updatedNodes,
            edges: updatedEdges,
          },
        }),
      })

      if (response.ok) {
        alert('ïü¯Õíü’ÝXW~W_')
      } else {
        alert('ÝXk1WW~W_')
      }
    } catch (error) {
      console.error('Failed to save workflow:', error)
      alert('ÝXk1WW~W_')
    }
  }

  const handleRun = async () => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        alert(`ïü¯Õíü’ŸLW~W_Run ID: ${result.runId}`)
      } else {
        const error = await response.json()
        alert(`ŸLk1WW~W_: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to run workflow:', error)
      alert('ŸLk1WW~W_')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <WorkflowEditor
      workflowId={workflowId}
      initialNodes={nodes}
      initialEdges={edges}
      onSave={handleSave}
      onRun={handleRun}
    />
  )
}
