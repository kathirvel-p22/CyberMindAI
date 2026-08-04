'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Network, ArrowDown, ArrowUp, Activity, Gauge } from 'lucide-react'
import { Panel } from './shared'
import { cn } from '@/lib/utils'

interface TrafficData {
  timestamp: number
  inbound: number
  outbound: number
  packets: number
  threats: number
}

export default function NetworkTrafficMonitor() {
  const [traffic, setTraffic] = useState<TrafficData[]>([])
  const [current, setCurrent] = useState({ inbound: 0, outbound: 0, packets: 0, threats: 0 })

  useEffect(() => {
    const interval = setInterval(() => {
      const newData: TrafficData = {
        timestamp: Date.now(),
        inbound: Math.random() * 1000 + 200,
        outbound: Math.random() * 800 + 150,
        packets: Math.floor(Math.random() * 50000) + 10000,
        threats: Math.floor(Math.random() * 10),
      }

      setCurrent(newData)
      setTraffic((prev) => [...prev.slice(-119), newData])
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Panel
      title="Network Traffic Monitor"
      subtitle="Real-time bandwidth and packet analysis"
      icon={<Network className="h-4 w-4" />}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        <TrafficMetric
          icon={<ArrowDown className="h-4 w-4" />}
          label="Inbound"
          value={`${current.inbound.toFixed(0)} Mbps`}
          color="text-cyan-400"
        />
        <TrafficMetric
          icon={<ArrowUp className="h-4 w-4" />}
          label="Outbound"
          value={`${current.outbound.toFixed(0)} Mbps`}
          color="text-emerald-400"
        />
        <TrafficMetric
          icon={<Activity className="h-4 w-4" />}
          label="Packets/sec"
          value={current.packets.toLocaleString()}
          color="text-purple-400"
        />
        <TrafficMetric
          icon={<Gauge className="h-4 w-4" />}
          label="Threats Blocked"
          value={current.threats.toString()}
          color="text-red-400"
        />
      </div>

      <div className="h-48 relative">
        <TrafficGraph data={traffic} />
      </div>
    </Panel>
  )
}

function TrafficMetric({ icon, label, value, color }: any) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background/40 p-3">
      <div className={cn('rounded-md p-2', color, 'bg-current/10')}>{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn('text-lg font-bold font-mono', color)}>{value}</p>
      </div>
    </div>
  )
}

function TrafficGraph({ data }: { data: TrafficData[] }) {
  if (data.length < 2) return null

  const maxValue = Math.max(...data.map((d) => Math.max(d.inbound, d.outbound)))
  const width = 1000
  const height = 192

  const inboundPath = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - (d.inbound / maxValue) * height
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
    })
    .join(' ')

  const outboundPath = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - (d.outbound / maxValue) * height
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
    })
    .join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <defs>
        <linearGradient id="inboundGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="outboundGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      
      <path d={`${inboundPath} L ${width} ${height} L 0 ${height} Z`} fill="url(#inboundGrad)" />
      <path d={inboundPath} fill="none" stroke="#06b6d4" strokeWidth="2" />
      
      <path d={`${outboundPath} L ${width} ${height} L 0 ${height} Z`} fill="url(#outboundGrad)" />
      <path d={outboundPath} fill="none" stroke="#10b981" strokeWidth="2" />
    </svg>
  )
}
