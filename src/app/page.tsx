'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  LayoutDashboard,
  Bot,
  Radar,
  Network,
  Crosshair,
  ClipboardList,
  Briefcase,
  Database,
  ClipboardCheck,
  ShieldCheck,
  Activity,
  Wifi,
  WifiOff,
  AlertTriangle,
} from 'lucide-react'
import { useThreatStream } from '@/hooks/use-threat-stream'
import { cn } from '@/lib/utils'

// Command Center is imported directly (default section) so it pre-compiles
// with the shell during the initial GET / — avoiding a second compile spike
// when the browser hydrates and requests the chunk.
import CommandCenter from '@/components/cyber/command-center'
// Other sections lazy-load one at a time (memory-safe).
const AiAgents = dynamic(() => import('@/components/cyber/ai-agents'), { ssr: false })
const ThreatIntel = dynamic(() => import('@/components/cyber/threat-intel'), { ssr: false })
const AttackGraph = dynamic(() => import('@/components/cyber/attack-graph'), { ssr: false })
const MitreMatrix = dynamic(() => import('@/components/cyber/mitre-matrix'), { ssr: false })
const Incidents = dynamic(() => import('@/components/cyber/incidents'), { ssr: false })
const ExecutiveCopilot = dynamic(() => import('@/components/cyber/executive-copilot'), { ssr: false })
const CyberMemory = dynamic(() => import('@/components/cyber/cyber-memory'), { ssr: false })
const Compliance = dynamic(() => import('@/components/cyber/compliance'), { ssr: false })
const RealTimeDashboard = dynamic(() => import('@/components/cyber/real-time-dashboard'), { ssr: false })
const LiveTerminal = dynamic(() => import('@/components/cyber/live-terminal'), { ssr: false })
const NetworkTrafficMonitor = dynamic(() => import('@/components/cyber/network-traffic-monitor'), { ssr: false })

type SectionId =
  | 'command'
  | 'agents'
  | 'threats'
  | 'graph'
  | 'mitre'
  | 'incidents'
  | 'copilot'
  | 'memory'
  | 'compliance'
  | 'realtime'
  | 'terminal'
  | 'network'

const NAV: { id: SectionId; label: string; icon: typeof LayoutDashboard; hint: string }[] = [
  { id: 'command', label: 'Command Center', icon: LayoutDashboard, hint: 'Live SOC overview' },
  { id: 'realtime', label: 'Real-Time Dashboard', icon: Activity, hint: 'Live metrics & alerts' },
  { id: 'terminal', label: 'Live Terminal', icon: Activity, hint: 'Command console' },
  { id: 'network', label: 'Network Monitor', icon: Network, hint: 'Traffic analysis' },
  { id: 'agents', label: 'AI Agents', icon: Bot, hint: '10-agent orchestration' },
  { id: 'threats', label: 'Threat Intel', icon: Radar, hint: 'CVEs · Actors · IOCs' },
  { id: 'graph', label: 'Attack Graph', icon: Network, hint: 'Path & prediction' },
  { id: 'mitre', label: 'MITRE ATT&CK', icon: Crosshair, hint: 'Tactic mapping' },
  { id: 'incidents', label: 'Incidents', icon: ClipboardList, hint: 'Lifecycle manager' },
  { id: 'copilot', label: 'Executive Copilot', icon: Briefcase, hint: 'AI risk briefing' },
  { id: 'memory', label: 'Cyber Memory', icon: Database, hint: 'Org learning' },
  { id: 'compliance', label: 'Compliance', icon: ClipboardCheck, hint: 'ISO · NIST · CIS' },
]

export default function Home() {
  const [section, setSection] = useState<SectionId>('command')
  const [clock, setClock] = useState('')
  const stream = useThreatStream()

  useEffect(() => {
    const tick = () =>
      setClock(new Date().toLocaleTimeString('en-US', { hour12: false }))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  const riskColor = useMemo(() => {
    const r = stream.metrics?.riskScore ?? 72
    if (r >= 80) return 'text-red-400'
    if (r >= 65) return 'text-orange-400'
    if (r >= 45) return 'text-amber-400'
    return 'text-emerald-400'
  }, [stream.metrics?.riskScore])

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground cyber-grid">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/80">
        <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 text-sidebar glow-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="font-mono text-sm font-bold tracking-tight">
                CyberMind<span className="text-emerald-400"> AI</span>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                AICDOS · Autonomous Defense
              </div>
            </div>
          </div>

          <div className="hidden md:block h-8 w-px bg-border" />

          {/* Live KPIs */}
          <div className="hidden md:flex items-center gap-5 text-sm">
            <Kpi
              label="Risk Score"
              value={stream.metrics?.riskScore?.toString() ?? '72'}
              valueClass={riskColor}
              icon={<Activity className="h-3.5 w-3.5" />}
            />
            <Kpi
              label="Active Threats"
              value={stream.metrics?.activeThreats?.toString() ?? '18'}
              valueClass="text-red-400"
            />
            <Kpi
              label="Events/min"
              value={stream.metrics?.eventsPerMin?.toLocaleString() ?? '4,180'}
            />
            <Kpi
              label="Agents"
              value={`${stream.metrics?.agentsOnline ?? 10}/10`}
              valueClass="text-emerald-400"
            />
            <Kpi
              label="MTTR"
              value={`${stream.metrics?.mttrMinutes ?? 14}m`}
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                stream.connected
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : 'border-red-500/40 bg-red-500/10 text-red-400'
              )}
            >
              {stream.connected ? (
                <Wifi className="h-3 w-3' h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              {stream.connected ? 'STREAM LIVE' : 'STREAM OFFLINE'}
            </div>
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">
              <AlertTriangle className="h-3 w-3" />
              DEFCON 3
            </div>
            <div className="font-mono text-xs text-muted-foreground tabular-nums">{clock}</div>
          </div>
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex flex-1 min-h-0">
        <Sidebar section={section} onChange={setSection} />
        <main className="flex-1 min-w-0 overflow-y-auto cyber-scroll">
          <div className="p-4 lg:p-6">
            <SectionHeader section={section} />
            {section === 'command' && <CommandCenter stream={stream} />}
            {section === 'realtime' && <RealTimeDashboard />}
            {section === 'terminal' && <LiveTerminal />}
            {section === 'network' && <NetworkTrafficMonitor />}
            {section === 'agents' && <AiAgents stream={stream} />}
            {section === 'threats' && <ThreatIntel />}
            {section === 'graph' && <AttackGraph />}
            {section === 'mitre' && <MitreMatrix />}
            {section === 'incidents' && <Incidents />}
            {section === 'copilot' && <ExecutiveCopilot />}
            {section === 'memory' && <CyberMemory />}
            {section === 'compliance' && <Compliance />}
          </div>
        </main>
      </div>

      {/* Footer (sticky bottom) */}
      <footer className="mt-auto border-t border-border bg-sidebar/60 px-4 py-2.5 text-[11px] text-muted-foreground">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-mono">CyberMind AI · AICDOS</span>
            <span className="hidden sm:inline">— From Detection → Prediction → Prevention → Autonomous Response → Organizational Learning</span>
          </div>
          <div className="flex items-center gap-3 font-mono">
            <span>SIEM ✓</span>
            <span>EDR ✓</span>
            <span>OT ✓</span>
            <span>Cloud ✓</span>
            <span className="hidden sm:inline">Classified · CNI Protection</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Kpi({
  label,
  value,
  valueClass,
  icon,
}: {
  label: string
  value: string
  valueClass?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex flex-col leading-tight">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className={cn('font-mono text-base font-bold tabular-nums', valueClass)}>
        {icon}
        {value}
      </span>
    </div>
  )
}

function Sidebar({
  section,
  onChange,
}: {
  section: SectionId
  onChange: (s: SectionId) => void
}) {
  return (
    <nav className="sticky top-16 hidden md:flex h-[calc(100vh-4rem-49px)] w-56 shrink-0 flex-col border-r border-border bg-sidebar/40 p-3">
      <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Defense Modules
      </div>
      <div className="flex flex-col gap-1 overflow-y-auto cyber-scroll">
        {NAV.map((item) => {
          const Icon = item.icon
          const active = section === item.id
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={cn(
                'group flex items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                active
                  ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', active && 'text-emerald-400')} />
              <span className="leading-tight">
                <span className="block text-sm font-medium">{item.label}</span>
                <span className="block text-[10px] text-muted-foreground">{item.hint}</span>
              </span>
            </button>
          )
        })}
      </div>
      <div className="mt-auto rounded-lg border border-border bg-card/50 p-3 text-[11px]">
        <div className="mb-1 flex items-center gap-1.5 font-semibold text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 threat-pulse" />
          AUTONOMOUS MODE
        </div>
        <p className="text-muted-foreground leading-snug">
          Response playbooks stage in <span className="text-amber-400">Simulate</span>. Promote to
          Auto-Execute when risk ≥ 0.85 confidence.
        </p>
      </div>
    </nav>
  )
}

function SectionHeader({ section }: { section: SectionId }) {
  const item = NAV.find((n) => n.id === section)!
  const Icon = item.icon
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h1 className="text-xl font-bold tracking-tight">{item.label}</h1>
        <p className="text-sm text-muted-foreground">{item.hint}</p>
      </div>
    </div>
  )
}
