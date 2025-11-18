import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.workflowRunLog.deleteMany()
  await prisma.workflowRun.deleteMany()
  await prisma.workflow.deleteMany()

  // Example 1: Simple HTTP Request Workflow
  const workflow1 = await prisma.workflow.create({
    data: {
      name: 'Daily Weather Check',
      description: 'Fetch weather data and send notification',
      isActive: true,
      graphJson: {
        nodes: [
          {
            id: 'trigger-1',
            type: 'default',
            position: { x: 100, y: 100 },
            data: {
              label: 'Manual Trigger',
              category: 'trigger',
              type: 'manual-trigger',
              config: {},
            },
          },
          {
            id: 'http-1',
            type: 'default',
            position: { x: 100, y: 250 },
            data: {
              label: 'Get Weather',
              category: 'action',
              type: 'http-request',
              config: {
                method: 'GET',
                url: 'https://api.openweathermap.org/data/2.5/weather?q=Tokyo&appid=demo',
                headers: {},
              },
            },
          },
          {
            id: 'notify-1',
            type: 'default',
            position: { x: 100, y: 400 },
            data: {
              label: 'Send Weather Update',
              category: 'action',
              type: 'notification',
              config: {
                channel: 'slack',
                recipient: '#general',
                title: 'Daily Weather',
                message: 'Weather data: {{http-1.data}}',
              },
            },
          },
        ],
        edges: [
          { id: 'e1-2', source: 'trigger-1', target: 'http-1' },
          { id: 'e2-3', source: 'http-1', target: 'notify-1' },
        ],
      },
    },
  })

  // Example 2: Morning Task List with LLM
  const workflow2 = await prisma.workflow.create({
    data: {
      name: '朝のタスクリスト通知',
      description: '毎朝9時にAI生成されたタスクリストをSlackに送信',
      isActive: false,
      graphJson: {
        nodes: [
          {
            id: 'cron-1',
            type: 'default',
            position: { x: 100, y: 100 },
            data: {
              label: 'Every Morning 9AM',
              category: 'trigger',
              type: 'cron-trigger',
              config: {
                schedule: '0 9 * * *',
                timezone: 'Asia/Tokyo',
              },
            },
          },
          {
            id: 'llm-1',
            type: 'default',
            position: { x: 100, y: 250 },
            data: {
              label: 'Generate Task List',
              category: 'action',
              type: 'llm-action',
              config: {
                model: 'gpt-4o-mini',
                systemPrompt: 'あなたは生産的なアシスタントです。',
                prompt: '今日やるべきタスクのリストを3つ提案してください。簡潔に箇条書きで出力してください。',
                temperature: 0.7,
                maxTokens: 500,
              },
            },
          },
          {
            id: 'notify-2',
            type: 'default',
            position: { x: 100, y: 400 },
            data: {
              label: 'Send to Slack',
              category: 'action',
              type: 'notification',
              config: {
                channel: 'slack',
                recipient: '#general',
                title: '今日のタスクリスト',
                message: '{{llm-1.output}}',
              },
            },
          },
        ],
        edges: [
          { id: 'e1-2', source: 'cron-1', target: 'llm-1' },
          { id: 'e2-3', source: 'llm-1', target: 'notify-2' },
        ],
      },
    },
  })

  // Example 3: Conditional Branch Workflow
  const workflow3 = await prisma.workflow.create({
    data: {
      name: 'Temperature Alert',
      description: 'Check temperature and send alert if too hot',
      isActive: false,
      graphJson: {
        nodes: [
          {
            id: 'trigger-3',
            type: 'default',
            position: { x: 100, y: 100 },
            data: {
              label: 'Manual Start',
              category: 'trigger',
              type: 'manual-trigger',
              config: {},
            },
          },
          {
            id: 'http-2',
            type: 'default',
            position: { x: 100, y: 250 },
            data: {
              label: 'Get Temperature',
              category: 'action',
              type: 'http-request',
              config: {
                method: 'GET',
                url: 'https://api.openweathermap.org/data/2.5/weather?q=Tokyo&appid=demo',
                headers: {},
              },
            },
          },
          {
            id: 'branch-1',
            type: 'default',
            position: { x: 100, y: 400 },
            data: {
              label: 'Check if Hot',
              category: 'utility',
              type: 'branch',
              config: {
                condition: '{{http-2.data.main.temp}} > 30',
                trueLabel: 'Hot',
                falseLabel: 'Normal',
              },
            },
          },
          {
            id: 'notify-3',
            type: 'default',
            position: { x: 50, y: 550 },
            data: {
              label: 'Send Hot Alert',
              category: 'action',
              type: 'notification',
              config: {
                channel: 'slack',
                recipient: '#alerts',
                title: '高温警告',
                message: '気温が30度を超えています！',
              },
            },
          },
          {
            id: 'delay-1',
            type: 'default',
            position: { x: 250, y: 550 },
            data: {
              label: 'Wait 1 second',
              category: 'utility',
              type: 'delay',
              config: {
                duration: 1000,
              },
            },
          },
        ],
        edges: [
          { id: 'e1-2', source: 'trigger-3', target: 'http-2' },
          { id: 'e2-3', source: 'http-2', target: 'branch-1' },
          { id: 'e3-4', source: 'branch-1', target: 'notify-3', sourceHandle: 'true' },
          { id: 'e3-5', source: 'branch-1', target: 'delay-1', sourceHandle: 'false' },
        ],
      },
    },
  })

  console.log('✅ Created workflows:')
  console.log(`  - ${workflow1.name} (${workflow1.id})`)
  console.log(`  - ${workflow2.name} (${workflow2.id})`)
  console.log(`  - ${workflow3.name} (${workflow3.id})`)

  console.log('\n🎉 Seeding complete!')
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
