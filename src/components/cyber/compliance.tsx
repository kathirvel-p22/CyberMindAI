'use client'

import { useEffect, useState } from 'react'
import {
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MinusCircle,
  FileCheck,
  CalendarClock,
} from 'lucide-react'
import { MiniStackedBar } from './charts'
import { Panel } from './shared'
import { cn } from '@/lib/utils'

const STATUS_META: Record<string, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  compliant: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/15', label: 'Compliant' },
  partial: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/15', label: 'Partial' },
  'non-compliant': { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/15', label: 'Non-Compliant' },
  na: { icon: MinusCircle, color: 'text-slate-400', bg: 'bg-slate-500/15', label: 'N/A' },
}

interface ComplianceData {
  controls: any[]
  summary: { framework: string; compliant: number; partial: number; nonCompliant: number; na: number; total: number }[]
  auditReady: boolean
  lastAudit: string
  nextAudit: string
}

export default function Compliance() {
  const [data, setData] = useState<ComplianceData | null>(null)
  useEffect(() => {
    fetch('/api/compliance')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  const totalCompliant = data?.summary?.reduce((s, f) => s + f.compliant, 0) ?? 0
  const totalPartial = data?.summary?.reduce((s, f) => s + f.partial, 0) ?? 0
  const totalNon = data?.summary?.reduce((s, f) => s + f.nonCompliant, 0) ?? 0
  const totalControls = data?.summary?.reduce((s, f) => s + f.total, 0) ?? 0
  const score = totalControls ? Math.round(((totalCompliant + totalPartial * 0.5) / totalControls) * 100) : 0

  const chartData = data?.summary?.map((f) => ({
    label: f.framework.split(' ')[0],
    Compliant: f.compliant,
    Partial: f.partial,
    'Non-Compliant': f.nonCompliant,
    'N/A': f.na,
  })) ?? []

  return (
    <div className="space-y-4">
      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Panel className="p-0" bodyClassName="p-3.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Compliance Score</div>
          <div className={cn('mt-1 font-mono text-2xl font-bold', score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400')}>
            {score}%
          </div>
          <div className="text-[10px] text-muted-foreground">across {totalControls} controls</div>
        </Panel>
        <Panel className="p-0" bodyClassName="p-3.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Fully Compliant</div>
          <div className="mt-1 font-mono text-2xl font-bold text-emerald-400">{totalCompliant}</div>
          <div className="text-[10px] text-muted-foreground">controls</div>
        </Panel>
        <Panel className="p-0" bodyClassName="p-3.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Gaps</div>
          <div className="mt-1 font-mono text-2xl font-bold text-amber-400">{totalPartial + totalNon}</div>
          <div className="text-[10px] text-muted-foreground">{totalNon} non-compliant</div>
        </Panel>
        <Panel className="p-0" bodyClassName="p-3.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Audit Ready</div>
          <div className={cn('mt-1 flex items-center gap-1.5 font-mono text-2xl font-bold', data?.auditReady ? 'text-emerald-400' : 'text-red-400')}>
            <FileCheck className="h-5 w-5" />
            {data?.auditReady ? 'YES' : 'NO'}
          </div>
          <div className="text-[10px] text-muted-foreground">evidence auto-generated</div>
        </Panel>
      </div>

      {/* Chart + audit info */}
      <div className="grid gap-4 lg:grid-cols-12">
        <Panel
          title="Control Posture by Framework"
          subtitle="ISO 27001 · NIST 800-53 · CIS Controls v8"
          icon={<ClipboardCheck className="h-4 w-4" />}
          className="lg:col-span-8"
          bodyClassName="h-64"
        >
          <MiniStackedBar
            data={chartData}
            categories={[
              { key: 'Compliant', label: 'Compliant' },
              { key: 'Partial', label: 'Partial' },
              { key: 'Non-Compliant', label: 'Non-Compliant' },
              { key: 'N/A', label: 'N/A' },
            ]}
            colors={['#10b981', '#f59e0b', '#ef4444', '#64748b']}
            height={256}
          />
          <div className="mt-1 flex flex-wrap gap-3 text-[10px]">
            {['Compliant', 'Partial', 'Non-Compliant', 'N/A'].map((l, i) => (
              <span key={l} className="flex items-center gap-1 text-muted-foreground">
                <span className="h-2 w-2 rounded-sm" style={{ background: ['#10b981', '#f59e0b', '#ef4444', '#64748b'][i] }} />
                {l}
              </span>
            ))}
          </div>
        </Panel>

        <Panel
          title="Audit Schedule"
          subtitle="Compliance AI · continuous evidence"
          icon={<CalendarClock className="h-4 w-4" />}
          className="lg:col-span-4"
        >
          <div className="space-y-3">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
              <div className="text-[10px] uppercase tracking-wider text-emerald-400">Last Audit</div>
              <div className="font-mono text-sm font-semibold">{data?.lastAudit ?? '—'}</div>
              <div className="text-[11px] text-muted-foreground">Evidence package: 284 controls</div>
            </div>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <div className="text-[10px] uppercase tracking-wider text-amber-400">Next Audit</div>
              <div className="font-mono text-sm font-semibold">{data?.nextAudit ?? '—'}</div>
              <div className="text-[11px] text-muted-foreground">Q2 ISO 27001 surveillance</div>
            </div>
            <div className="rounded-lg border border-border bg-background/40 p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Auto-Evidence</div>
              <p className="mt-0.5 text-[11px] text-foreground/80">
                The Compliance agent ingests SIEM, EDR and config telemetry continuously and emits audit-ready
                evidence packages — no manual screenshots.
              </p>
            </div>
          </div>
        </Panel>
      </div>

      {/* Controls table */}
      <Panel
        title="Control Register"
        subtitle="Continuously assessed against ISO 27001 / NIST 800-53 / CIS v8"
        icon={<FileCheck className="h-4 w-4" />}
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-accent/30 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left">Framework</th>
                <th className="px-3 py-2 text-left">Category</th>
                <th className="px-3 py-2 text-left">Control</th>
                <th className="px-3 py-2 text-center">Status</th>
                <th className="px-3 py-2 text-left">Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.controls?.map((c, i) => {
                const meta = STATUS_META[c.status] ?? STATUS_META.na
                const Icon = meta.icon
                return (
                  <tr key={i} className="hover:bg-accent/20">
                    <td className="px-4 py-2.5">
                      <span className="rounded bg-accent/60 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-cyan-400">
                        {c.framework}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{c.category}</td>
                    <td className="px-3 py-2.5 text-xs font-medium">{c.control}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={cn('inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase', meta.bg, meta.color)}>
                        <Icon className="h-3 w-3" />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-foreground/70">{c.evidence}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
