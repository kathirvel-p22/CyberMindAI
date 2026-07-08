// CyberMind AI — Real-time Threat Stream Service
// WebSocket (Socket.IO) mini-service on port 3003.
// Emits simulated live threat events, AI agent status pulses, and rolling
// SOC metrics to the CyberMind dashboard so analysts see a living console.
//
// IMPORTANT: path MUST stay "/" so Caddy forwards ?XTransformPort=3003 correctly.

import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout: 60000,
  pingInterval: 25000,
})

const PORT = 3003

// ---------------------------------------------------------------------------
// Simulated world state
// ---------------------------------------------------------------------------
const ATTACKER_COUNTRIES = ['RU', 'CN', 'KP', 'IR', 'BR', 'VN', 'IN', 'US', 'NL', 'UA']
const TARGET_ASSETS = [
  'web-prod-01',
  'db-core-financial',
  'ad-controller-03',
  'ot-scada-grid',
  'cloud-k8s-cluster',
  'mail-gateway',
  'vpn-edge-02',
  'backup-vault',
  'ci-runner-pool',
  'iam-keycloak',
]
const THREAT_TYPES = [
  { type: 'brute-force', tactic: 'Credential Access', technique: 'T1110', weight: 18 },
  { type: 'phishing', tactic: 'Initial Access', technique: 'T1566', weight: 14 },
  { type: 'malware', tactic: 'Execution', technique: 'T1059', weight: 12 },
  { type: 'lateral-movement', tactic: 'Lateral Movement', technique: 'T1021', weight: 9 },
  { type: 'data-exfil', tactic: 'Exfiltration', technique: 'T1041', weight: 7 },
  { type: 'priv-esc', tactic: 'Privilege Escalation', technique: 'T1068', weight: 8 },
  { type: 'recon', tactic: 'Reconnaissance', technique: 'T1595', weight: 16 },
  { type: 'credential-dump', tactic: 'Credential Access', technique: 'T1003', weight: 6 },
  { type: 'anomaly', tactic: 'Defense Evasion', technique: 'T1027', weight: 10 },
]
const SEVERITIES = ['critical', 'high', 'medium', 'low']
const DESCR = {
  'brute-force': 'Multiple failed SSH/RDP authentications against',
  'phishing': 'Malicious payload delivered via spear-phish to',
  'malware': 'Suspicious process spawned on',
  'lateral-movement': 'Anomalous SMB session from internal host toward',
  'data-exfil': 'Outbound DNS tunneling detected from',
  'priv-esc': 'Kernel exploit attempt observed on',
  'recon': 'Port scan sweep targeting',
  'credential-dump': 'LSASS memory access observed on',
  'anomaly': 'Behavioral baseline deviation on',
}

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function weightedPick() {
  const total = THREAT_TYPES.reduce((s, t) => s + t.weight, 0)
  let r = Math.random() * total
  for (const t of THREAT_TYPES) {
    r -= t.weight
    if (r <= 0) return t
  }
  return THREAT_TYPES[0]
}
function randomIp() {
  return `${randInt(1, 223)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`
}
function sevFor(score: number): string {
  if (score >= 85) return 'critical'
  if (score >= 65) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

const AGENTS = [
  'log-intelligence',
  'behavioral',
  'threat-intel',
  'mitre-mapping',
  'attack-prediction',
  'business-impact',
  'autonomous-response',
  'executive-copilot',
  'compliance',
  'cyber-memory',
]

function generateThreat() {
  const tpl = weightedPick()
  const score = randInt(25, 99)
  const target = rand(TARGET_ASSETS)
  const country = rand(ATTACKER_COUNTRIES)
  const id = `EVT-${Date.now()}-${randInt(1000, 9999)}`
  return {
    id,
    type: tpl.type,
    severity: sevFor(score),
    riskScore: score,
    sourceIp: randomIp(),
    sourceCountry: country,
    targetAsset: target,
    description: `${DESCR[tpl.type as keyof typeof DESCR]} ${target}`,
    mitreTactic: tpl.tactic,
    mitreTechnique: tpl.technique,
    timestamp: new Date().toISOString(),
  }
}

function generateAgentPulse() {
  const agent = rand(AGENTS)
  const events = ['analyzing', 'correlated', 'enriched', 'flagged', 'mitigated', 'learned']
  return {
    agent,
    event: rand(events),
    message: agentStatusMessage(agent, rand(events)),
    timestamp: new Date().toISOString(),
  }
}

function agentStatusMessage(agent: string, event: string): string {
  const map: Record<string, string> = {
    'log-intelligence': `Log Intelligence agent ${event} 4.2k events/min from SIEM/EDR`,
    'behavioral': `Behavioral agent ${event} baseline drift on endpoint fleet`,
    'threat-intel': `Threat Intel agent ${event} 312 IOCs against internal assets`,
    'mitre-mapping': `MITRE Mapping agent ${event} T1021 lateral movement chain`,
    'attack-prediction': `Attack Prediction agent ${event} likely next target: db-core-financial`,
    'business-impact': `Business Impact agent ${event} $2.4M exposure on OT-SCADA`,
    'autonomous-response': `Autonomous Response agent ${event} containment playbook staged`,
    'executive-copilot': `Executive Copilot agent ${event} daily risk briefing synthesized`,
    'compliance': `Compliance agent ${event} NIST 800-53 control gap flagged`,
    'cyber-memory': `Cyber Memory agent ${event} prior incident INC-2049 recalled`,
  }
  return map[agent] || `${agent} ${event}`
}

// ---------------------------------------------------------------------------
// Rolling metrics
// ---------------------------------------------------------------------------
let metrics = {
  riskScore: 72,
  activeThreats: 18,
  eventsPerMin: 4180,
  blockedAttacks: 1247,
  agentsOnline: 10,
  mttrMinutes: 14,
  openIncidents: 7,
  criticalAssets: 12,
}

function tickMetrics() {
  metrics.riskScore = Math.max(
    35,
    Math.min(96, metrics.riskScore + randInt(-4, 4))
  )
  metrics.activeThreats = Math.max(3, Math.min(60, metrics.activeThreats + randInt(-3, 3)))
  metrics.eventsPerMin = Math.max(800, Math.min(9000, metrics.eventsPerMin + randInt(-220, 220)))
  metrics.blockedAttacks += randInt(0, 4)
  metrics.mttrMinutes = Math.max(4, Math.min(45, metrics.mttrMinutes + randInt(-2, 2)))
  metrics.openIncidents = Math.max(1, Math.min(20, metrics.openIncidents + randInt(-1, 1)))
  io.emit('metrics', { ...metrics, timestamp: new Date().toISOString() })
}

// ---------------------------------------------------------------------------
// Connection handling
// ---------------------------------------------------------------------------
io.on('connection', (socket) => {
  console.log(`[CyberMind] SOC console connected: ${socket.id}`)
  socket.emit('hello', {
    service: 'cybermind-threat-stream',
    status: 'online',
    timestamp: new Date().toISOString(),
  })
  // send a snapshot immediately so the console isn't empty
  socket.emit('metrics', { ...metrics, timestamp: new Date().toISOString() })
  socket.emit('threat', generateThreat())
  socket.emit('agent-pulse', generateAgentPulse())
})

// Emit loop — threats every ~4s, agent pulses every ~6s, metrics every ~5s
setInterval(() => io.emit('threat', generateThreat()), 4000)
setInterval(() => io.emit('agent-pulse', generateAgentPulse()), 6000)
setInterval(tickMetrics, 5000)

httpServer.listen(PORT, () => {
  console.log(`[CyberMind] Threat stream service running on port ${PORT}`)
})

process.on('SIGTERM', () => httpServer.close(() => process.exit(0)))
process.on('SIGINT', () => httpServer.close(() => process.exit(0)))
