import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { CYBER_MEMORY } from '@/lib/cyber-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Merge static memory with any user-added memories from DB
  let dbMemory: any[] = []
  try {
    dbMemory = await db.cyberMemory.findMany({ orderBy: { createdAt: 'desc' } })
  } catch (e) {
    // DB optional
  }
  const staticMemory = CYBER_MEMORY.map((m) => ({
    id: m.id,
    category: m.category,
    title: m.title,
    summary: m.summary,
    mitreTactic: m.mitreTactic,
    severity: m.severity,
    lessonLearned: m.lessonLearned,
    prevention: m.prevention,
    date: m.date,
    source: 'archive',
  }))
  const dbMapped = dbMemory.map((m) => ({
    id: m.id,
    category: m.category,
    title: m.title,
    summary: m.summary,
    mitreTactic: m.mitreTactic,
    severity: m.severity,
    lessonLearned: m.details,
    prevention: m.prevention ?? '',
    date: new Date(m.createdAt).toISOString().slice(0, 10),
    source: 'live',
  }))

  const stats = {
    total: staticMemory.length + dbMapped.length,
    recalls24h: 23,
    reusedLessons: 9,
    byCategory: {
      incident: [...staticMemory, ...dbMapped].filter((m) => m.category === 'incident').length,
      response: [...staticMemory, ...dbMapped].filter((m) => m.category === 'response').length,
      failure: [...staticMemory, ...dbMapped].filter((m) => m.category === 'failure').length,
      recovery: [...staticMemory, ...dbMapped].filter((m) => m.category === 'recovery').length,
      lesson: [...staticMemory, ...dbMapped].filter((m) => m.category === 'lesson').length,
    },
  }

  return NextResponse.json({
    memories: [...dbMapped, ...staticMemory],
    stats,
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, summary, category, mitreTactic, severity, lessonLearned, prevention } = body
    if (!title || !summary || !category) {
      return NextResponse.json(
        { error: 'title, summary and category are required' },
        { status: 400 }
      )
    }
    const created = await db.cyberMemory.create({
      data: {
        title,
        summary,
        category,
        mitreTactic: mitreTactic ?? null,
        severity: severity ?? null,
        details: lessonLearned ?? '',
        prevention: prevention ?? '',
      },
    })
    return NextResponse.json({ success: true, memory: created })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
