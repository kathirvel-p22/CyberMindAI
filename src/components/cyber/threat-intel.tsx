'use client'

import { useEffect, useState } from 'react'
import { Radar, Bug, Users, Fingerprint, Globe2, TrendingUp, ShieldAlert } from 'lucide-react'
import { Panel, SeverityBadge } from './shared'
import { cn } from '@/lib/utils'

interface ThreatData {
  cves: any[]
  threatActors: any[]
  iocs: any[]
  origins: any[]
  feedPulse: { feeds: number; iocsTracked: number; matches24h: number; newCves24h: number; lastUpdate: string }
}

const IOC_ICON: Record<string, string> = {
  ip: 'IP',
  domain: 'DOM',
  hash: 'HASH',
  url: 'URL',
  email: 'MAIL',
}

export default function ThreatIntel() {
  const [data, setData] = useState<ThreatData | null>(null)
  useEffect(() => {
    fetch('/api/threats')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      {/* Feed pulse */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Radar />} label="Active Feeds" value={data?.feedPulse.feeds ?? 22} sub="MISP · OpenCTI · OTX" accent="text-emerald-400" />
        <StatCard icon={<Fingerprint />} label="IOCs Tracked" value={(data?.feedPulse.iocsTracked ?? 48210).toLocaleString()} sub="deduplicated" accent="text-cyan-400" />
        <StatCard icon={<ShieldAlert />} label="Matches (24h)" value={data?.feedPulse.matches24h ?? 19} sub="against assets" accent="text-red-400" />
        <StatCard icon={<Bug />} label="New CVEs (24h)" value={data?.feedPulse.newCves24h ?? 6} sub="2 critical" accent="text-amber-400" />
      </div>

      {/* CVE table */}
      <Panel
        title="Vulnerability Intelligence — CVE Feed"
        subtitle="Prioritized by CVSS + exploit-in-the-wild + asset exposure"
        icon={<Bug className="h-4 w-4" />}
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-accent/30 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left">CVE</th>
                <th className="px-3 py-2 text-center">CVSS</th>
                <th className="px-3 py-2 text-center">Severity</th>
                <th className="px-3 py-2 text-left">Description</th>
                <th className="px-3 py-2 text-left">Affected Asset</th>
                <th className="px-3 py-2 text-center">Exploited</th>
                <th className="px-3 py-2 text-left">Published</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.cves?.map((c) => (
                <tr key={c.id} className="hover:bg-accent/30">
                  <td className="px-4 py-2.5 font-mono text-xs font-semibold text-emerald-400">{c.id}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={cn(
                        'font-mono font-bold',
                        c.cvss >= 9 ? 'text-red-400' : c.cvss >= 7 ? 'text-orange-400' : 'text-amber-400'
                      )}
                    >
                      {c.cvss}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <SeverityBadge severity={c.severity} />
                  </td>
                  <td className="px-3 py-2.5 text-xs text-foreground/80 max-w-xs">{c.description}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-cyan-400">{c.affectedAsset}</td>
                  <td className="px-3 py-2.5 text-center">
                    {c.exploitInWild ? (
                      <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-[10px] font-bold text-red-400">
                        IN WILD
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">no</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground">{c.published}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Threat actors */}
        <Panel
          title="Tracked Threat Actors"
          subtitle="APT groups mapped to TTPs & target sectors"
          icon={<Users className="h-4 w-4" />}
        >
          <div className="space-y-2.5">
            {data?.threatActors?.map((ta) => (
              <div key={ta.id} className="rounded-lg border border-border bg-background/40 p-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-9 place-items-center rounded bg-accent/60 font-mono text-[10px] font-bold">
                    {ta.origin}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{ta.name}</div>
                    <div className="text-[11px] text-muted-foreground">{ta.motive}</div>
                  </div>
                  <SeverityBadge severity={ta.threatLevel} className="ml-auto" />
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {ta.ttps.map((t: string) => (
                    <span key={t} className="rounded bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[10px] text-cyan-400">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {ta.targetSectors.map((s: string) => (
                    <span key={s} className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* IOCs */}
        <Panel
          title="Indicators of Compromise"
          subtitle="Active IOCs · confidence-scored"
          icon={<Fingerprint className="h-4 w-4" />}
        >
          <div className="space-y-2">
            {data?.iocs?.map((ioc) => (
              <div key={ioc.id} className="flex items-center gap-3 rounded-lg border border-border bg-background/40 p-2.5">
                <span className="grid h-8 min-w-8 place-items-center rounded bg-accent/60 px-1 font-mono text-[9px] font-bold text-cyan-400">
                  {IOC_ICON[ioc.type]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-mono text-xs text-foreground">{ioc.value}</div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{ioc.source}</span>
                    <span>·</span>
                    <span>{ioc.firstSeen}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={cn(
                      'font-mono text-sm font-bold',
                      ioc.confidence >= 90 ? 'text-red-400' : ioc.confidence >= 80 ? 'text-amber-400' : 'text-emerald-400'
                    )}
                  >
                    {ioc.confidence}%
                  </div>
                  <div className="flex flex-wrap gap-0.5 justify-end">
                    {ioc.tags.slice(0, 2).map((t: string) => (
                      <span key={t} className="rounded bg-accent/40 px-1 text-[9px] text-muted-foreground">
                        {t}
                      </span>
                    ))}
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

function StatCard({
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
