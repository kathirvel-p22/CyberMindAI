import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SEED_INCIDENTS } from '@/lib/cyber-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    let count = await db.incident.count()
    if (count === 0) {
      await db.incident.createMany({ data: SEED_INCIDENTS as any })
      count = SEED_INCIDENTS.length
    }
    const incidents = await db.incident.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ incidents })
  } catch (e: any) {
    // Fallback to static seed if DB unavailable
    return NextResponse.json({
      incidents: SEED_INCIDENTS.map((i, idx) => ({
        id: `seed-${idx}`,
        ...i,
        response: null,
        createdAt: new Date(Date.now() - idx * 3600_000).toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      title,
      description,
      severity,
      status,
      source,
      mitreTactic,
      mitreTechnique,
      assetAffected,
      attackerIp,
      riskScore,
      assignedTo,
    } = body
    if (!title || !severity) {
      return NextResponse.json({ error: 'title and severity required' }, { status: 400 })
    }
    const created = await db.incident.create({
      data: {
        title,
        description: description ?? '',
        severity,
        status: status ?? 'open',
        source: source ?? 'manual',
        mitreTactic: mitreTactic ?? null,
        mitreTechnique: mitreTechnique ?? null,
        assetAffected: assetAffected ?? null,
        attackerIp: attackerIp ?? null,
        riskScore: riskScore ?? 50,
        assignedTo: assignedTo ?? null,
      },
    })
    return NextResponse.json({ success: true, incident: created })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
