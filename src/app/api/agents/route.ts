import { NextResponse } from 'next/server'
import { AGENTS, RESPONSE_PLAYBOOKS, PREDICTION_PATHS } from '@/lib/cyber-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    agents: AGENTS,
    playbooks: RESPONSE_PLAYBOOKS,
    predictions: PREDICTION_PATHS,
    orchestrationFlow: [
      { id: 'ingest', name: 'Log Intelligence', role: 'Ingest & normalize', status: 'active' },
      { id: 'behavior', name: 'Behavioral', role: 'Baseline & anomaly', status: 'active' },
      { id: 'intel', name: 'Threat Intel', role: 'Correlate IOC/CVE', status: 'active' },
      { id: 'mitre', name: 'MITRE Mapping', role: 'Map to ATT&CK', status: 'active' },
      { id: 'predict', name: 'Attack Prediction', role: 'Forecast next move', status: 'alert' },
      { id: 'impact', name: 'Business Impact', role: 'Financial + ops risk', status: 'active' },
      { id: 'risk', name: 'Risk Engine', role: 'Aggregate risk score', status: 'active' },
      { id: 'respond', name: 'Autonomous Response', role: 'Stage playbooks', status: 'alert' },
      { id: 'brief', name: 'Executive Copilot', role: 'Business narrative', status: 'active' },
      { id: 'learn', name: 'Cyber Memory', role: 'Recall + learn', status: 'thinking' },
    ],
  })
}
