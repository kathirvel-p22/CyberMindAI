import { NextResponse } from 'next/server'
import { MITRE_TACTICS, CVES, THREAT_ACTORS, IOCS } from '@/lib/cyber-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const techniqueCount = MITRE_TACTICS.reduce(
    (s, t) => s + t.techniques.reduce((ts, tech) => ts + tech.count, 0),
    0
  )
  const coverage = Math.min(98, Math.round((MITRE_TACTICS.length / 14) * 100))

  return NextResponse.json({
    tactics: MITRE_TACTICS,
    totalDetections: techniqueCount,
    coverage,
    cves: CVES,
    threatActors: THREAT_ACTORS,
    iocs: IOCS,
  })
}
