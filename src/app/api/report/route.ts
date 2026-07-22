import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { llmChat } from '@/lib/llm'
import {
  SEED_INCIDENTS,
  BUSINESS_IMPACT,
  CYBER_MEMORY,
  COMPLIANCE_SUMMARY,
  AGENTS,
} from '@/lib/cyber-data'

export const dynamic = 'force-dynamic'
export const maxDuration = 90

const SYSTEM_PROMPT = `You are CyberMind AI's Executive Report Generator. Produce a board-ready cyber risk briefing in clean Markdown.

Structure:
# Executive Cyber Risk Briefing — <date>

## Bottom Line
One paragraph: overall risk, trend, the single most important thing leadership must know.

## Risk Posture
- Overall risk score & trend
- Active threats / open incidents
- MTTR

## Top Incidents (table)
Markdown table: Incident | Severity | Status | Asset | MITRE | Risk

## Business Impact
Top assets by financial exposure.

## Autonomous Response Status
What playbooks are staged / executed.

## Organizational Learning
1-2 lessons recalled from cyber memory that shaped today's response.

## Compliance Posture
ISO 27001 / NIST / CIS summary.

## Recommendations (prioritized)
3-5 bullet actions for leadership.

Be specific and grounded in the provided data. No filler.`

export async function GET() {
  try {
    let incidents = SEED_INCIDENTS
    try {
      const dbInc = await db.incident.findMany({ orderBy: { createdAt: 'desc' }, take: 8 })
      if (dbInc.length) incidents = dbInc as any
    } catch (e) {
      // ignore
    }

    const context = `Date: ${new Date().toISOString().slice(0, 10)}
Overall risk score: 72 (ELEVATED, trending up)
Active threats: 18 | Open incidents: ${incidents.length} | MTTR: 14 min | Events/min: 4,180

INCIDENTS:
${incidents
  .map(
    (i: any) =>
      `- ${i.title} | ${i.severity} | ${i.status} | ${i.assetAffected} | ${i.mitreTactic}/${i.mitreTechnique} | ${i.riskScore}`
  )
  .join('\n')}

BUSINESS IMPACT:
${BUSINESS_IMPACT.slice(0, 6)
  .map((b) => `- ${b.asset} (${b.assetType}): $${b.financialLoss.toLocaleString()} | ${b.overall}`)
  .join('\n')}

CYBER MEMORY (recent lessons):
${CYBER_MEMORY.slice(0, 4)
  .map((m) => `- ${m.title}: ${m.lessonLearned.slice(0, 140)}`)
  .join('\n')}

COMPLIANCE:
${COMPLIANCE_SUMMARY
  .map(
    (c) =>
      `- ${c.framework}: ${c.compliant} compliant, ${c.partial} partial, ${c.nonCompliant} non-compliant`
  )
  .join('\n')}

AGENTS:
${AGENTS.map((a) => `- ${a.name}: ${a.status} — ${a.lastOutput.slice(0, 80)}`).join('\n')}
`

    const report = await llmChat([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: context },
    ])

    return NextResponse.json({ report, generatedAt: new Date().toISOString() })
  } catch (e: any) {
    console.error('[report] error', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
