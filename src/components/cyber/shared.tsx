'use client'

import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import type { Severity } from '@/lib/cyber-data'

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const map: Record<Severity, string> = {
    critical: 'bg-red-500/15 text-red-400 ring-red-500/30',
    high: 'bg-orange-500/15 text-orange-400 ring-orange-500/30',
    medium: 'bg-amber-500/15 text-amber-400 ring-amber-500/30',
    low: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1',
        map[severity],
        className
      )}
    >
      {severity}
    </span>
  )
}

export function StatusDot({ status }: { status: string }) {
  const color =
    {
      online: 'bg-emerald-400',
      thinking: 'bg-cyan-400',
      alert: 'bg-red-400',
      idle: 'bg-slate-500',
      protected: 'bg-emerald-400',
      safe: 'bg-emerald-400',
      'at-risk': 'bg-amber-400',
      targeted: 'bg-orange-400',
      compromised: 'bg-red-400',
      critical: 'bg-red-400',
    }[status] ?? 'bg-slate-500'
  return (
    <span className="relative flex h-2 w-2">
      {(status === 'alert' || status === 'compromised' || status === 'critical') && (
        <span className={cn('absolute inline-flex h-full w-full rounded-full opacity-60 threat-pulse', color)} />
      )}
      <span className={cn('relative inline-flex h-2 w-2 rounded-full', color)} />
    </span>
  )
}

export function Panel({
  title,
  subtitle,
  icon,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string
  subtitle?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <Card className={cn('overflow-hidden border-border bg-card/60', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            {icon && <span className="text-emerald-400">{icon}</span>}
            <div className="min-w-0">
              {title && <div className="text-sm font-semibold leading-tight truncate">{title}</div>}
              {subtitle && (
                <div className="text-[11px] text-muted-foreground leading-tight truncate">{subtitle}</div>
              )}
            </div>
          </div>
          {action}
        </div>
      )}
      <div className={cn('p-4', bodyClassName)}>{children}</div>
    </Card>
  )
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function RiskGauge({ value, size = 160 }: { value: number; size?: number }) {
  const r = size / 2 - 12
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  const color = value >= 80 ? '#ef4444' : value >= 65 ? '#f97316' : value >= 45 ? '#f59e0b' : '#10b981'
  const label = value >= 80 ? 'CRITICAL' : value >= 65 ? 'HIGH' : value >= 45 ? 'ELEVATED' : 'GUARDED'
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="oklch(0.3 0.02 260)" strokeWidth="10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-mono text-3xl font-bold" style={{ color }}>
            {value}
          </div>
          <div className="text-[10px] font-semibold tracking-widest" style={{ color }}>
            {label}
          </div>
          <div className="text-[9px] text-muted-foreground">/ 100</div>
        </div>
      </div>
    </div>
  )
}
