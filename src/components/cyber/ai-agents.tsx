'use client'

import { useEffect, useState } from 'react'
import {
  ScrollText,
  Activity,
  Radar,
  Network,
  BrainCircuit,
  TrendingDown,
  ShieldCheck,
  Briefcase,
  ClipboardCheck,
  Database,
  ArrowRight,
  Workflow,
  Target,
  Zap,
} from 'lucide-react'
import { Panel, StatusDot } from './shared'
import { useThreatStream } from '@/hooks/use-threat-stream'
import { cn } from '@/lib/utils'

const ICONS: Record<string, typeof ScrollText> = {
  ScrollText,
  Activity,
  Radar,
  Network,
  BrainCircuit,
  TrendingDown,
  ShieldCheck,
  Briefcase,
  ClipboardCheck,
  Database,
}

interface AgentData {
  agents: any[]
  playbooks: any[]
  predictions: any[]
  orchestrationFlow: { id: string; name: string; role: string; status: string }[]
}

export default function AiAgents({ stream }: { stream: ReturnType<typeof useThreatStream> }) {
  const [data, setData] = useState<AgentData | null>(null)

  useEffect(() => {
    fetch('/api/agents')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      {/* Orchestration pipeline */}
      <Panel
        title="Multi-Agent Orchestration Pipeline"
        subtitle="LangGraph-style agent graph · telemetry → prediction → response → learning"
        icon={<Workflow className="h-4 w-4" />}
        bodyClassName="p-4"
      >
        <div className="flex flex-wrap items-stretch gap-2">
          {data?.orchestrationFlow?.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex min-w-[7.5rem] flex-col rounded-lg border p-2.5',
                  step.status === 'alert'
                    ? 'border-red-500/40 bg-red-500/10'
                    : step.status === 'thinking'
                    ? 'border-cyan-500/40 bg-cyan-500/10'
                    : 'border-emerald-500/30 bg-emerald-500/5'
                )}
              >
                <div className="flex items-center gap-1.5">
                  <StatusDot status={step.status} />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="mt-1 text-xs font-semibold leading-tight">{step.name}</div>
                <div className="text-[10px] text-muted-foreground leading-tight">{step.role}</div>
              </div>
              {i < (data?.orchestrationFlow?.length ?? 0) - 1 && (
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </Panel>

      {/* Agent cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {data?.agents?.map((a) => {
          const Icon = ICONS[a.icon] ?? ScrollText
          return (
            <Panel
              key={a.id}
              className="p-0"
              bodyClassName="p-4"
              action={
                <span
                  className={cn(
                    'flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase',
                    a.status === 'alert'
                      ? 'bg-red-500/15 text-red-400'
                      : a.status === 'thinking'
                      ? 'bg-cyan-500/15 text-cyan-400'
                      : 'bg-emerald-500/15 text-emerald-400'
                  )}
                >
                  <StatusDot status={a.status} />
                  {a.status}
                </span>
              }
            >
              <div className="flex items-start gap-3">
                <div
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                  style={{ background: `${a.color}1a`, color: a.color }}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold">{a.name}</h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{a.role}</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                {a.description}
              </p>

              {/* last output */}
              <div className="mt-3 rounded-md border border-border bg-background/50 p-2.5">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                    Latest Output
                  </span>
                  <span className="text-[10px] text-muted-foreground">{a.lastUpdate}</span>
                </div>
                <p className="text-[11px] leading-snug text-foreground/90 line-clamp-3">
                  {a.lastOutput}
                </p>
              </div>

              {/* metrics */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                {a.metrics?.map((m: any) => (
                  <div key={m.label} className="rounded-md bg-accent/40 p-1.5 text-center">
                    <div className="font-mono text-sm font-bold tabular-nums">{m.value}</div>
                    <div className="text-[9px] uppercase tracking-wide text-muted-foreground">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )
        })}
      </div>

      {/* Predictions + playbooks + live pulses */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Attack Path Predictions"
          subtitle="Attack Prediction agent · forecasted next moves"
          icon={<Target className="h-4 w-4" />}
        >
          <div className="space-y-2.5">
            {data?.predictions?.map((p) => (
              <div key={p.id} className="rounded-lg border border-border bg-background/40 p-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-red-400">{p.current}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-mono text-amber-400">{p.next}</span>
                  <span className="ml-auto rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-400">
                    {Math.round(p.probability * 100)}%
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="font-mono text-cyan-400">{p.technique}</span>
                  <span>·</span>
                  <span>ETA {p.timeframe}</span>
                </div>
                <p className="mt-1.5 text-[11px] leading-snug text-foreground/80">{p.rationale}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Autonomous Response Playbooks"
          subtitle="Staged containment actions"
          icon={<ShieldCheck className="h-4 w-4" />}
        >
          <div className="space-y-2.5">
            {data?.playbooks?.map((p) => (
              <div key={p.id} className="rounded-lg border border-border bg-background/40 p-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span className="font-mono text-xs font-semibold">{p.id}</span>
                  <span className="text-sm font-medium">{p.name}</span>
                  <span
                    className={cn(
                      'ml-auto rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',
                      p.status === 'staged'
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-emerald-500/15 text-emerald-400'
                    )}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  Trigger: <span className="font-mono text-cyan-400">{p.trigger}</span> · confidence{' '}
                  <span className="font-mono text-emerald-400">{Math.round(p.confidence * 100)}%</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.actions.map((a: string) => (
                    <span
                      key={a}
                      className="rounded border border-border bg-accent/40 px-1.5 py-0.5 text-[10px] text-foreground/80"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Live agent pulses */}
      <Panel
        title="Live Agent Activity"
        subtitle="Real-time agent reasoning pulses"
        icon={<Activity className="h-4 w-4" />}
        action={
          <span className={cn('flex items-center gap-1.5 text-[10px] font-semibold', stream.connected ? 'text-emerald-400' : 'text-red-400')}>
            <span className={cn('h-1.5 w-1.5 rounded-full', stream.connected ? 'bg-emerald-400 threat-pulse' : 'bg-red-400')} />
            {stream.connected ? 'LIVE' : 'OFFLINE'}
          </span>
        }
        bodyClassName="p-0"
      >
        <div className="max-h-72 overflow-y-auto cyber-scroll divide-y divide-border">
          {stream.pulses.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground">Awaiting agent activity…</div>
          )}
          {stream.pulses.map((p, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-2">
              <StatusDot status={p.event === 'mitigated' ? 'online' : p.event === 'flagged' ? 'alert' : 'thinking'} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono font-semibold text-emerald-400">{p.agent}</span>
                  <span className="rounded bg-accent/60 px-1 text-[10px] uppercase text-cyan-400">{p.event}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">
                    {new Date(p.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-foreground/80">{p.message}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
