import { NextResponse } from 'next/server'
import { llmChat } from '@/lib/llm'
import {
  PREDICTION_PATHS,
  BUSINESS_IMPACT,
  RESPONSE_PLAYBOOKS,
  CYBER_MEMORY,
  MITRE_TACTICS,
} from '@/lib/cyber-data'

export const dynamic = 'force-dynamic'
export const maxDuration = 90

const SYSTEM_PROMPT = `You are CyberMind AI's Deep Threat Analysis engine. You perform autonomous triage on a security event by coordinating the 10 specialized agents: Log Intelligence, Behavioral, Threat Intel, MITRE Mapping, Attack Prediction, Business Impact, Autonomous Response, Executive Copilot, Compliance, and Cyber Memory.

Given an event description, produce a structured, explainable analysis with these sections (use Markdown):
1. **Verdict** — one-line risk verdict with confidence %
2. **MITRE ATT&CK Chain** — the reconstructed/likely tactic → technique chain
3. **Attack Path Prediction** — the likely next 1-2 moves with probability
4. **Business Impact** — financial + operational estimate
5. **Recommended Autonomous Response** — concrete playbook actions
6. **Relevant Cyber Memory** — recall a plausible past lesson learned
7. **Compliance Flags** — any ISO 27001 / NIST / CIS implications

Be specific and grounded. Keep it tight and scannable. Do not pad.`

export async function POST(req: Request) {
  try {
    const { event } = await req.json()
    if (!event || typeof event !== 'string') {
      return NextResponse.json({ error: 'event is required' }, { status: 400 })
    }

    const context = `Live SOC data for grounding:
- Predicted paths: ${JSON.stringify(PREDICTION_PATHS.slice(0, 3))}
- Top business impact: ${JSON.stringify(BUSINESS_IMPACT.slice(0, 3))}
- Available playbooks: ${RESPONSE_PLAYBOOKS.map((p) => p.name).join(', ')}
- Cyber memory lessons: ${CYBER_MEMORY.slice(0, 3).map((m) => m.lessonLearned.slice(0, 100)).join(' | ')}
- MITRE tactics in scope: ${MITRE_TACTICS.map((t) => t.name).join(', ')}

Event to triage:
${event}`

    const analysis = await llmChat([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: context },
    ])

    return NextResponse.json({ analysis, event })
  } catch (e: any) {
    console.error('[agent-analyze] error', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
