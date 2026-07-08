import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    service: "CyberMind AI — AICDOS",
    status: "online",
    endpoints: [
      "/api/dashboard",
      "/api/agents",
      "/api/threats",
      "/api/mitre",
      "/api/incidents",
      "/api/attack-graph",
      "/api/compliance",
      "/api/cyber-memory",
      "/api/chat",
      "/api/agent-analyze",
      "/api/report",
    ],
    realtime: "ws:///?XTransformPort=3003 (Socket.IO threat stream)",
  });
}
