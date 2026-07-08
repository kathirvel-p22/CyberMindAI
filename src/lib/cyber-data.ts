// CyberMind AI — Cyber Data Library
// Central source of truth for the SOC dashboard: AI agents, MITRE ATT&CK,
// threat intel (CVEs/actors/IOCs), attack graph, compliance, cyber memory,
// business impact, and the 10 specialized agents' live reasoning outputs.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type Severity = 'critical' | 'high' | 'medium' | 'low'
export type IncidentStatus = 'open' | 'investigating' | 'contained' | 'resolved' | 'closed'

export interface CyberAgent {
  id: string
  name: string
  role: string
  description: string
  status: 'online' | 'thinking' | 'alert' | 'idle'
  icon: string
  metrics: { label: string; value: string }[]
  lastOutput: string
  lastUpdate: string
  color: string
}

export interface MitreTechnique {
  id: string
  name: string
  tactic: string
  count: number
  severity: Severity
}

export interface MitreTactic {
  id: string
  name: string
  techniques: MitreTechnique[]
}

export interface CVEItem {
  id: string
  cvss: number
  severity: Severity
  description: string
  affectedAsset: string
  exploited: boolean
  published: string
  exploitInWild: boolean
}

export interface ThreatActor {
  id: string
  name: string
  origin: string
  motive: string
  ttps: string[]
  targetSectors: string[]
  threatLevel: Severity
}

export interface IOCItem {
  id: string
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email'
  value: string
  confidence: number
  source: string
  firstSeen: string
  tags: string[]
}

export interface AttackGraphNode {
  id: string
  label: string
  type: 'user' | 'device' | 'server' | 'cloud' | 'threat' | 'service'
  status: 'safe' | 'compromised' | 'targeted' | 'critical'
  x: number
  y: number
  detail?: string
}

export interface AttackGraphEdge {
  source: string
  target: string
  label: string
  kind: 'access' | 'attack' | 'lateral' | 'exfil' | 'trust'
}

export interface ComplianceControl {
  id: string
  framework: string
  category: string
  control: string
  status: 'compliant' | 'partial' | 'non-compliant' | 'na'
  evidence: string
}

export interface CyberMemoryEntry {
  id: string
  category: 'incident' | 'response' | 'failure' | 'recovery' | 'lesson'
  title: string
  summary: string
  mitreTactic?: string
  severity?: Severity
  lessonLearned: string
  prevention: string
  date: string
}

export interface BusinessImpact {
  asset: string
  assetType: string
  financialLoss: number
  operationalRisk: number
  dataSensitivity: number
  recoveryTime: number
  overall: Severity
}

export interface CriticalAsset {
  id: string
  name: string
  type: string
  criticality: Severity
  exposure: number
  status: 'protected' | 'at-risk' | 'compromised'
}

export interface PredictionPath {
  id: string
  current: string
  next: string
  probability: number
  technique: string
  rationale: string
  timeframe: string
}

// ---------------------------------------------------------------------------
// 10 Specialized AI Agents
// ---------------------------------------------------------------------------
export const AGENTS: CyberAgent[] = [
  {
    id: 'log-intelligence',
    name: 'Log Intelligence',
    role: 'Log Aggregation & Normalization',
    description:
      'Ingests firewall, SIEM, VPN, DNS, email, cloud and endpoint telemetry. Converts raw logs into structured, correlated security events.',
    status: 'online',
    icon: 'ScrollText',
    color: '#10b981',
    metrics: [
      { label: 'Events / min', value: '4,180' },
      { label: 'Sources', value: '14' },
      { label: 'Parse errors', value: '0.02%' },
    ],
    lastOutput:
      'Correlated 3 failed VPN logins + anomalous DNS beaconing from host FIN-WS-227 into a single credential-access event chain.',
    lastUpdate: '12s ago',
  },
  {
    id: 'behavioral',
    name: 'Behavioral Intelligence',
    role: 'UEBA & Anomaly Detection',
    description:
      'Learns normal behavior baselines for users, hosts and sessions, then detects deviations using isolation-forest and autoencoder models.',
    status: 'thinking',
    icon: 'Activity',
    color: '#06b6d4',
    metrics: [
      { label: 'Baselines', value: '3,412' },
      { label: 'Anomalies (24h)', value: '37' },
      { label: 'Confidence', value: '91%' },
    ],
    lastOutput:
      'AutoEncoder reconstruction error 0.81 on svc-backup → off-hours SMB write spike. Flagged as potential staging for exfiltration.',
    lastUpdate: '34s ago',
  },
  {
    id: 'threat-intel',
    name: 'Threat Intelligence',
    role: 'CVE / IOC / Feed Correlation',
    description:
      'Consumes CVE, MISP, OpenCTI, CERT advisories and IOC lists, then maps threats to internal assets and active incidents.',
    status: 'online',
    icon: 'Radar',
    color: '#22d3ee',
    metrics: [
      { label: 'Feeds', value: '22' },
      { label: 'IOCs tracked', value: '48,210' },
      { label: 'Matches (24h)', value: '19' },
    ],
    lastOutput:
      'CVE-2026-1437 (CVSS 9.8) patched on 8/12 affected hosts. 4 remain unpatched on OT-SCADA segment — escalated.',
    lastUpdate: '1m ago',
  },
  {
    id: 'mitre-mapping',
    name: 'MITRE Mapping',
    role: 'ATT&CK Tactic & Technique Mapping',
    description:
      'Automatically maps detected behaviors to MITRE ATT&CK tactics and techniques to reconstruct the full attack chain.',
    status: 'online',
    icon: 'Network',
    color: '#34d399',
    metrics: [
      { label: 'Mappings (24h)', value: '142' },
      { label: 'Chains', value: '6' },
      { label: 'Coverage', value: '88%' },
    ],
    lastOutput:
      'Mapped active chain: T1566 (Phishing) → T1059 (Execution) → T1003 (Credential Dumping) → T1021 (Lateral Movement).',
    lastUpdate: '45s ago',
  },
  {
    id: 'attack-prediction',
    name: 'Attack Prediction',
    role: 'Next-Move Forecasting',
    description:
      'Predicts the attacker’s likely next target and technique using graph-based attack-path modeling, not just what already happened.',
    status: 'alert',
    icon: 'BrainCircuit',
    color: '#f59e0b',
    metrics: [
      { label: 'Paths modeled', value: '128' },
      { label: 'High-prob paths', value: '4' },
      { label: 'Lead time', value: '~22 min' },
    ],
    lastOutput:
      'Predicted next target: db-core-financial (prob 0.78) via T1078 Valid Accounts. Recommended pre-emptive MFA + segmentation.',
    lastUpdate: '8s ago',
  },
  {
    id: 'business-impact',
    name: 'Business Impact',
    role: 'Financial & Operational Risk',
    description:
      'Translates technical findings into production impact, financial loss estimates and operational risk for decision makers.',
    status: 'online',
    icon: 'TrendingDown',
    color: '#f97316',
    metrics: [
      { label: 'Assets scored', value: '12' },
      { label: 'Exposure (24h)', value: '$2.4M' },
      { label: 'Downtime risk', value: '4.1h' },
    ],
    lastOutput:
      'OT-SCADA-grid compromise → est. $1.8M production loss + 4.1h downtime. Grid stability risk: HIGH.',
    lastUpdate: '2m ago',
  },
  {
    id: 'autonomous-response',
    name: 'Autonomous Response',
    role: 'Containment & Playbooks',
    description:
      'Recommends or simulates containment: block IP, disable account, isolate endpoint, revoke token, notify SOC.',
    status: 'alert',
    icon: 'ShieldCheck',
    color: '#ef4444',
    metrics: [
      { label: 'Playbooks', value: '34' },
      { label: 'Actions staged', value: '5' },
      { label: 'Auto-mode', value: 'Simulate' },
    ],
    lastOutput:
      'Staged playbook PB-014: isolate endpoint FIN-WS-227, revoke token for svc-backup, block 91.213.x.x at edge.',
    lastUpdate: '20s ago',
  },
  {
    id: 'executive-copilot',
    name: 'Executive Copilot',
    role: 'Business-Language Risk Briefing',
    description:
      'Answers executive questions in plain business language: “What is today’s cyber risk?” Provides board-ready narratives.',
    status: 'online',
    icon: 'Briefcase',
    color: '#a855f7',
    metrics: [
      { label: 'Briefings today', value: '7' },
      { label: 'Avg latency', value: '2.1s' },
      { label: 'Role', value: 'CISO/CIO' },
    ],
    lastOutput:
      '“Today’s cyber risk is ELEVATED. A credential-access campaign is targeting finance. 2 incidents open, $2.4M exposure.”',
    lastUpdate: '3m ago',
  },
  {
    id: 'compliance',
    name: 'Compliance AI',
    role: 'ISO 27001 / NIST / CIS',
    description:
      'Continuously checks controls against ISO 27001, NIST 800-53 and CIS Controls, generating audit-ready evidence.',
    status: 'online',
    icon: 'ClipboardCheck',
    color: '#14b8a6',
    metrics: [
      { label: 'Frameworks', value: '3' },
      { label: 'Controls', value: '284' },
      { label: 'Gaps', value: '11' },
    ],
    lastOutput:
      'NIST 800-53 AC-6 partial — 3 service accounts retain excessive privileges on db-core-financial. Evidence package generated.',
    lastUpdate: '5m ago',
  },
  {
    id: 'cyber-memory',
    name: 'Organizational Cyber Memory',
    role: 'Incident Learning & Recall',
    description:
      'Remembers every incident, response, failure, recovery and lesson learned — future incidents benefit from past experience.',
    status: 'thinking',
    icon: 'Database',
    color: '#8b5cf6',
    metrics: [
      { label: 'Memories', value: '1,204' },
      { label: 'Recalls (24h)', value: '23' },
      { label: 'Reused lessons', value: '9' },
    ],
    lastOutput:
      'Recalled INC-2049 (Mar 2025): identical T1021 lateral path. Applied lesson — preemptive host isolation reduced MTTR by 38%.',
    lastUpdate: '1m ago',
  },
]

// ---------------------------------------------------------------------------
// MITRE ATT&CK (condensed enterprise matrix)
// ---------------------------------------------------------------------------
export const MITRE_TACTICS: MitreTactic[] = [
  {
    id: 'recon',
    name: 'Reconnaissance',
    techniques: [
      { id: 'T1595', name: 'Active Scanning', tactic: 'Reconnaissance', count: 142, severity: 'low' },
      { id: 'T1592', name: 'Gather Victim Host Info', tactic: 'Reconnaissance', count: 38, severity: 'low' },
    ],
  },
  {
    id: 'initial-access',
    name: 'Initial Access',
    techniques: [
      { id: 'T1566', name: 'Phishing', tactic: 'Initial Access', count: 67, severity: 'high' },
      { id: 'T1190', name: 'Exploit Public App', tactic: 'Initial Access', count: 21, severity: 'high' },
      { id: 'T1078', name: 'Valid Accounts', tactic: 'Initial Access', count: 44, severity: 'medium' },
    ],
  },
  {
    id: 'execution',
    name: 'Execution',
    techniques: [
      { id: 'T1059', name: 'Command & Scripting', tactic: 'Execution', count: 89, severity: 'high' },
      { id: 'T1106', name: 'Native API', tactic: 'Execution', count: 33, severity: 'medium' },
    ],
  },
  {
    id: 'persistence',
    name: 'Persistence',
    techniques: [
      { id: 'T1053', name: 'Scheduled Task/Job', tactic: 'Persistence', count: 18, severity: 'medium' },
      { id: 'T1547', name: 'Boot/Logon Autostart', tactic: 'Persistence', count: 12, severity: 'medium' },
    ],
  },
  {
    id: 'priv-esc',
    name: 'Privilege Escalation',
    techniques: [
      { id: 'T1068', name: 'Exploitation for Priv Esc', tactic: 'Privilege Escalation', count: 14, severity: 'high' },
      { id: 'T1078', name: 'Valid Accounts', tactic: 'Privilege Escalation', count: 9, severity: 'medium' },
    ],
  },
  {
    id: 'defense-evasion',
    name: 'Defense Evasion',
    techniques: [
      { id: 'T1027', name: 'Obfuscated Files', tactic: 'Defense Evasion', count: 41, severity: 'medium' },
      { id: 'T1562', name: 'Impair Defenses', tactic: 'Defense Evasion', count: 17, severity: 'high' },
    ],
  },
  {
    id: 'cred-access',
    name: 'Credential Access',
    techniques: [
      { id: 'T1110', name: 'Brute Force', tactic: 'Credential Access', count: 78, severity: 'medium' },
      { id: 'T1003', name: 'OS Credential Dumping', tactic: 'Credential Access', count: 23, severity: 'critical' },
    ],
  },
  {
    id: 'discovery',
    name: 'Discovery',
    techniques: [
      { id: 'T1046', name: 'Network Service Discovery', tactic: 'Discovery', count: 56, severity: 'low' },
      { id: 'T1087', name: 'Account Discovery', tactic: 'Discovery', count: 29, severity: 'low' },
    ],
  },
  {
    id: 'lateral',
    name: 'Lateral Movement',
    techniques: [
      { id: 'T1021', name: 'Remote Services', tactic: 'Lateral Movement', count: 31, severity: 'high' },
      { id: 'T1072', name: 'Software Deployment Tools', tactic: 'Lateral Movement', count: 8, severity: 'medium' },
    ],
  },
  {
    id: 'collection',
    name: 'Collection',
    techniques: [
      { id: 'T1005', name: 'Data from Local System', tactic: 'Collection', count: 19, severity: 'medium' },
      { id: 'T1119', name: 'Automated Collection', tactic: 'Collection', count: 7, severity: 'medium' },
    ],
  },
  {
    id: 'c2',
    name: 'Command & Control',
    techniques: [
      { id: 'T1071', name: 'Application Layer Protocol', tactic: 'C2', count: 24, severity: 'high' },
      { id: 'T1572', name: 'Protocol Tunneling', tactic: 'C2', count: 11, severity: 'high' },
    ],
  },
  {
    id: 'exfil',
    name: 'Exfiltration',
    techniques: [
      { id: 'T1041', name: 'Exfil over C2 Channel', tactic: 'Exfiltration', count: 6, severity: 'critical' },
      { id: 'T1567', name: 'Exfil to Cloud Storage', tactic: 'Exfiltration', count: 3, severity: 'critical' },
    ],
  },
  {
    id: 'impact',
    name: 'Impact',
    techniques: [
      { id: 'T1486', name: 'Data Encrypted for Impact', tactic: 'Impact', count: 2, severity: 'critical' },
      { id: 'T1490', name: 'Inhibit System Recovery', tactic: 'Impact', count: 1, severity: 'critical' },
    ],
  },
]

// ---------------------------------------------------------------------------
// Threat Intelligence — CVEs, Actors, IOCs
// ---------------------------------------------------------------------------
export const CVES: CVEItem[] = [
  {
    id: 'CVE-2026-1437',
    cvss: 9.8,
    severity: 'critical',
    description: 'RCE in OpenFlow SCADA controller via crafted packet — unauth root.',
    affectedAsset: 'ot-scada-grid',
    exploited: true,
    exploitInWild: true,
    published: '2026-02-04',
  },
  {
    id: 'CVE-2026-1188',
    cvss: 8.6,
    severity: 'high',
    description: 'Auth bypass in enterprise VPN gateway; session token forge.',
    affectedAsset: 'vpn-edge-02',
    exploited: true,
    exploitInWild: true,
    published: '2026-01-22',
  },
  {
    id: 'CVE-2025-9914',
    cvss: 8.1,
    severity: 'high',
    description: 'SQL injection in finance web app billing endpoint.',
    affectedAsset: 'web-prod-01',
    exploited: false,
    exploitInWild: true,
    published: '2026-01-09',
  },
  {
    id: 'CVE-2025-8820',
    cvss: 7.5,
    severity: 'high',
    description: 'Keycloak token replay via crafted JWT audience claim.',
    affectedAsset: 'iam-keycloak',
    exploited: false,
    exploitInWild: false,
    published: '2025-12-18',
  },
  {
    id: 'CVE-2025-7701',
    cvss: 6.8,
    severity: 'medium',
    description: 'SSRF in mail gateway allows internal port enumeration.',
    affectedAsset: 'mail-gateway',
    exploited: false,
    exploitInWild: false,
    published: '2025-12-02',
  },
  {
    id: 'CVE-2025-7104',
    cvss: 5.9,
    severity: 'medium',
    description: 'Privilege escalation in CI runner image build plugin.',
    affectedAsset: 'ci-runner-pool',
    exploited: false,
    exploitInWild: false,
    published: '2025-11-20',
  },
]

export const THREAT_ACTORS: ThreatActor[] = [
  {
    id: 'TA-APT29',
    name: 'APT29 (Cozy Bear)',
    origin: 'RU',
    motive: 'Espionage / Credential Theft',
    ttps: ['T1566', 'T1078', 'T1071', 'T1003'],
    targetSectors: ['Government', 'Critical Infrastructure', 'Defense'],
    threatLevel: 'critical',
  },
  {
    id: 'TA-APT41',
    name: 'APT41 (BARIUM)',
    origin: 'CN',
    motive: 'Espionage + Financial',
    ttps: ['T1190', 'T1059', 'T1027', 'T1041'],
    targetSectors: ['Healthcare', 'Telecom', 'Manufacturing'],
    threatLevel: 'critical',
  },
  {
    id: 'TA-LAZARUS',
    name: 'Lazarus Group',
    origin: 'KP',
    motive: 'Financial / Sabotage',
    ttps: ['T1566', 'T1027', 'T1486', 'T1490'],
    targetSectors: ['Banking', 'Crypto', 'Energy'],
    threatLevel: 'high',
  },
  {
    id: 'TA-APT34',
    name: 'APT34 (OilRig)',
    origin: 'IR',
    motive: 'Espionage',
    ttps: ['T1566', 'T1078', 'T1021', 'T1005'],
    targetSectors: ['Energy', 'Aviation', 'Finance'],
    threatLevel: 'high',
  },
  {
    id: 'TA-SCATTERED',
    name: 'Scattered Spider',
    origin: 'Multi',
    motive: 'Financial / Extortion',
    ttps: ['T1566', 'T1078', 'T1110', 'T1486'],
    targetSectors: ['Tech', 'Hospitality', 'Retail'],
    threatLevel: 'high',
  },
]

export const IOCS: IOCItem[] = [
  {
    id: 'ioc-1',
    type: 'ip',
    value: '91.213.50.114',
    confidence: 98,
    source: 'MISP',
    firstSeen: '2026-02-10',
    tags: ['C2', 'APT29', 'cobalt-strike'],
  },
  {
    id: 'ioc-2',
    type: 'domain',
    value: 'secure-update-microsoft.io',
    confidence: 95,
    source: 'OpenCTI',
    firstSeen: '2026-02-09',
    tags: ['phishing', 'typosquat'],
  },
  {
    id: 'ioc-3',
    type: 'hash',
    value: 'a3f9c1d7e8b2...4f02 (SHA-256)',
    confidence: 92,
    source: 'EDR',
    firstSeen: '2026-02-08',
    tags: ['malware', 'loader', 'fileless'],
  },
  {
    id: 'ioc-4',
    type: 'url',
    value: 'https://cdn.fastcdn.io/x/payload.bin',
    confidence: 88,
    source: 'Threat Feed',
    firstSeen: '2026-02-07',
    tags: ['stager', 'second-stage'],
  },
  {
    id: 'ioc-5',
    type: 'email',
    value: 'finance-payroll@vendor-invoice.cc',
    confidence: 90,
    source: 'Mail Gateway',
    firstSeen: '2026-02-06',
    tags: ['BEC', 'phishing'],
  },
  {
    id: 'ioc-6',
    type: 'ip',
    value: '45.142.122.91',
    confidence: 84,
    source: 'AlienVault OTX',
    firstSeen: '2026-02-05',
    tags: ['scanner', 'recon'],
  },
]

// ---------------------------------------------------------------------------
// Attack Graph — nodes positioned for an SVG/flow visualization
// ---------------------------------------------------------------------------
export const ATTACK_GRAPH_NODES: AttackGraphNode[] = [
  { id: 'u-finance', label: 'Finance Analyst', type: 'user', status: 'compromised', x: 80, y: 120, detail: 'FIN-WS-227 · phished' },
  { id: 'u-admin', label: 'Domain Admin', type: 'user', status: 'targeted', x: 80, y: 320, detail: 'Token reuse risk' },
  { id: 'd-ws227', label: 'FIN-WS-227', type: 'device', status: 'compromised', x: 260, y: 120, detail: 'EDR: suspicious child proc' },
  { id: 'd-backup', label: 'svc-backup', type: 'device', status: 'compromised', x: 260, y: 300, detail: 'Off-hours SMB write spike' },
  { id: 's-web', label: 'web-prod-01', type: 'server', status: 'safe', x: 470, y: 80, detail: 'WAF active' },
  { id: 's-db', label: 'db-core-financial', type: 'server', status: 'critical', x: 470, y: 220, detail: 'Predicted next target' },
  { id: 's-ad', label: 'ad-controller-03', type: 'server', status: 'targeted', x: 470, y: 360, detail: 'LSASS access observed' },
  { id: 'c-k8s', label: 'cloud-k8s-cluster', type: 'cloud', status: 'safe', x: 700, y: 120, detail: 'RBAC enforced' },
  { id: 'ot-scada', label: 'ot-scada-grid', type: 'service', status: 'critical', x: 700, y: 280, detail: 'CVE-2026-1437 unpatched' },
  { id: 't-attacker', label: 'Threat Actor APT29', type: 'threat', status: 'compromised', x: 700, y: 420, detail: 'C2: 91.213.50.114' },
]

export const ATTACK_GRAPH_EDGES: AttackGraphEdge[] = [
  { source: 't-attacker', target: 'u-finance', label: 'T1566 Phish', kind: 'attack' },
  { source: 'u-finance', target: 'd-ws227', label: 'owns', kind: 'trust' },
  { source: 'd-ws227', target: 's-ad', label: 'T1003 LSASS', kind: 'lateral' },
  { source: 'd-ws227', target: 'd-backup', label: 'T1021 SMB', kind: 'lateral' },
  { source: 'd-backup', target: 's-db', label: 'T1078 Valid Acct', kind: 'lateral' },
  { source: 's-ad', target: 'u-admin', label: 'credential theft', kind: 'attack' },
  { source: 's-db', target: 'ot-scada', label: 'T1021 predicted', kind: 'attack' },
  { source: 's-web', target: 'c-k8s', label: 'api access', kind: 'access' },
  { source: 'u-admin', target: 'c-k8s', label: 'admin token', kind: 'trust' },
  { source: 's-db', target: 't-attacker', label: 'T1041 exfil risk', kind: 'exfil' },
]

// ---------------------------------------------------------------------------
// Attack Prediction Paths
// ---------------------------------------------------------------------------
export const PREDICTION_PATHS: PredictionPath[] = [
  {
    id: 'p1',
    current: 'FIN-WS-227 (compromised)',
    next: 'db-core-financial',
    probability: 0.78,
    technique: 'T1078 Valid Accounts',
    rationale:
      'svc-backup token already in use; DB accepts backup-svc credentials. Shortest path with valid creds on graph.',
    timeframe: '~22 min',
  },
  {
    id: 'p2',
    current: 'ad-controller-03 (targeted)',
    next: 'Domain Admin account',
    probability: 0.64,
    technique: 'T1003.001 LSASS Memory',
    rationale:
      'LSASS memory access observed. dcsync privileges attainable via cached krbtgt-derived tickets.',
    timeframe: '~40 min',
  },
  {
    id: 'p3',
    current: 'db-core-financial (critical)',
    next: 'ot-scada-grid',
    probability: 0.52,
    technique: 'T1021 Remote Services',
    rationale:
      'OT segment reachable via legacy trust. CVE-2026-1437 unpatched on 4 hosts — high-impact pivot.',
    timeframe: '~1.5 hr',
  },
  {
    id: 'p4',
    current: 'svc-backup (compromised)',
    next: 'Cloud object storage',
    probability: 0.41,
    technique: 'T1567 Exfil to Cloud',
    rationale:
      'Backup service holds cloud KMS key. Staged data observable in temp staging dir.',
    timeframe: '~2 hr',
  },
]

// ---------------------------------------------------------------------------
// Business Impact
// ---------------------------------------------------------------------------
export const BUSINESS_IMPACT: BusinessImpact[] = [
  { asset: 'ot-scada-grid', assetType: 'OT/SCADA', financialLoss: 1800000, operationalRisk: 92, dataSensitivity: 70, recoveryTime: 41, overall: 'critical' },
  { asset: 'db-core-financial', assetType: 'Database', financialLoss: 950000, operationalRisk: 88, dataSensitivity: 96, recoveryTime: 18, overall: 'critical' },
  { asset: 'ad-controller-03', assetType: 'Identity', financialLoss: 420000, operationalRisk: 80, dataSensitivity: 85, recoveryTime: 12, overall: 'high' },
  { asset: 'iam-keycloak', assetType: 'IAM', financialLoss: 310000, operationalRisk: 72, dataSensitivity: 88, recoveryTime: 9, overall: 'high' },
  { asset: 'web-prod-01', assetType: 'Web App', financialLoss: 180000, operationalRisk: 60, dataSensitivity: 55, recoveryTime: 6, overall: 'medium' },
  { asset: 'cloud-k8s-cluster', assetType: 'Cloud', financialLoss: 240000, operationalRisk: 68, dataSensitivity: 72, recoveryTime: 8, overall: 'medium' },
  { asset: 'vpn-edge-02', assetType: 'Network', financialLoss: 90000, operationalRisk: 55, dataSensitivity: 40, recoveryTime: 4, overall: 'medium' },
  { asset: 'mail-gateway', assetType: 'Service', financialLoss: 45000, operationalRisk: 40, dataSensitivity: 50, recoveryTime: 3, overall: 'low' },
]

// ---------------------------------------------------------------------------
// Critical Assets
// ---------------------------------------------------------------------------
export const CRITICAL_ASSETS: CriticalAsset[] = [
  { id: 'a1', name: 'ot-scada-grid', type: 'OT/SCADA Controller', criticality: 'critical', exposure: 92, status: 'compromised' },
  { id: 'a2', name: 'db-core-financial', type: 'Core Financial DB', criticality: 'critical', exposure: 88, status: 'at-risk' },
  { id: 'a3', name: 'ad-controller-03', type: 'Active Directory', criticality: 'critical', exposure: 76, status: 'at-risk' },
  { id: 'a4', name: 'iam-keycloak', type: 'Identity Provider', criticality: 'high', exposure: 64, status: 'at-risk' },
  { id: 'a5', name: 'cloud-k8s-cluster', type: 'Kubernetes', criticality: 'high', exposure: 48, status: 'protected' },
  { id: 'a6', name: 'web-prod-01', type: 'Public Web App', criticality: 'high', exposure: 58, status: 'protected' },
  { id: 'a7', name: 'vpn-edge-02', type: 'VPN Gateway', criticality: 'medium', exposure: 52, status: 'at-risk' },
  { id: 'a8', name: 'backup-vault', type: 'Backup Vault', criticality: 'high', exposure: 60, status: 'at-risk' },
  { id: 'a9', name: 'mail-gateway', type: 'Mail Gateway', criticality: 'medium', exposure: 44, status: 'protected' },
  { id: 'a10', name: 'ci-runner-pool', type: 'CI/CD', criticality: 'medium', exposure: 38, status: 'protected' },
]

// ---------------------------------------------------------------------------
// Compliance
// ---------------------------------------------------------------------------
export const COMPLIANCE: ComplianceControl[] = [
  { id: 'c1', framework: 'ISO 27001', category: 'Access Control', control: 'A.9.2.3 Mgmt of privileged access', status: 'partial', evidence: '3 service accounts retain excessive DB privileges' },
  { id: 'c2', framework: 'ISO 27001', category: 'Cryptography', control: 'A.10.1.2 Key management', status: 'compliant', evidence: 'KMS rotation 90-day, last rotated 2026-01-30' },
  { id: 'c3', framework: 'ISO 27001', category: 'Operations', control: 'A.12.4.1 Event logging', status: 'compliant', evidence: 'SIEM ingesting 14 sources, 4.2k events/min' },
  { id: 'c4', framework: 'NIST 800-53', category: 'Access Control', control: 'AC-6 Least Privilege', status: 'partial', evidence: 'svc-backup has DB write — violates least privilege' },
  { id: 'c5', framework: 'NIST 800-53', category: 'Incident Response', control: 'IR-4 Incident Handling', status: 'compliant', evidence: '34 playbooks, avg MTTR 14m' },
  { id: 'c6', framework: 'NIST 800-53', category: 'System & Info Integrity', control: 'SI-3 Malicious Code', status: 'compliant', evidence: 'EDR deployed 100% endpoints' },
  { id: 'c7', framework: 'NIST 800-53', category: 'Configuration', control: 'CM-7 Least Functionality', status: 'non-compliant', evidence: 'OT segment permits legacy SMBv1' },
  { id: 'c8', framework: 'CIS Controls v8', category: 'Asset Inventory', control: 'CIS 1 — Inventory of Enterprise Assets', status: 'compliant', evidence: '12 critical assets tracked, 100% coverage' },
  { id: 'c9', framework: 'CIS Controls v8', category: 'Data Protection', control: 'CIS 3 — Data Protection', status: 'partial', evidence: 'Backup vault encryption OK; key rotation overdue' },
  { id: 'c10', framework: 'CIS Controls v8', category: 'Malware Defenses', control: 'CIS 10 — Malware Defenses', status: 'compliant', evidence: 'EDR + sandbox detonation active' },
  { id: 'c11', framework: 'CIS Controls v8', category: 'Network Monitoring', control: 'CIS 13 — Network Monitoring', status: 'partial', evidence: 'Zeek on edge; internal east-west visibility gap' },
  { id: 'c12', framework: 'ISO 27001', category: 'Supplier', control: 'A.15.1.1 Supplier risk', status: 'na', evidence: 'No critical SaaS supplier assessed this quarter' },
]

export const COMPLIANCE_SUMMARY = [
  { framework: 'ISO 27001', compliant: 2, partial: 1, nonCompliant: 0, na: 1, total: 4 },
  { framework: 'NIST 800-53', compliant: 2, partial: 1, nonCompliant: 1, na: 0, total: 4 },
  { framework: 'CIS Controls v8', compliant: 2, partial: 2, nonCompliant: 0, na: 0, total: 4 },
]

// ---------------------------------------------------------------------------
// Cyber Memory — Organizational Learning
// ---------------------------------------------------------------------------
export const CYBER_MEMORY: CyberMemoryEntry[] = [
  {
    id: 'cm1',
    category: 'incident',
    title: 'INC-2049 — Lateral Movement via svc-backup',
    summary: 'Attacker pivoted from phished endpoint to DB using backup service credentials.',
    mitreTactic: 'Lateral Movement',
    severity: 'high',
    lessonLearned:
      'Service accounts with DB write privileges are high-value pivots. Network segmentation between backup VLAN and DB tier must be enforced.',
    prevention: 'Preemptive host isolation when svc-backup shows off-hours SMB write spike. Revoke & rotate backup token.',
    date: '2025-03-12',
  },
  {
    id: 'cm2',
    category: 'failure',
    title: 'Missed LSASS access on ad-controller',
    summary: 'EDR alert was suppressed as low-fidelity; led to full domain compromise.',
    mitreTactic: 'Credential Access',
    severity: 'critical',
    lessonLearned:
      'Credential-dumping signals on domain controllers must never be auto-suppressed. Tune detection rather than mute.',
    prevention: 'LSASS access alerts on DCs = critical severity, always page SOC L2.',
    date: '2025-06-28',
  },
  {
    id: 'cm3',
    category: 'response',
    title: 'Playbook PB-014 reduced MTTR 38%',
    summary: 'Auto-isolate + token revoke + edge block contained campaign in 9 minutes.',
    mitreTactic: 'Credential Access',
    severity: 'high',
    lessonLearned:
      'Combined endpoint isolation + token revocation is the fastest containment for credential-based lateral movement.',
    prevention: 'Promote PB-014 to auto-execute on confidence ≥ 0.85.',
    date: '2025-09-04',
  },
  {
    id: 'cm4',
    category: 'recovery',
    title: 'OT-SCADA recovery took 41h',
    summary: 'No tested OT recovery runbook; manual vendor engagement delayed restoration.',
    mitreTactic: 'Impact',
    severity: 'critical',
    lessonLearned:
      'OT recovery requires pre-staged vendor SLA + golden config backups. IT DR runbooks do not transfer to OT.',
    prevention: 'Quarterly OT recovery drill; vendor 4-hour SLA contracted.',
    date: '2025-11-19',
  },
  {
    id: 'cm5',
    category: 'lesson',
    title: 'Phishing payloads increasingly fileless',
    summary: '6/8 recent phishes used LOLBins; signature AV missed all.',
    mitreTactic: 'Execution',
    severity: 'medium',
    lessonLearned:
      'Behavioral EDR + parent-child process anomaly detection outperforms signatures for fileless payloads.',
    prevention: 'Enable EDR behavioral ruleset; block Office macro child processes spawning shells.',
    date: '2026-01-15',
  },
  {
    id: 'cm6',
    category: 'incident',
    title: 'INC-2102 — Cloud key exfiltration attempt',
    summary: 'svc-backup held cloud KMS key; attacker staged data before exfil window.',
    mitreTactic: 'Exfiltration',
    severity: 'high',
    lessonLearned:
      'Long-lived cloud keys in service accounts are a primary exfil vector. Use short-lived workload identity.',
    prevention: 'Migrate svc-backup to workload identity federation; remove static KMS key.',
    date: '2026-02-01',
  },
]

// ---------------------------------------------------------------------------
// Static dashboard seed incidents (also seeded to DB on first load)
// ---------------------------------------------------------------------------
export const SEED_INCIDENTS = [
  {
    title: 'Credential-access campaign targeting Finance',
    description:
      'Correlated phishing + brute-force + LSASS access chain against finance department. Attacker pivoting via svc-backup.',
    severity: 'critical',
    status: 'investigating',
    source: 'agent',
    mitreTactic: 'Credential Access',
    mitreTechnique: 'T1003',
    assetAffected: 'ad-controller-03',
    attackerIp: '91.213.50.114',
    riskScore: 91,
    assignedTo: 'SOC L2',
  },
  {
    title: 'OT-SCADA unpatched CVE-2026-1437',
    description:
      '4/12 OT-SCADA hosts unpatched against critical RCE. Exploit observed in the wild, mapped to active threat actor APT29.',
    severity: 'critical',
    status: 'open',
    source: 'threat-intel',
    mitreTactic: 'Initial Access',
    mitreTechnique: 'T1190',
    assetAffected: 'ot-scada-grid',
    attackerIp: 'unknown',
    riskScore: 96,
    assignedTo: 'OT Engineering',
  },
  {
    title: 'Anomalous off-hours SMB writes on svc-backup',
    description:
      'Behavioral agent flagged 312% baseline deviation on backup service. Staging directory created with encrypted blobs.',
    severity: 'high',
    status: 'investigating',
    source: 'behavioral',
    mitreTactic: 'Collection',
    mitreTechnique: 'T1005',
    assetAffected: 'backup-vault',
    attackerIp: 'internal',
    riskScore: 78,
    assignedTo: 'SOC L1',
  },
  {
    title: 'VPN gateway auth bypass attempts',
    description: 'Repeated token-forge attempts against vpn-edge-02. CVE-2026-1188 exploited in the wild.',
    severity: 'high',
    status: 'contained',
    source: 'siem',
    mitreTactic: 'Initial Access',
    mitreTechnique: 'T1190',
    assetAffected: 'vpn-edge-02',
    attackerIp: '45.142.122.91',
    riskScore: 72,
    assignedTo: 'Network Ops',
  },
  {
    title: 'Phishing payload — fileless LOLBin execution',
    description: 'Finance analyst opened macro-laden invoice; powershell child process spawned from winword.exe.',
    severity: 'high',
    status: 'contained',
    source: 'edr',
    mitreTactic: 'Execution',
    mitreTechnique: 'T1059',
    assetAffected: 'FIN-WS-227',
    attackerIp: '91.213.50.114',
    riskScore: 68,
    assignedTo: 'SOC L1',
  },
  {
    title: 'Keycloak JWT audience replay probe',
    description: 'Automated probing of iam-keycloak with crafted JWT audience claims. CVE-2025-8820.',
    severity: 'medium',
    status: 'investigating',
    source: 'siem',
    mitreTactic: 'Defense Evasion',
    mitreTechnique: 'T1550',
    assetAffected: 'iam-keycloak',
    attackerIp: '203.0.113.55',
    riskScore: 54,
    assignedTo: 'SOC L1',
  },
  {
    title: 'DNS tunneling beacon to known C2',
    description: 'Host FIN-WS-227 beaconing to 91.213.50.114 via DNS TXT queries every 60s.',
    severity: 'critical',
    status: 'open',
    source: 'agent',
    mitreTactic: 'Command & Control',
    mitreTechnique: 'T1071',
    assetAffected: 'FIN-WS-227',
    attackerIp: '91.213.50.114',
    riskScore: 88,
    assignedTo: 'SOC L2',
  },
]

// ---------------------------------------------------------------------------
// Autonomous response playbooks
// ---------------------------------------------------------------------------
export const RESPONSE_PLAYBOOKS = [
  { id: 'PB-014', name: 'Credential Lateral Movement', trigger: 'T1003 + T1021 chain', actions: ['Isolate endpoint', 'Revoke svc token', 'Block source IP at edge', 'Page SOC L2'], confidence: 0.91, status: 'staged' },
  { id: 'PB-007', name: 'OT Critical CVE', trigger: 'CVE-2026-1437 + OT asset', actions: ['Quarantine unpatched hosts', 'Enable OT segment firewall deny', 'Notify OT Engineering', 'File ticket'], confidence: 0.96, status: 'staged' },
  { id: 'PB-021', name: 'Data Exfiltration', trigger: 'T1041 + outbound anomaly', actions: ['Block egress domain', 'Throttle DNS', 'Capture PCAP', 'Engage IR'], confidence: 0.84, status: 'ready' },
  { id: 'PB-003', name: 'Phishing — Fileless', trigger: 'T1566 + LOLBin exec', actions: ['Isolate endpoint', 'Reset user creds', 'Sweep mailboxes', 'Block sender domain'], confidence: 0.88, status: 'ready' },
  { id: 'PB-029', name: 'Cloud Key Abuse', trigger: 'KMS key + anomalous API', actions: ['Revoke static key', 'Rotate KMS', 'Force workload identity', 'Audit S3 access'], confidence: 0.79, status: 'ready' },
]

// ---------------------------------------------------------------------------
// Threat map origins (for the world attack map)
// ---------------------------------------------------------------------------
export const THREAT_MAP_ORIGINS = [
  { country: 'Russia', code: 'RU', lat: 55, lon: 60, count: 412, severity: 'critical' },
  { country: 'China', code: 'CN', lat: 35, lon: 105, count: 388, severity: 'critical' },
  { country: 'North Korea', code: 'KP', lat: 40, lon: 127, count: 156, severity: 'high' },
  { country: 'Iran', code: 'IR', lat: 32, lon: 53, count: 142, severity: 'high' },
  { country: 'Brazil', code: 'BR', lat: -10, lon: -55, count: 98, severity: 'medium' },
  { country: 'Vietnam', code: 'VN', lat: 16, lon: 106, count: 87, severity: 'medium' },
  { country: 'India', code: 'IN', lat: 22, lon: 78, count: 76, severity: 'medium' },
  { country: 'Netherlands', code: 'NL', lat: 52, lon: 5, count: 64, severity: 'low' },
  { country: 'Ukraine', code: 'UA', lat: 49, lon: 32, count: 58, severity: 'medium' },
  { country: 'United States', code: 'US', lat: 38, lon: -97, count: 121, severity: 'medium' },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export const SEVERITY_COLORS: Record<Severity, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#10b981',
}

export const STATUS_COLORS: Record<string, string> = {
  compliant: '#10b981',
  protected: '#10b981',
  safe: '#10b981',
  partial: '#f59e0b',
  'at-risk': '#f59e0b',
  targeted: '#f97316',
  'non-compliant': '#ef4444',
  compromised: '#ef4444',
  critical: '#ef4444',
  na: '#64748b',
}

export function severityRank(s: string): number {
  return { critical: 4, high: 3, medium: 2, low: 1 }[s as Severity] ?? 0
}
