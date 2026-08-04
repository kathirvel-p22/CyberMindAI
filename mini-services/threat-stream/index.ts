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

// ---------------------------------------------------------------------------
// Real-time burst events - sudden attack spikes
// ---------------------------------------------------------------------------
function generateBurstEvent() {
  const burstTypes = [
    { name: 'DDoS Attack', count: randInt(50, 200), duration: 30 },
    { name: 'Credential Stuffing', count: randInt(100, 500), duration: 45 },
    { name: 'Port Scan Sweep', count: randInt(30, 150), duration: 20 },
    { name: 'Ransomware Campaign', count: randInt(10, 50), duration: 60 },
  ]
  const burst = rand(burstTypes)
  io.emit('burst-alert', {
    type: burst.name,
    threatCount: burst.count,
    duration: burst.duration,
    severity: 'critical',
    timestamp: new Date().toISOString(),
  })
}

// ---------------------------------------------------------------------------
// Real-time agent activity notifications
// ---------------------------------------------------------------------------
function generateAgentActivity() {
  const activities = [
    { agent: 'threat-hunter', action: 'Identified lateral movement pattern', status: 'warning' },
    { agent: 'autonomous-response', action: 'Quarantined compromised endpoint', status: 'success' },
    { agent: 'vulnerability-analyst', action: 'Found 3 critical CVEs in production', status: 'critical' },
    { agent: 'forensics', action: 'Memory dump analysis completed', status: 'info' },
    { agent: 'network-guardian', action: 'Blocked 127 malicious IPs', status: 'success' },
    { agent: 'compliance', action: 'NIST control gap detected', status: 'warning' },
  ]
  const activity = rand(activities)
  io.emit('agent-activity', {
    ...activity,
    timestamp: new Date().toISOString(),
  })
}

// ---------------------------------------------------------------------------
// Real-time compliance status changes
// ---------------------------------------------------------------------------
function generateComplianceUpdate() {
  const frameworks = ['ISO 27001', 'NIST 800-53', 'CIS Controls', 'PCI DSS', 'SOC 2']
  const controls = ['AC-2', 'IA-5', 'SC-7', 'AU-12', 'CM-7', 'SI-4']
  io.emit('compliance-update', {
    framework: rand(frameworks),
    control: rand(controls),
    status: rand(['compliant', 'non-compliant', 'degraded']),
    score: randInt(65, 98),
    timestamp: new Date().toISOString(),
  })
}

// ---------------------------------------------------------------------------
// Real-time incident status updates
// ---------------------------------------------------------------------------
function generateIncidentUpdate() {
  const statuses = ['open', 'investigating', 'contained', 'resolved']
  const incidentId = `INC-${randInt(2000, 2999)}`
  io.emit('incident-update', {
    id: incidentId,
    status: rand(statuses),
    severity: rand(SEVERITIES),
    assignedTo: rand(['SOC Analyst', 'IR Team', 'Security Engineer', 'CISO']),
    timestamp: new Date().toISOString(),
  })
}

// ---------------------------------------------------------------------------
// Real-time vulnerability feed
// ---------------------------------------------------------------------------
function generateVulnerability() {
  const cveYear = randInt(2023, 2025)
  const cveId = `CVE-${cveYear}-${randInt(1000, 99999)}`
  const cvssScore = (randInt(40, 100) / 10).toFixed(1)
  io.emit('vulnerability', {
    cveId,
    cvssScore: parseFloat(cvssScore),
    severity: parseFloat(cvssScore) >= 9 ? 'critical' : parseFloat(cvssScore) >= 7 ? 'high' : 'medium',
    affectedAssets: randInt(1, 50),
    description: `New vulnerability detected in production environment`,
    timestamp: new Date().toISOString(),
  })
}

// ---------------------------------------------------------------------------
// Real-time threat intelligence feed
// ---------------------------------------------------------------------------
function generateThreatIntel() {
  const iocTypes = ['IP', 'Domain', 'Hash', 'URL']
  const sources = ['AlienVault OTX', 'VirusTotal', 'Cisco Talos', 'MISP', 'Internal']
  io.emit('threat-intel', {
    iocType: rand(iocTypes),
    iocValue: rand(iocTypes) === 'IP' ? randomIp() : `malicious-${randInt(1000, 9999)}.example.com`,
    source: rand(sources),
    confidence: randInt(60, 99),
    firstSeen: new Date(Date.now() - randInt(1, 72) * 3600000).toISOString(),
    timestamp: new Date().toISOString(),
  })
}

// ---------------------------------------------------------------------------
// Real-time network anomaly detection
// ---------------------------------------------------------------------------
function generateNetworkAnomaly() {
  const anomalyTypes = [
    'Unusual data transfer volume',
    'Off-hours authentication',
    'Geographic anomaly',
    'Protocol violation',
    'Beaconing detected',
  ]
  io.emit('network-anomaly', {
    type: rand(anomalyTypes),
    source: randomIp(),
    destination: rand(TARGET_ASSETS),
    anomalyScore: randInt(60, 95),
    baselineDeviation: `${randInt(200, 800)}%`,
    timestamp: new Date().toISOString(),
  })
}

// Emit loop — threats every ~4s, agent pulses every ~6s, metrics every ~5s
setInterval(() => io.emit('threat', generateThreat()), 4000)
setInterval(() => io.emit('agent-pulse', generateAgentPulse()), 6000)
setInterval(tickMetrics, 5000)

// New real-time features
setInterval(generateAgentActivity, 8000) // Agent activities every 8s
setInterval(generateVulnerability, 15000) // New vulnerabilities every 15s
setInterval(generateThreatIntel, 12000) // Threat intel every 12s
setInterval(generateNetworkAnomaly, 10000) // Network anomalies every 10s
setInterval(generateComplianceUpdate, 20000) // Compliance updates every 20s
setInterval(generateIncidentUpdate, 18000) // Incident updates every 18s
setInterval(generateBurstEvent, 45000) // Burst events every 45s (occasional spikes)

httpServer.listen(PORT, () => {
  console.log(`[CyberMind] Threat stream service running on port ${PORT}`)
})

process.on('SIGTERM', () => httpServer.close(() => process.exit(0)))
process.on('SIGINT', () => httpServer.close(() => process.exit(0)))
