import { NextResponse } from 'next/server'
import { COMPLIANCE, COMPLIANCE_SUMMARY } from '@/lib/cyber-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    controls: COMPLIANCE,
    summary: COMPLIANCE_SUMMARY,
    auditReady: true,
    lastAudit: '2026-01-30',
    nextAudit: '2026-04-30',
  })
}
