'use client'

import { useEffect, useState } from 'react'
import {
  Database,
  AlertOctagon,
  Shield,
  XCircle,
  RotateCcw,
  Lightbulb,
  Plus,
  Brain,
} from 'lucide-react'
import { Panel, SeverityBadge } from './shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const CATEGORY_META: Record<string, { icon: typeof AlertOctagon; color: string; label: string }> = {
  incident: { icon: AlertOctagon, color: 'text-red-400', label: 'Incident' },
  response: { icon: Shield, color: 'text-emerald-400', label: 'Response' },
  failure: { icon: XCircle, color: 'text-orange-400', label: 'Failure' },
  recovery: { icon: RotateCcw, color: 'text-cyan-400', label: 'Recovery' },
  lesson: { icon: Lightbulb, color: 'text-amber-400', label: 'Lesson' },
}

interface MemoryEntry {
  id: string
  category: string
  title: string
  summary: string
  mitreTactic?: string
  severity?: string
  lessonLearned: string
  prevention: string
  date: string
  source: string
}

export default function CyberMemory() {
  const [memories, setMemories] = useState<MemoryEntry[]>([])
  const [stats, setStats] = useState<any>(null)
  const [filter, setFilter] = useState<string>('all')
  const [addOpen, setAddOpen] = useState(false)
  const { toast } = useToast()

  const load = () => {
    fetch('/api/cyber-memory')
      .then((r) => r.json())
      .then((d) => {
        setMemories(d.memories)
        setStats(d.stats)
      })
      .catch(() => {})
  }
  useEffect(load, [])

  const filtered = memories.filter((m) => filter === 'all' || m.category === filter)

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Database />} label="Total Memories" value={stats?.total ?? memories.length} accent="text-emerald-400" />
        <StatCard icon={<Brain />} label="Recalls (24h)" value={stats?.recalls24h ?? 23} accent="text-cyan-400" />
        <StatCard icon={<Lightbulb />} label="Reused Lessons" value={stats?.reusedLessons ?? 9} accent="text-amber-400" />
        <StatCard icon={<RotateCcw />} label="MTTR Improvement" value="↓ 38%" accent="text-emerald-400" />
      </div>

      {/* Intro banner */}
      <Panel bodyClassName="p-4" className="border-emerald-500/30 bg-emerald-500/5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-500/15 text-emerald-400">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-emerald-300">Organizational Cyber Memory — the differentiator</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              CyberMind AI remembers every incident, response, failure, recovery and lesson learned. Future incidents
              benefit from past organizational experience — turning one-time detections into compounding resilience.
            </p>
          </div>
        </div>
      </Panel>

      {/* Filter + add */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          <FilterChip label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
          {Object.entries(CATEGORY_META).map(([k, m]) => (
            <FilterChip key={k} label={m.label} active={filter === k} onClick={() => setFilter(k)} color={m.color} />
          ))}
        </div>
        <AddMemoryDialog open={addOpen} onOpenChange={setAddOpen} onAdded={load} />
      </div>

      {/* Memory entries */}
      <div className="grid gap-3 lg:grid-cols-2">
        {filtered.map((m) => {
          const meta = CATEGORY_META[m.category] ?? CATEGORY_META.lesson
          const Icon = meta.icon
          return (
            <Panel key={m.id} className="p-0" bodyClassName="p-4">
              <div className="flex items-start gap-3">
                <div className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/60', meta.color)}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-bold uppercase', `bg-accent/60 ${meta.color}`)}>
                      {meta.label}
                    </span>
                    {m.severity && <SeverityBadge severity={m.severity as any} />}
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground">{m.date}</span>
                    {m.source === 'live' && (
                      <span className="rounded bg-emerald-500/15 px-1 text-[9px] font-bold text-emerald-400">LIVE</span>
                    )}
                  </div>
                  <h4 className="mt-1 text-sm font-semibold leading-tight">{m.title}</h4>
                </div>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">{m.summary}</p>
              {m.mitreTactic && (
                <div className="mt-1.5 font-mono text-[10px] text-cyan-400">MITRE · {m.mitreTactic}</div>
              )}

              <div className="mt-3 space-y-2">
                <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                    <Lightbulb className="h-3 w-3" /> Lesson Learned
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-foreground/90">{m.lessonLearned}</p>
                </div>
                <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                    <Shield className="h-3 w-3" /> Prevention Applied
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-foreground/90">{m.prevention}</p>
                </div>
              </div>
            </Panel>
          )
        })}
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  accent?: string
}) {
  return (
    <Panel className="p-0" bodyClassName="p-3.5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className={cn('mt-1 font-mono text-2xl font-bold tabular-nums', accent)}>{value}</div>
        </div>
        <div className={cn('rounded-md bg-accent/60 p-1.5', accent)}>{icon}</div>
      </div>
    </Panel>
  )
}

function FilterChip({
  label,
  active,
  onClick,
  color,
}: {
  label: string
  active: boolean
  onClick: () => void
  color?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
          : 'border-border bg-accent/30 text-muted-foreground hover:text-foreground',
        !active && color
      )}
    >
      {label}
    </button>
  )
}

function AddMemoryDialog({
  open,
  onOpenChange,
  onAdded,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onAdded: () => void
}) {
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [category, setCategory] = useState('lesson')
  const [lesson, setLesson] = useState('')
  const [prevention, setPrevention] = useState('')
  const [mitre, setMitre] = useState('')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const submit = async () => {
    if (!title.trim() || !summary.trim()) {
      toast({ title: 'Title and summary required', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/cyber-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          summary,
          category,
          mitreTactic: mitre || null,
          severity: 'medium',
          lessonLearned: lesson,
          prevention,
        }),
      })
      if (res.ok) {
        toast({ title: 'Memory recorded', description: 'Future incidents will recall this lesson.' })
        setTitle('')
        setSummary('')
        setLesson('')
        setPrevention('')
        setMitre('')
        onOpenChange(false)
        onAdded()
      } else {
        toast({ title: 'Save failed', variant: 'destructive' })
      }
    } catch (e) {
      toast({ title: 'Save failed', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-emerald-500/90 text-sidebar hover:bg-emerald-500">
          <Plus className="h-4 w-4" /> Record Memory
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Organizational Memory</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Incident — cloud key exfil attempt" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Summary</label>
            <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="What happened?" className="min-h-16" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_META).map(([k, m]) => (
                    <SelectItem key={k} value={k}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">MITRE Tactic (optional)</label>
              <Input value={mitre} onChange={(e) => setMitre(e.target.value)} placeholder="e.g. Exfiltration" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Lesson Learned</label>
            <Textarea value={lesson} onChange={(e) => setLesson(e.target.value)} placeholder="What should the org remember?" className="min-h-16" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Prevention Applied</label>
            <Textarea value={prevention} onChange={(e) => setPrevention(e.target.value)} placeholder="What was done / should be done?" className="min-h-16" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving} className="bg-emerald-500/90 text-sidebar hover:bg-emerald-500">
            {saving ? 'Recording…' : 'Record Memory'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
