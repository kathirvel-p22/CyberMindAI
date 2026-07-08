import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await req.json()
    const allowed = ['status', 'severity', 'assignedTo', 'response', 'riskScore']
    const data: Record<string, unknown> = {}
    for (const k of allowed) {
      if (body[k] !== undefined) data[k] = body[k]
    }
    const updated = await db.incident.update({ where: { id }, data })
    return NextResponse.json({ success: true, incident: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await db.incident.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
