#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client'
import cron from 'node-cron'
import { WorkflowExecutor } from '../engine/executor'
import { WorkflowGraph } from '../types/workflow'

const prisma = new PrismaClient()

async function checkAndRunCronWorkflows() {
  console.log('[Cron Worker] Checking for cron-triggered workflows...')

  try {
    // ¢¯Æ£Öjïü¯Õíü’Ö—
    const workflows = await prisma.workflow.findMany({
      where: { isActive: true },
    })

    for (const workflow of workflows) {
      const graph = workflow.graphJson as WorkflowGraph

      // Cron Trigger’dÎüÉ’¢Y
      const cronTriggerNodes = graph.nodes.filter(
        (node) => node.data.type === 'cron-trigger'
      )

      for (const cronNode of cronTriggerNodes) {
        const schedule = cronNode.data.config?.schedule

        if (schedule) {
          // CronL	¹KÁ§Ã¯
          if (cron.validate(schedule)) {
            console.log(`[Cron Worker] Scheduling workflow: ${workflow.name} (${schedule})`)

            // Cron¸çÖ’{2
            cron.schedule(schedule, async () => {
              console.log(`[Cron Worker] Executing workflow: ${workflow.name}`)
              try {
                const executor = new WorkflowExecutor()
                const runId = await executor.executeWorkflow(workflow.id)
                console.log(`[Cron Worker] Workflow ${workflow.name} completed. Run ID: ${runId}`)
              } catch (error) {
                console.error(`[Cron Worker] Error executing workflow ${workflow.name}:`, error)
              }
            })
          } else {
            console.warn(`[Cron Worker] Invalid cron expression for workflow ${workflow.name}: ${schedule}`)
          }
        }
      }
    }

    console.log('[Cron Worker] Cron jobs registered. Worker is now running...')
  } catch (error) {
    console.error('[Cron Worker] Error:', error)
  }
}

// ·ó×ëjÝüêó°ŸÅ,j°ƒgoˆŠbjŸÅLÅ	
async function pollAndExecute() {
  console.log('[Cron Worker] Polling for scheduled workflows...')

  try {
    const workflows = await prisma.workflow.findMany({
      where: { isActive: true },
    })

    const now = new Date()
    const currentMinute = now.getMinutes()
    const currentHour = now.getHours()

    for (const workflow of workflows) {
      const graph = workflow.graphJson as WorkflowGraph

      const cronTriggerNodes = graph.nodes.filter(
        (node) => node.data.type === 'cron-trigger'
      )

      for (const cronNode of cronTriggerNodes) {
        const schedule = cronNode.data.config?.schedule

        if (schedule) {
          // !„j¹±¸åüëÁ§Ã¯,j°ƒgo cron-parser ’(YyM	
          // ‹: "0 9 * * *" (Îå9B)
          const parts = schedule.split(' ')
          if (parts.length >= 5) {
            const minute = parts[0]
            const hour = parts[1]

            const shouldRun =
              (minute === '*' || parseInt(minute) === currentMinute) &&
              (hour === '*' || parseInt(hour) === currentHour)

            if (shouldRun) {
              console.log(`[Cron Worker] Executing scheduled workflow: ${workflow.name}`)
              try {
                const executor = new WorkflowExecutor()
                await executor.executeWorkflow(workflow.id)
              } catch (error) {
                console.error(`[Cron Worker] Error:`, error)
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('[Cron Worker] Polling error:', error)
  }
}

// á¤óæ
async function main() {
  console.log('[Cron Worker] Starting cron worker...')

  // node-cron’(W_¹±¸åüêó°
  await checkAndRunCronWorkflows()

  // ãÿ1ThkÝüêó°‹z°ƒ(	
  // setInterval(pollAndExecute, 60000)

  // ×í»¹’­
  process.on('SIGINT', async () => {
    console.log('\n[Cron Worker] Shutting down...')
    await prisma.$disconnect()
    process.exit(0)
  })
}

main().catch((error) => {
  console.error('[Cron Worker] Fatal error:', error)
  process.exit(1)
})
