'use client'

import { useEffect, useState } from 'react'
import {
  Network,
  User,
  Monitor,
  Server,
  Cloud,
  Skull,
  Cog,
  Target,
  TrendingDown,
  ArrowRight,
} from 'lucide-react'
import { Panel, SeverityBadge, StatusDot } from './shared'
import { cn } from '@/lib/utils'

const TYPE_META: Record<string, { icon: typeof User; color: string }> = {
  user: { icon: User, color: '#a855f7' },
  device: { icon: Monitor, color: '#06b6d4' },
  server: { icon: Server, color: '#10b981' },
  cloud: { icon: Cloud, color: '#22d3ee' },
  threat: { icon: Skull, color: '#ef4444' },
  service: { icon: Cog, color: '#f59e0b' },
}

const STATUS_COLOR: Record<string, string> = {
  safe: '#10b981',
  protected: '#10b981',
  targeted: '#f97316',
  compromised: '#ef4444',
  critical: '#ef4444',
}

const EDGE_COLOR: Record<string, string> = {
  attack: '#ef4444',
  lateral: '#f97316',
  exfil: '#a855f7',
  access: '#06b6d4',
  trust: '#64748b',
}

interface GraphData {
  nodes: any[]
  edges: any[]
  predictions: any[]
  businessImpact: any[]
  criticalAssets: any[]
}

export default function AttackGraph() {
  const [data, setData] = useState<GraphData | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/attack-graph')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  const W = 820
  const H = 460

  const selectedNode = data?.nodes?.find((n) => n.id === selected)

  return (
    <div className="space-y-4">
      <Panel
        title="Cyber Digital Twin — Attack Knowledge Graph"
        subtitle="Relationships between users, devices, servers, cloud & active threats · click a node to inspect"
        icon={<Network className="h-4 w-4" />}
        bodyClassName="p-2"
        action={
          <div className="hidden sm:flex items-center gap-3 text-[10px]">
            {Object.entries(EDGE_COLOR).map(([k, c]) => (
              <span key={k} className="flex items-center gap-1">
                <span className="h-0.5 w-4 rounded" style={{ background: c }} />
                <span className="capitalize text-muted-foreground">{k}</span>
              </span>
            ))}
          </div>
        }
      >
        <div className="relative w-full overflow-auto rounded-md border border-border" style={{ background: 'oklch(0.12 0.02 260)' }}>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 640 }}>
            {/* grid */}
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="oklch(1 0 0 / 0.04)" strokeWidth="1" />
              </pattern>
              <marker id="arrow-attack" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#ef4444" />
              </marker>
              <marker id="arrow-lateral" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#f97316" />
              </marker>
              <marker id="arrow-exfil" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#a855f7" />
              </marker>
              <marker id="arrow-access" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#06b6d4" />
              </marker>
              <marker id="arrow-trust" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
              </marker>
            </defs>
            <rect width={W} height={H} fill="url(#grid)" />

            {/* edges */}
            {data?.edges?.map((e, i) => {
              const s = data.nodes.find((n) => n.id === e.source)
              const t = data.nodes.find((n) => n.id === e.target)
              if (!s || !t) return null
              const color = EDGE_COLOR[e.kind] ?? '#64748b'
              const mx = (s.x + t.x) / 2
              const my = (s.y + t.y) / 2 - 18
              const isAttack = e.kind === 'attack' || e.kind === 'lateral' || e.kind === 'exfil'
              return (
                <g key={i}>
                  <path
                    d={`M ${s.x} ${s.y} Q ${mx} ${my} ${t.x} ${t.y}`}
                    fill="none"
                    stroke={color}
                    strokeWidth={isAttack ? 2 : 1.5}
                    strokeOpacity={isAttack ? 0.8 : 0.45}
                    strokeDasharray={e.kind === 'trust' ? '4 3' : undefined}
                    markerEnd={`url(#arrow-${e.kind})`}
                  />
                  <text
                    x={mx}
                    y={my}
                    fill={color}
                    fontSize="9"
                    textAnchor="middle"
                    className="font-mono"
                    style={{ paintOrder: 'stroke', stroke: 'oklch(0.12 0.02 260)', strokeWidth: 3 }}
                  >
                    {e.label}
                  </text>
                </g>
              )
            })}

            {/* nodes */}
            {data?.nodes?.map((n) => {
              const meta = TYPE_META[n.type] ?? TYPE_META.server
              const color = STATUS_COLOR[n.status] ?? meta.color
              const isSel = selected === n.id
              const r = n.type === 'threat' ? 22 : 18
              return (
                <g
                  key={n.id}
                  onClick={() => setSelected(isSel ? null : n.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {(n.status === 'compromised' || n.status === 'critical') && (
                    <circle cx={n.x} cy={n.y} r={r + 8} fill="none" stroke={color} strokeWidth="1.5" opacity={0.5}>
                      <animate attributeName="r" values={`${r + 6};${r + 16};${r + 6}`} dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={r}
                    fill={`${color}22`}
                    stroke={color}
                    strokeWidth={isSel ? 3 : 2}
                  />
                  <text x={n.x} y={n.y + 4} fill={color} fontSize="13" textAnchor="middle" fontWeight="bold">
                    {n.type === 'threat' ? '☠' : n.type === 'user' ? 'U' : n.type === 'device' ? 'D' : n.type === 'server' ? 'S' : n.type === 'cloud' ? '☁' : '⚙'}
                  </text>
                  <text x={n.x} y={n.y + r + 12} fill="#e2e8f0" fontSize="10" textAnchor="middle" className="font-mono">
                    {n.label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Selected node detail */}
        <Panel
          title="Node Inspector"
          subtitle={selectedNode ? selectedNode.label : 'Select a node'}
          icon={<Target className="h-4 w-4" />}
        >
          {selectedNode ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <StatusDot status={selectedNode.status} />
                <span className="text-sm font-semibold">{selectedNode.label}</span>
                <span
                  className={cn(
                    'ml-auto rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',
                    selectedNode.status === 'compromised' || selectedNode.status === 'critical'
                      ? 'bg-red-500/15 text-red-400'
                      : selectedNode.status === 'targeted'
                      ? 'bg-orange-500/15 text-orange-400'
                      : 'bg-emerald-500/15 text-emerald-400'
                  )}
                >
                  {selectedNode.status}
                </span>
              </div>
              <div className="rounded-md bg-accent/40 p-2.5 text-xs">
                <div className="text-[10px] uppercase text-muted-foreground">Type</div>
                <div className="font-mono capitalize">{selectedNode.type}</div>
              </div>
              {selectedNode.detail && (
                <div className="rounded-md bg-accent/40 p-2.5 text-xs">
                  <div className="text-[10px] uppercase text-muted-foreground">Detail</div>
                  <div className="text-foreground/90">{selectedNode.detail}</div>
                </div>
              )}
              <div className="rounded-md bg-accent/40 p-2.5">
                <div className="mb-1 text-[10px] uppercase text-muted-foreground">Connected via</div>
                <div className="space-y-1">
                  {data?.edges
                    ?.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                    .map((e, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px]">
                        <span className="h-1.5 w-3 rounded" style={{ background: EDGE_COLOR[e.kind] }} />
                        <span className="font-mono text-cyan-400">{e.label}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-mono text-foreground/70">
                          {e.source === selectedNode.id ? e.target : e.source}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Click any node in the graph to inspect its relationships and risk posture.</p>
          )}
        </Panel>

        {/* Predictions */}
        <Panel
          title="Predicted Attack Paths"
          subtitle="Next-move forecast"
          icon={<Target className="h-4 w-4" />}
        >
          <div className="space-y-2">
            {data?.predictions?.map((p) => (
              <div key={p.id} className="rounded-lg border border-border bg-background/40 p-2.5">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="truncate font-mono text-red-400">{p.current.split(' ')[0]}</span>
                  <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                  <span className="truncate font-mono text-amber-400">{p.next}</span>
                  <span className="ml-auto shrink-0 rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-400">
                    {Math.round(p.probability * 100)}%
                  </span>
                </div>
                <div className="mt-1 font-mono text-[10px] text-cyan-400">{p.technique}</div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">ETA {p.timeframe}</div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Business impact */}
        <Panel
          title="Business Impact Analysis"
          subtitle="Financial + operational exposure"
          icon={<TrendingDown className="h-4 w-4" />}
          bodyClassName="p-0"
        >
          <div className="max-h-80 overflow-y-auto cyber-scroll divide-y divide-border">
            {data?.businessImpact?.map((b) => (
              <div key={b.asset} className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold">{b.asset}</span>
                  <SeverityBadge severity={b.overall} className="ml-auto" />
                </div>
                <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                  <Metric label="Financial" value={`$${(b.financialLoss / 1000).toFixed(0)}k`} color="text-red-400" />
                  <Metric label="Ops risk" value={`${b.operationalRisk}%`} color="text-orange-400" />
                  <Metric label="Data sens." value={`${b.dataSensitivity}%`} color="text-amber-400" />
                  <Metric label="Recovery" value={`${b.recoveryTime}h`} color="text-cyan-400" />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-mono font-semibold', color)}>{value}</span>
    </div>
  )
}
