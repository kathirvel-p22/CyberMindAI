'use client'

import { useEffect, useState } from 'react'
import { Crosshair, Layers, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import { Panel, SeverityBadge } from './shared'
import { cn } from '@/lib/utils'

interface MitreData {
  tactics: any[]
  totalDetections: number
  coverage: number
  cves: any[]
  threatActors: any[]
  iocs: any[]
}

const STATUS_COLOR: Record<string, string> = {
  online: '#10b981',
  thinking: '#06b6d4',
  alert: '#ef4444',
  idle: '#64748b',
}

export default function MitreMatrix() {
  const [data, setData] = useState<MitreData | null>(null)
  useEffect(() => {
    fetch('/api/mitre')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Panel className="p-0" bodyClassName="p-3.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Tactics Covered</div>
          <div className="mt-1 font-mono text-2xl font-bold text-emerald-400">{data?.tactics?.length ?? 0}</div>
          <div className="text-[10px] text-muted-foreground">of 14 enterprise</div>
        </Panel>
        <Panel className="p-0" bodyClassName="p-3.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Detections</div>
          <div className="mt-1 font-mono text-2xl font-bold text-cyan-400">{data?.totalDetections ?? 0}</div>
          <div className="text-[10px] text-muted-foreground">24h, mapped</div>
        </Panel>
        <Panel className="p-0" bodyClassName="p-3.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Coverage</div>
          <div className="mt-1 font-mono text-2xl font-bold text-amber-400">{data?.coverage ?? 0}%</div>
          <div className="text-[10px] text-muted-foreground">tactic coverage</div>
        </Panel>
        <Panel className="p-0" bodyClassName="p-3.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Active Chains</div>
          <div className="mt-1 font-mono text-2xl font-bold text-red-400">6</div>
          <div className="text-[10px] text-muted-foreground">multi-stage</div>
        </Panel>
      </div>

      {/* Matrix */}
      <Panel
        title="MITRE ATT&CK Enterprise Matrix"
        subtitle="Live detection counts per technique · color = severity, height = volume"
        icon={<Crosshair className="h-4 w-4" />}
        bodyClassName="p-3 overflow-x-auto"
      >
        <div className="flex gap-2 min-w-max">
          {data?.tactics?.map((tactic) => {
            const maxCount = Math.max(...tactic.techniques.map((t: any) => t.count), 1)
            return (
              <div key={tactic.id} className="w-40 shrink-0">
                <div className="mb-2 rounded-md bg-accent/50 px-2 py-1.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                    {tactic.name}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {tactic.techniques.map((tech: any) => {
                    const intensity = tech.count / maxCount
                    const bgColor =
                      tech.severity === 'critical'
                        ? `rgba(239,68,68,${0.1 + intensity * 0.4})`
                        : tech.severity === 'high'
                        ? `rgba(249,115,22,${0.1 + intensity * 0.4})`
                        : tech.severity === 'medium'
                        ? `rgba(245,158,11,${0.1 + intensity * 0.4})`
                        : `rgba(16,185,129,${0.1 + intensity * 0.4})`
                    return (
                      <div
                        key={tech.id}
                        className="rounded-md border border-border p-2"
                        style={{ background: bgColor }}
                        title={`${tech.name} — ${tech.count} detections`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold text-foreground/80">{tech.id}</span>
                          <SeverityBadge severity={tech.severity} />
                        </div>
                        <div className="mt-1 text-[11px] font-medium leading-tight">{tech.name}</div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">detections</span>
                          <span className="font-mono text-sm font-bold">{tech.count}</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-background/40">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${intensity * 100}%`,
                              background:
                                tech.severity === 'critical'
                                  ? '#ef4444'
                                  : tech.severity === 'high'
                                  ? '#f97316'
                                  : tech.severity === 'medium'
                                  ? '#f59e0b'
                                  : '#10b981',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </Panel>

      {/* Active attack chains */}
      <Panel
        title="Reconstructed Attack Chains"
        subtitle="MITRE Mapping agent · multi-stage kill chains"
        icon={<Layers className="h-4 w-4" />}
      >
        <div className="space-y-3">
          <Chain
            name="APT29 — Credential Campaign"
            severity="critical"
            steps={[
              { id: 'T1566', name: 'Phishing', tactic: 'Initial Access' },
              { id: 'T1059', name: 'PowerShell', tactic: 'Execution' },
              { id: 'T1003', name: 'LSASS Dump', tactic: 'Credential Access' },
              { id: 'T1021', name: 'Remote Services', tactic: 'Lateral Movement' },
              { id: 'T1041', name: 'C2 Exfil', tactic: 'Exfiltration' },
            ]}
          />
          <Chain
            name="OT-SCADA Exploitation Path"
            severity="critical"
            steps={[
              { id: 'T1595', name: 'Active Scan', tactic: 'Reconnaissance' },
              { id: 'T1190', name: 'Exploit App', tactic: 'Initial Access' },
              { id: 'T1068', name: 'Priv Esc', tactic: 'Privilege Escalation' },
              { id: 'T1486', name: 'Encrypt Impact', tactic: 'Impact' },
            ]}
          />
          <Chain
            name="Cloud Key Abuse"
            severity="high"
            steps={[
              { id: 'T1078', name: 'Valid Accounts', tactic: 'Initial Access' },
              { id: 'T1550', name: 'Token Reuse', tactic: 'Defense Evasion' },
              { id: 'T1005', name: 'Data Collect', tactic: 'Collection' },
              { id: 'T1567', name: 'Cloud Exfil', tactic: 'Exfiltration' },
            ]}
          />
        </div>
      </Panel>
    </div>
  )
}

function Chain({
  name,
  severity,
  steps,
}: {
  name: string
  severity: 'critical' | 'high' | 'medium'
  steps: { id: string; name: string; tactic: string }[]
}) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <div className="mb-2 flex items-center gap-2">
        <SeverityBadge severity={severity} />
        <span className="text-sm font-semibold">{name}</span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1.5">
            <div className="rounded-md border border-border bg-accent/40 px-2 py-1.5">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] font-bold text-cyan-400">{s.id}</span>
                <span className="text-[11px] font-medium">{s.name}</span>
              </div>
              <div className="text-[9px] uppercase tracking-wide text-muted-foreground">{s.tactic}</div>
            </div>
            {i < steps.length - 1 && <span className="text-muted-foreground">→</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
