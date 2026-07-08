'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export interface LiveThreat {
  id: string
  type: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  riskScore: number
  sourceIp: string
  sourceCountry: string
  targetAsset: string
  description: string
  mitreTactic: string
  mitreTechnique: string
  timestamp: string
}

export interface LiveMetrics {
  riskScore: number
  activeThreats: number
  eventsPerMin: number
  blockedAttacks: number
  agentsOnline: number
  mttrMinutes: number
  openIncidents: number
  criticalAssets: number
  timestamp?: string
}

export interface AgentPulse {
  agent: string
  event: string
  message: string
  timestamp: string
}

/**
 * Connects to the CyberMind threat-stream mini-service (port 3003 via Caddy
 * XTransformPort) and exposes live threats, rolling metrics and agent pulses.
 */
export function useThreatStream() {
  const [connected, setConnected] = useState(false)
  const [threats, setThreats] = useState<LiveThreat[]>([])
  const [metrics, setMetrics] = useState<LiveMetrics | null>(null)
  const [pulses, setPulses] = useState<AgentPulse[]>([])
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      timeout: 10000,
    })
    socketRef.current = socket

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('threat', (t: LiveThreat) => {
      setThreats((prev) => [t, ...prev].slice(0, 60))
    })
    socket.on('metrics', (m: LiveMetrics) => setMetrics(m))
    socket.on('agent-pulse', (p: AgentPulse) => {
      setPulses((prev) => [p, ...prev].slice(0, 30))
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return { connected, threats, metrics, pulses }
}
