import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { llmChat } from '@/lib/llm'
import {
  AGENTS,
  SEED_INCIDENTS,
  CYBER_MEMORY,
  BUSINESS_IMPACT,
  CRITICAL_ASSETS,
} from '@/lib/cyber-data'

export const dynamic = 'force-dynamic'
export const maxDuration = 90

const SYSTEM_PROMPT = `You are CyberMind AI's Executive Copilot — the business-language layer of an Autonomous AI Cyber Defense Operating System (AICDOS) protecting Critical National Infrastructure.

Your job: answer CISOs, CIOs, and executives in clear, business-oriented language. Translate technical telemetry into risk, financial impact, and recommended actions. Be concise, decisive, and grounded in the live SOC context provided.

Style rules:
- Lead with the bottom line (risk level + the one thing that matters most).
- Use short paragraphs and bullet points. Bold key numbers with **.
- Give a confidence level when making a prediction or recommendation.
- Reference MITRE ATT&CK techniques by ID when relevant, but always explain them.
- Recommend autonomous response actions the SOC can stage or execute.
- Never invent specific IPs, CVE IDs, or asset names that contradict the live context provided.

You can also speak to analysts — when the question is technical, answer technically but still explainable. Use Markdown for formatting.`

export async function POST(req: Request) {
  try {
    const { message, sessionId = 'default' } = await req.json()
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }

    const context = buildContext()

    let history: any[] = []
    try {
      history = await db.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
        take: 10,
      })
    } catch (e) {
      // DB optional
    }

    const historyMessages = history.map((m) => ({
      role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.content,
    }))

    const reply = await llmChat([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: `Live SOC Context:\n${context}` },
      ...historyMessages,
      { role: 'user', content: message },
    ])

    try {
      await db.chatMessage.createMany({
        data: [
          { role: 'user', content: message, sessionId, agent: 'executive-copilot' },
          { role: 'assistant', content: reply, sessionId, agent: 'executive-copilot' },
        ],
      })
    } catch (e) {
      // DB optional
    }

    return NextResponse.json({ reply, sessionId, timestamp: new Date().toISOString() })
  } catch (e: any) {
    console.error('[chat] error', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const messages = await db.chatMessage.findMany({
      where: { sessionId: 'default' },
      orderBy: { createdAt: 'asc' },
      take: 50,
    })
    return NextResponse.json({ messages })
  } catch (e: any) {
    return NextResponse.json({ messages: [] })
  }
}

function buildContext(): string {
  const topIncidents = SEED_INCIDENTS.slice(0, 5)
    .map(
      (i) =>
        `- [${i.severity.toUpperCase()}] ${i.title} (${i.status}) — asset: ${i.assetAffected}, MITRE: ${i.mitreTactic}/${i.mitreTechnique}, risk: ${i.riskScore}`
    )
    .join('\n')

  const topImpact = BUSINESS_IMPACT.slice(0, 4)
    .map((b) => `- ${b.asset} (${b.assetType}): $${b.financialLoss.toLocaleString()} loss, ${b.overall}`)
    .join('\n')

  const topMemory = CYBER_MEMORY.slice(0, 3)
    .map((m) => `- ${m.title}: ${m.lessonLearned.slice(0, 120)}`)
    .join('\n')

  const agents = AGENTS.map((a) => `- ${a.name}: ${a.status} — ${a.lastOutput.slice(0, 90)}`).join('\n')

  const criticalAssets = CRITICAL_ASSETS.filter((a) => a.status !== 'protected')
    .map((a) => `- ${a.name} (${a.type}): ${a.status}, exposure ${a.exposure}`)
    .join('\n')

  return `Current overall risk score: 72/100 (ELEVATED)
Active threats: 18 | Open incidents: 7 | Events/min: 4,180 | MTTR: 14 min
Agents online: ${AGENTS.length}/10 (all operational)

TOP INCIDENTS:
${topIncidents}

BUSINESS IMPACT (top assets):
${topImpact}

AT-RISK / COMPROMISED ASSETS:
${criticalAssets}

AGENT STATUS:
${agents}

CYBER MEMORY (relevant lessons):
${topMemory}`
}
