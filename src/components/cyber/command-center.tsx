'use client'

import { useEffect, useState } from 'react'
import {
  Activity,
  ShieldAlert,
  Zap,
  Timer,
  FolderOpen,
  Server,
  DollarSign,
  Globe2,
  Radar,
  TrendingUp,
} from 'lucide-react'
import { MiniAreaChart, MiniBarChart } from './charts'
import { Panel, RiskGauge, SeverityBadge, StatusDot, timeAgo } from './shared'
import { useThreatStream } from '@/hooks/use-threat-stream'
import { SEVERITY_COLORS } from '@/lib/cyber-data'
import { cn } from '@/lib/utils'

interface DashboardData {
  riskScore: number
  activeThreats: number
  eventsPerMin: number
  blockedAttacks: number
  mttrMinutes: number
  openIncidents: number
  criticalAssets: number
  atRiskAssets: number
  totalExposure: number
  stagedPlaybooks: number
  threatMapOrigins: { country: string; code: string; lat: number; lon: number; count: number; severity: string }[]
  eventsTrend: { hour: string; events: number; threats: number }[]
  riskTrend7d: { day: string; risk: number }[]
  attackTypeBreakdown: { name: string; value: number }[]
  incidentsBySeverity: Record<string, number>
}

export default function CommandCenter({ stream }: { stream: ReturnType<typeof useThreatStream> }) {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  // Prefer live metrics when available
  const riskScore = stream.metrics?.riskScore ?? data?.riskScore ?? 72
  const activeThreats = stream.metrics?.activeThreats ?? data?.activeThreats ?? 18
  const eventsPerMin = stream.metrics?.eventsPerMin ?? data?.eventsPerMin ?? 4180
  const mttr = stream.metrics?.mttrMinutes ?? data?.mttrMinutes ?? 14

  return (
    <div className="space-y-4">
      {/* Top row: risk gauge + KPIs */}
      <div className="grid gap-4 lg:grid-cols-12">
        <Panel
          title="Organizational Risk Score"
          subtitle="Aggregated by Risk Engine agent"
          icon={<ShieldAlert className="h-4 w-4" />}
          className="lg:col-span-3"
          bodyClassName="flex flex-col items-center justify-center py-6"
        >
          <RiskGauge value={riskScore} size={170} />
          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-400">
            <TrendingUp className="h-3.5 w-3.5" />
            Trending up · 7-day
          </div>
        </Panel>

        <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <KpiCard icon={<Zap />} label="Active Threats" value={activeThreats} accent="text-red-400" sub="real-time" />
          <KpiCard icon={<Activity />} label="Events / min" value={eventsPerMin.toLocaleString()} accent="text-cyan-400" sub="14 sources" />
          <KpiCard icon={<ShieldAlert />} label="Blocked (24h)" value={(data?.blockedAttacks ?? 1247).toLocaleString()} accent="text-emerald-400" sub="auto-contained" />
          <KpiCard icon={<Timer />} label="MTTR" value={`${mttr}m`} accent="text-amber-400" sub="↓ 38% vs Q4" />
          <KpiCard icon={<FolderOpen />} label="Open Incidents" value={data?.openIncidents ?? 7} accent="text-orange-400" sub="2 critical" />
          <KpiCard icon={<Server />} label="Critical Assets" value={data?.criticalAssets ?? 3} accent="text-red-400" sub={`${data?.atRiskAssets ?? 6} at-risk`} />
          <KpiCard icon={<DollarSign />} label="Exposure" value={`$${((data?.totalExposure ?? 4035000) / 1e6).toFixed(1)}M`} accent="text-red-400" sub="24h estimate" />
          <KpiCard icon={<Radar />} label="Staged Playbooks" value={data?.stagedPlaybooks ?? 2} accent="text-amber-400" sub="awaiting approve" />
        </div>
      </div>

      {/* Events trend + attack types */}
      <div className="grid gap-4 lg:grid-cols-12">
        <Panel
          title="Security Event Volume — 24h"
          subtitle="Log Intelligence agent · correlated events"
          icon={<Activity className="h-4 w-4" />}
          className="lg:col-span-8"
          bodyClassName="h-64"
        >
          <MiniAreaChart
            data={(data?.eventsTrend ?? []).map((d) => ({ ...d, _x: d.hour }))}
            series={[
              { key: 'events', color: '#06b6d4', gradientId: 'evGrad' },
              { key: 'threats', color: '#ef4444', gradientId: 'thGrad' },
            ]}
            height={256}
          />
        </Panel>

        <Panel
          title="Attack Type Breakdown"
          subtitle="24h detections"
          icon={<Radar className="h-4 w-4" />}
          className="lg:col-span-4"
          bodyClassName="h-64"
        >
          <MiniBarChart
            data={data?.attackTypeBreakdown ?? []}
            dataKey="value"
            nameKey="name"
            horizontal
            height={256}
            colors={['#ef4444', '#f97316', '#f59e0b', '#06b6d4', '#10b981', '#a855f7']}
          />
        </Panel>
      </div>

      {/* Threat map + live feed */}
      <div className="grid gap-4 lg:grid-cols-12">
        <Panel
          title="Global Threat Origins"
          subtitle="Attacks by source country · 24h"
          icon={<Globe2 className="h-4 w-4" />}
          className="lg:col-span-7"
          bodyClassName="p-2"
        >
          <ThreatMap origins={data?.threatMapOrigins ?? []} />
        </Panel>

        <Panel
          title="Live Threat Stream"
          subtitle={stream.connected ? 'WebSocket · port 3003' : 'reconnecting…'}
          icon={<Activity className="h-4 w-4" />}
          className="lg:col-span-5"
          bodyClassName="p-0"
          action={
            <span className={cn('flex items-center gap-1.5 text-[10px] font-semibold', stream.connected ? 'text-emerald-400' : 'text-red-400')}>
              <span className={cn('h-1.5 w-1.5 rounded-full', stream.connected ? 'bg-emerald-400 threat-pulse' : 'bg-red-400')} />
              {stream.connected ? 'LIVE' : 'OFFLINE'}
            </span>
          }
        >
          <div className="max-h-[22rem] overflow-y-auto cyber-scroll divide-y divide-border">
            {stream.threats.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground">Awaiting first threat event…</div>
            )}
            {stream.threats.map((t) => (
              <div key={t.id} className="flex items-start gap-3 px-4 py-2.5 hover:bg-accent/40">
                <StatusDot status={t.severity === 'critical' ? 'critical' : t.severity === 'high' ? 'compromised' : 'alert'} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={t.severity} />
                    <span className="font-mono text-xs text-muted-foreground">{t.sourceCountry}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">{timeAgo(t.timestamp)}</span>
                  </div>
                  <div className="mt-0.5 truncate text-sm">{t.description}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="font-mono">{t.sourceIp}</span>
                    <span>→</span>
                    <span className="font-mono text-emerald-400">{t.targetAsset}</span>
                    <span>·</span>
                    <span className="font-mono text-cyan-400">{t.mitreTechnique}</span>
                    <span>·</span>
                    <span>risk {t.riskScore}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  accent?: string
}) {
  return (
    <Panel className="p-0" bodyClassName="p-3.5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className={cn('mt-1 font-mono text-2xl font-bold tabular-nums', accent)}>{value}</div>
          {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
        </div>
        <div className={cn('rounded-md bg-accent/60 p-1.5', accent)}>{icon}</div>
      </div>
    </Panel>
  )
}

function ThreatMap({ origins }: { origins: { country: string; code: string; count: number; severity: string }[] }) {
  // Equirectangular projection of lon/lat → x/y on an SVG world canvas
  const W = 640
  const H = 280
  const project = (lon: number, lat: number) => ({
    x: ((lon + 180) / 360) * W,
    y: ((90 - lat) / 180) * H,
  })
  const hub = { lat: 38, lon: -97 } // target hub (US CNI)
  const hubPos = project(hub.lon, hub.lat)

  return (
    <div className="relative w-full overflow-hidden rounded-md border border-border bg-background/40">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ background: 'oklch(0.13 0.02 260)' }}>
        {/* grid */}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} x1={(i * W) / 8} y1={0} x2={(i * W) / 8} y2={H} stroke="oklch(1 0 0 / 0.04)" />
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={(i * H) / 4} x2={W} y2={(i * H) / 4} stroke="oklch(1 0 0 / 0.04)" />
        ))}

        {/* attack arcs */}
        {origins.map((o, i) => {
          const pos = project(
            o.lon,
            o.lat
          )
          const mx = (pos.x + hubPos.x) / 2
          const my = Math.min(pos.y, hubPos.y) - 40 - (o.count % 40)
          const color = SEVERITY_COLORS[o.severity as keyof typeof SEVERITY_COLORS] ?? '#10b981'
          return (
            <g key={o.code}>
              <path
                d={`M ${pos.x} ${pos.y} Q ${mx} ${my} ${hubPos.x} ${hubPos.y}`}
                fill="none"
                stroke={color}
                strokeWidth={Math.max(1, Math.log(o.count) / 2)}
                strokeOpacity={0.5}
              />
              <circle cx={pos.x} cy={pos.y} r={Math.max(2.5, Math.log(o.count))} fill={color}>
                <animate attributeName="r" values={`${Math.max(2.5, Math.log(o.count))};${Math.max(5, Math.log(o.count) * 1.8)};${Math.max(2.5, Math.log(o.count))}`} dur="2s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.3;1" dur="2s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
              </circle>
              <text x={pos.x + 6} y={pos.y - 4} fill={color} fontSize="9" className="font-mono">
                {o.code}
              </text>
            </g>
          )
        })}

        {/* hub */}
        <circle cx={hubPos.x} cy={hubPos.y} r={5} fill="#10b981" />
        <circle cx={hubPos.x} cy={hubPos.y} r={10} fill="none" stroke="#10b981" strokeWidth="1" opacity={0.5}>
          <animate attributeName="r" values="10;22;10" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <text x={hubPos.x + 8} y={hubPos.y + 3} fill="#10b981" fontSize="10" className="font-mono">CNI HUB</text>
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1 px-3 py-2 text-[10px]">
        {origins.slice(0, 6).map((o) => (
          <span key={o.code} className="flex items-center gap-1 font-mono">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: SEVERITY_COLORS[o.severity as keyof typeof SEVERITY_COLORS] }} />
            {o.code} · {o.count}
          </span>
        ))}
      </div>
    </div>
  )
}
