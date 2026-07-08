import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  AGENTS,
  CRITICAL_ASSETS,
  BUSINESS_IMPACT,
  THREAT_MAP_ORIGINS,
  RESPONSE_PLAYBOOKS,
  SEED_INCIDENTS,
} from '@/lib/cyber-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Ensure incidents are seeded
  let incidentCount = 0
  try {
    incidentCount = await db.incident.count()
    if (incidentCount === 0) {
      await db.incident.createMany({ data: SEED_INCIDENTS as any })
      incidentCount = SEED_INCIDENTS.length
    }
  } catch (e) {
    // DB optional — fall through with static data
  }

  const openIncidents = Math.min(incidentCount, 20) || 7
  const criticalAssets = CRITICAL_ASSETS.filter((a) => a.criticality === 'critical').length
  const atRisk = CRITICAL_ASSETS.filter((a) => a.status !== 'protected').length
  const totalExposure = BUSINESS_IMPACT.reduce((s, b) => s + b.financialLoss, 0)
  const stagedPlaybooks = RESPONSE_PLAYBOOKS.filter((p) => p.status === 'staged').length

  const bySeverity = (sev: string) =>
    SEED_INCIDENTS.filter((i) => i.severity === sev).length

  return NextResponse.json({
    riskScore: 72,
    riskTrend: 'up',
    activeThreats: 18,
    eventsPerMin: 4180,
    blockedAttacks: 1247,
    agentsOnline: AGENTS.length,
    mttrMinutes: 14,
    openIncidents,
    criticalAssets,
    atRiskAssets: atRisk,
    totalExposure,
    stagedPlaybooks,
    threatMapOrigins: THREAT_MAP_ORIGINS,
    incidentsBySeverity: {
      critical: bySeverity('critical'),
      high: bySeverity('high'),
      medium: bySeverity('medium'),
      low: bySeverity('low'),
    },
    eventsTrend: generateEventsTrend(),
    riskTrend7d: generateRiskTrend(),
    attackTypeBreakdown: [
      { name: 'Brute Force', value: 412 },
      { name: 'Phishing', value: 318 },
      { name: 'Malware', value: 264 },
      { name: 'Lateral Move', value: 198 },
      { name: 'Recon', value: 356 },
      { name: 'Exfiltration', value: 47 },
    ],
    lastUpdated: new Date().toISOString(),
  })
}

function generateEventsTrend() {
  const hours = 24
  return Array.from({ length: hours }, (_, i) => ({
    hour: `${i}:00`,
    events: Math.floor(2000 + Math.random() * 6000 + Math.sin(i / 3) * 1500),
    threats: Math.floor(5 + Math.random() * 40 + Math.sin(i / 4) * 10),
  }))
}

function generateRiskTrend() {
  const days = 7
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return labels.map((d, i) => ({
    day: d,
    risk: Math.floor(55 + Math.random() * 35 + (i > 4 ? 8 : 0)),
  }))
}
