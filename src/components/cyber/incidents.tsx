'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  ClipboardList,
  Plus,
  Trash2,
  Shield,
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
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

const STATUS_META: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  open: { icon: Clock, color: 'text-orange-400', label: 'Open' },
  investigating: { icon: Activity, color: 'text-cyan-400', label: 'Investigating' },
  contained: { icon: Shield, color: 'text-amber-400', label: 'Contained' },
  resolved: { icon: CheckCircle2, color: 'text-emerald-400', label: 'Resolved' },
  closed: { icon: XCircle, color: 'text-slate-400', label: 'Closed' },
}

const STATUSES = ['open', 'investigating', 'contained', 'resolved', 'closed']
const SEVERITIES = ['critical', 'high', 'medium', 'low']

interface Incident {
  id: string
  title: string
  description: string
  severity: string
  status: string
  source: string
  mitreTactic: string | null
  mitreTechnique: string | null
  assetAffected: string | null
  attackerIp: string | null
  riskScore: number
  assignedTo: string | null
  response: string | null
  createdAt: string
  updatedAt: string
}

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/incidents')
      const data = await res.json()
      setIncidents(data.incidents)
    } catch (e) {
      toast({ title: 'Failed to load incidents', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    load()
  }, [load])

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)))
      toast({ title: `Incident moved to ${status}`, description: 'Lifecycle updated' })
    } catch (e) {
      toast({ title: 'Update failed', variant: 'destructive' })
    }
  }

  const addResponse = async (id: string, response: string) => {
    try {
      await fetch(`/api/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response }),
      })
      setIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, response } : i)))
      toast({ title: 'Response note saved' })
    } catch (e) {
      toast({ title: 'Save failed', variant: 'destructive' })
    }
  }

  const deleteIncident = async (id: string) => {
    try {
      await fetch(`/api/incidents/${id}`, { method: 'DELETE' })
      setIncidents((prev) => prev.filter((i) => i.id !== id))
      toast({ title: 'Incident closed & removed' })
    } catch (e) {
      toast({ title: 'Delete failed', variant: 'destructive' })
    }
  }

  const filtered = incidents.filter((i) => filter === 'all' || i.status === filter)

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = incidents.filter((i) => i.status === s).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-4">
      {/* Lifecycle pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STATUSES.map((s) => {
          const meta = STATUS_META[s]
          const Icon = meta.icon
          return (
            <button
              key={s}
              onClick={() => setFilter(filter === s ? 'all' : s)}
              className={cn(
                'text-left rounded-lg border bg-card/60 p-3 transition-colors',
                filter === s ? 'border-emerald-500/40 ring-1 ring-emerald-500/20' : 'border-border hover:border-emerald-500/30'
              )}
            >
              <div className="flex items-center gap-2">
                <Icon className={cn('h-4 w-4', meta.color)} />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{meta.label}</span>
              </div>
              <div className={cn('mt-1 font-mono text-2xl font-bold', meta.color)}>{counts[s] ?? 0}</div>
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          {filter === 'all' ? 'All incidents' : `Filtered: ${filter}`}
          <span className="text-foreground">· {filtered.length} shown</span>
        </div>
        <CreateIncidentDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={load}
        />
      </div>

      {/* Incident list */}
      <Panel
        title="Incident Manager"
        subtitle="Full lifecycle · open → investigating → contained → resolved → closed"
        icon={<ClipboardList className="h-4 w-4" />}
        bodyClassName="p-0"
      >
        {loading ? (
          <div className="p-6 text-center text-sm text-muted-foreground">Loading incidents…</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((inc) => (
              <IncidentRow
                key={inc.id}
                incident={inc}
                expanded={expanded === inc.id}
                onToggle={() => setExpanded(expanded === inc.id ? null : inc.id)}
                onStatusChange={(s) => updateStatus(inc.id, s)}
                onResponse={(r) => addResponse(inc.id, r)}
                onDelete={() => deleteIncident(inc.id)}
              />
            ))}
            {filtered.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">No incidents in this state.</div>
            )}
          </div>
        )}
      </Panel>
    </div>
  )
}

function IncidentRow({
  incident,
  expanded,
  onToggle,
  onStatusChange,
  onResponse,
  onDelete,
}: {
  incident: Incident
  expanded: boolean
  onToggle: () => void
  onStatusChange: (s: string) => void
  onResponse: (r: string) => void
  onDelete: () => void
}) {
  const meta = STATUS_META[incident.status] ?? STATUS_META.open
  const Icon = meta.icon
  const [resp, setResp] = useState(incident.response ?? '')

  return (
    <div className="hover:bg-accent/20">
      <button onClick={onToggle} className="flex w-full items-start gap-3 px-4 py-3 text-left">
        <SeverityBadge severity={incident.severity as any} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold">{incident.title}</span>
            <span className={cn('flex items-center gap-1 text-[11px]', meta.color)}>
              <Icon className="h-3 w-3" />
              {meta.label}
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
            {incident.mitreTactic && <span className="font-mono text-cyan-400">{incident.mitreTactic}/{incident.mitreTechnique}</span>}
            {incident.assetAffected && <span>· {incident.assetAffected}</span>}
            {incident.attackerIp && incident.attackerIp !== 'unknown' && <span>· src {incident.attackerIp}</span>}
            <span>· assigned {incident.assignedTo ?? 'unassigned'}</span>
            <span>· {new Date(incident.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="text-right">
            <div className={cn('font-mono text-lg font-bold', incident.riskScore >= 85 ? 'text-red-400' : incident.riskScore >= 65 ? 'text-orange-400' : 'text-amber-400')}>
              {incident.riskScore}
            </div>
            <div className="text-[9px] uppercase text-muted-foreground">risk</div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border bg-background/30 px-4 py-3 space-y-3">
          <p className="text-sm text-foreground/80">{incident.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <Field label="Source" value={incident.source} />
            <Field label="Asset" value={incident.assetAffected ?? '—'} />
            <Field label="MITRE Tactic" value={incident.mitreTactic ?? '—'} />
            <Field label="Technique" value={incident.mitreTechnique ?? '—'} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Change status:</span>
            <Select value={incident.status} onValueChange={onStatusChange}>
              <SelectTrigger className="h-8 w-44 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" className="h-8 text-xs text-red-400 hover:text-red-300" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" /> Close & remove
            </Button>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Response / containment notes</label>
            <Textarea
              value={resp}
              onChange={(e) => setResp(e.target.value)}
              placeholder="Document the autonomous response actions taken…"
              className="min-h-20 text-xs"
            />
            <Button size="sm" className="mt-2 h-7 text-xs" onClick={() => onResponse(resp)}>
              Save response note
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-accent/40 p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono text-xs">{value}</div>
    </div>
  )
}

function CreateIncidentDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState('high')
  const [asset, setAsset] = useState('')
  const [mitre, setMitre] = useState('')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const submit = async () => {
    if (!title.trim()) {
      toast({ title: 'Title required', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          severity,
          status: 'open',
          source: 'manual',
          assetAffected: asset || null,
          mitreTactic: mitre || null,
          riskScore: severity === 'critical' ? 90 : severity === 'high' ? 70 : 50,
        }),
      })
      if (res.ok) {
        toast({ title: 'Incident created', description: title })
        setTitle('')
        setDescription('')
        setAsset('')
        setMitre('')
        onOpenChange(false)
        onCreated()
      } else {
        toast({ title: 'Create failed', variant: 'destructive' })
      }
    } catch (e) {
      toast({ title: 'Create failed', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-emerald-500/90 text-sidebar hover:bg-emerald-500">
          <Plus className="h-4 w-4" /> New Incident
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Create Security Incident</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Suspicious C2 beaconing from endpoint" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What happened, assets, indicators…" className="min-h-20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Severity</label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEVERITIES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">MITRE Tactic</label>
              <Input value={mitre} onChange={(e) => setMitre(e.target.value)} placeholder="e.g. Credential Access" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Affected Asset</label>
            <Input value={asset} onChange={(e) => setAsset(e.target.value)} placeholder="e.g. db-core-financial" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving} className="bg-emerald-500/90 text-sidebar hover:bg-emerald-500">
            {saving ? 'Creating…' : 'Create Incident'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
