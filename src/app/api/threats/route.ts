import { NextResponse } from 'next/server'
import {
  CVES,
  THREAT_ACTORS,
  IOCS,
  THREAT_MAP_ORIGINS,
} from '@/lib/cyber-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    cves: CVES,
    threatActors: THREAT_ACTORS,
    iocs: IOCS,
    origins: THREAT_MAP_ORIGINS,
    feedPulse: {
      feeds: 22,
      iocsTracked: 48210,
      matches24h: 19,
      newCves24h: 6,
      lastUpdate: new Date().toISOString(),
    },
  })
}
