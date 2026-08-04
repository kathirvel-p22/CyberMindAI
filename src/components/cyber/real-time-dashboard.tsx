'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  Shield,
  AlertTriangle,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  Wifi,
  Database,
  Cpu,
  HardDrive,
  Network,
  Eye,
  Bell,
} from 'lucide-react'
import { Panel } from './shared'
import { cn } from '@/lib/utils'

interface RealTimeMetrics {
  timestamp: number
  networkThroughput: number
  cpuUsage: number
  memoryUsage: number
  activeConnections: number
  blockedRequests: number
  anomalyScore: number
  responseTime: number
}

interface SecurityAlert {
  id: string
  type: 'critical' | 'warning' | 'info'
  message: string
  timestamp: number
  source: string
  action?: string
}

interface LiveLog {
  id: string
  level: 'error' | 'warn' | 'info' | 'success'
  message: string
  timestamp: number
  agent: string
}

export default function RealTimeDashboard() {
  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    timestamp: Date.now(),
    networkThroughput: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    activeConnections: 0,
    blockedRequests: 0,
    anomalyScore: 0,
    responseTime: 0,
  })

  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [logs, setLogs] = useState<LiveLog[]>([])
  const [metricsHistory, setMetricsHistory] = useState<RealTimeMetrics[]>([])

  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newMetrics: RealTimeMetrics = {
        timestamp: Date.now(),
        networkThroughput: Math.random() * 1000 + 500,
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        activeConnections: Math.floor(Math.random() * 5000) + 1000,
        blockedRequests: Math.floor(Math.random() * 50) + 10,
        anomalyScore: Math.random() * 100,
        responseTime: Math.random() * 200 + 50,
      }

      setMetrics(newMetrics)
      setMetricsHistory((prev) => [...prev.slice(-59), newMetrics])
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Simulate security alerts
  useEffect(() => {
    const alertTypes = [
      { type: 'critical' as const, messages: ['SQL injection attempt blocked', 'Brute force attack detected', 'Malware signature found', 'Unauthorized access attempt'] },
      { type: 'warning' as const, messages: ['Unusual traffic pattern', 'Rate limit threshold reached', 'Suspicious user behavior', 'Geo-location anomaly'] },
      { type: 'info' as const, messages: ['Security patch applied', 'Firewall rules updated', 'SSL certificate renewed', 'Backup completed'] },
    ]

    const interval = setInterval(() => {
      const category = alertTypes[Math.floor(Math.random() * alertTypes.length)]
      const message = category.messages[Math.floor(Math.random() * category.messages.length)]
      
      const newAlert: SecurityAlert = {
        id: `alert-${Date.now()}`,
        type: category.type,
        message,
        timestamp: Date.now(),
        source: ['WAF', 'IDS', 'SIEM', 'EDR', 'Firewall'][Math.floor(Math.random() * 5)],
        action: category.type === 'critical' ? 'Auto-blocked' : undefined,
      }

      setAlerts((prev) => [newAlert, ...prev.slice(0, 19)])
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Simulate live logs
  useEffect(() => {
    const logMessages = [
      { level: 'success' as const, agent: 'Threat Hunter', message: 'Completed threat analysis scan' },
      { level: 'info' as const, agent: 'Log Intelligence', message: 'Processing 4.2K events/min' },
      { level: 'warn' as const, agent: 'Behavioral Agent', message: 'Baseline deviation detected' },
      { level: 'error' as const, agent: 'Network Guardian', message: 'Port scan detected from 192.168.1.50' },
      { level: 'success' as const, agent: 'Auto Response', message: 'Containment playbook executed' },
      { level: 'info' as const, agent: 'Compliance', message: 'NIST framework check completed' },
    ]

    const interval = setInterval(() => {
      const log = logMessages[Math.floor(Math.random() * logMessages.length)]
      
      const newLog: LiveLog = {
        id: `log-${Date.now()}`,
        ...log,
        timestamp: Date.now(),
      }

      setLogs((prev) => [newLog, ...prev.slice(0, 49)])
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-4">
      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<Network className="h-5 w-5" />}
          label="Network Throughput"
          value={`${metrics.networkThroughput.toFixed(0)} Mbps`}
          trend={metrics.networkThroughput > 700 ? 'up' : 'down'}
          color="text-cyan-400"
        />
        <MetricCard
          icon={<Cpu className="h-5 w-5" />}
          label="CPU Usage"
          value={`${metrics.cpuUsage.toFixed(1)}%`}
          trend={metrics.cpuUsage > 60 ? 'up' : 'down'}
          color="text-purple-400"
        />
        <MetricCard
          icon={<HardDrive className="h-5 w-5" />}
          label="Memory Usage"
          value={`${metrics.memoryUsage.toFixed(1)}%`}
          trend={metrics.memoryUsage > 70 ? 'up' : 'down'}
          color="text-orange-400"
        />
        <MetricCard
          icon={<Wifi className="h-5 w-5" />}
          label="Active Connections"
          value={metrics.activeConnections.toLocaleString()}
          trend="stable"
          color="text-emerald-400"
        />
      </div>

      {/* Mini Sparklines */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SparklineCard
          label="Anomaly Score"
          value={metrics.anomalyScore.toFixed(0)}
          data={metricsHistory.map((m) => m.anomalyScore)}
          color="#ef4444"
          max={100}
        />
        <SparklineCard
          label="Blocked Requests"
          value={metrics.blockedRequests.toString()}
          data={metricsHistory.map((m) => m.blockedRequests)}
          color="#10b981"
          max={100}
        />
        <SparklineCard
          label="Response Time (ms)"
          value={metrics.responseTime.toFixed(0)}
          data={metricsHistory.map((m) => m.responseTime)}
          color="#06b6d4"
          max={300}
        />
        <SparklineCard
          label="CPU Load"
          value={`${metrics.cpuUsage.toFixed(0)}%`}
          data={metricsHistory.map((m) => m.cpuUsage)}
          color="#a855f7"
          max={100}
        />
      </div>

      {/* Alerts and Logs */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Live Security Alerts */}
        <Panel
          title="Live Security Alerts"
          subtitle="Real-time threat notifications"
          icon={<Bell className="h-4 w-4" />}
          bodyClassName="p-0"
          action={
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 threat-pulse" />
              LIVE
            </span>
          }
        >
          <div className="max-h-96 overflow-y-auto cyber-scroll">
            <AnimatePresence mode="popLayout">
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={cn(
                    'border-l-2 px-4 py-3 hover:bg-accent/40',
                    alert.type === 'critical' && 'border-red-500 bg-red-500/5',
                    alert.type === 'warning' && 'border-orange-500 bg-orange-500/5',
                    alert.type === 'info' && 'border-cyan-500 bg-cyan-500/5'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <AlertIcon type={alert.type} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-mono">{alert.source}</span>
                          <span>·</span>
                          <span>{formatTime(alert.timestamp)}</span>
                          {alert.action && (
                            <>
                              <span>·</span>
                              <span className="text-emerald-400">{alert.action}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Panel>

        {/* Live Agent Activity Logs */}
        <Panel
          title="Agent Activity Stream"
          subtitle="AI agent operations log"
          icon={<Eye className="h-4 w-4" />}
          bodyClassName="p-0"
          action={
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
              <Activity className="h-3 w-3" />
              {logs.length} EVENTS
            </span>
          }
        >
          <div className="max-h-96 overflow-y-auto cyber-scroll font-mono text-xs">
            <AnimatePresence mode="popLayout">
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-3 px-4 py-2 hover:bg-accent/40 border-b border-border/50"
                >
                  <span className="text-muted-foreground shrink-0 mt-0.5">{formatTime(log.timestamp)}</span>
                  <LogLevelBadge level={log.level} />
                  <div className="min-w-0 flex-1">
                    <span className="text-cyan-400">[{log.agent}]</span>{' '}
                    <span className="text-foreground/90">{log.message}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Panel>
      </div>

      {/* Real-time System Health */}
      <Panel
        title="System Health Monitor"
        subtitle="Infrastructure status"
        icon={<Activity className="h-4 w-4" />}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <HealthIndicator label="API Gateway" status="healthy" uptime="99.98%" />
          <HealthIndicator label="Database" status="healthy" uptime="99.99%" />
          <HealthIndicator label="Threat Stream" status="healthy" uptime="100%" />
          <HealthIndicator label="AI Engine" status="degraded" uptime="97.50%" />
        </div>
      </Panel>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  trend,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  trend: 'up' | 'down' | 'stable'
  color: string
}) {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="rounded-lg border border-border bg-card p-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className={cn('mt-2 text-2xl font-bold font-mono tabular-nums', color)}>{value}</p>
        </div>
        <div className={cn('rounded-md p-2', color, 'bg-current/10')}>{icon}</div>
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs">
        {trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-400" />}
        {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-400" />}
        {trend === 'stable' && <Activity className="h-3 w-3 text-cyan-400" />}
        <span className="text-muted-foreground">
          {trend === 'up' ? 'Increasing' : trend === 'down' ? 'Decreasing' : 'Stable'}
        </span>
      </div>
    </motion.div>
  )
}

function SparklineCard({
  label,
  value,
  data,
  color,
  max,
}: {
  label: string
  value: string
  data: number[]
  color: string
  max: number
}) {
  const points = data.slice(-30)
  const width = 200
  const height = 40
  const path = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * width
      const y = height - (v / max) * height
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
    })
    .join(' ')

  return (
    <Panel bodyClassName="p-3">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold font-mono" style={{ color }}>{value}</p>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-8">
        <path d={path} fill="none" stroke={color} strokeWidth="2" opacity="0.8" />
        <path d={`${path} L ${width} ${height} L 0 ${height} Z`} fill={color} opacity="0.1" />
      </svg>
    </Panel>
  )
}

function AlertIcon({ type }: { type: 'critical' | 'warning' | 'info' }) {
  const icons = {
    critical: <Shield className="h-4 w-4 text-red-400" />,
    warning: <AlertTriangle className="h-4 w-4 text-orange-400" />,
    info: <Zap className="h-4 w-4 text-cyan-400" />,
  }
  return icons[type]
}

function LogLevelBadge({ level }: { level: 'error' | 'warn' | 'info' | 'success' }) {
  const config = {
    error: { label: 'ERR', color: 'text-red-400 bg-red-500/10' },
    warn: { label: 'WRN', color: 'text-orange-400 bg-orange-500/10' },
    info: { label: 'INF', color: 'text-cyan-400 bg-cyan-500/10' },
    success: { label: 'SUC', color: 'text-emerald-400 bg-emerald-500/10' },
  }
  const { label, color } = config[level]
  return (
    <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0', color)}>
      {label}
    </span>
  )
}

function HealthIndicator({ label, status, uptime }: { label: string; status: 'healthy' | 'degraded' | 'down'; uptime: string }) {
  const statusConfig = {
    healthy: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400' },
    degraded: { color: 'text-orange-400', bg: 'bg-orange-500/10', dot: 'bg-orange-400' },
    down: { color: 'text-red-400', bg: 'bg-red-500/10', dot: 'bg-red-400' },
  }
  const config = statusConfig[status]

  return (
    <div className={cn('rounded-md border border-border p-3', config.bg)}>
      <div className="flex items-center gap-2">
        <span className={cn('h-2 w-2 rounded-full', config.dot, status === 'healthy' && 'threat-pulse')} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className={cn('text-xs font-semibold uppercase', config.color)}>{status}</span>
        <span className="text-xs text-muted-foreground font-mono">{uptime}</span>
      </div>
    </div>
  )
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
