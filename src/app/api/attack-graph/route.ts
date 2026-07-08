import { NextResponse } from 'next/server'
import {
  ATTACK_GRAPH_NODES,
  ATTACK_GRAPH_EDGES,
  PREDICTION_PATHS,
  BUSINESS_IMPACT,
  CRITICAL_ASSETS,
} from '@/lib/cyber-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    nodes: ATTACK_GRAPH_NODES,
    edges: ATTACK_GRAPH_EDGES,
    predictions: PREDICTION_PATHS,
    businessImpact: BUSINESS_IMPACT,
    criticalAssets: CRITICAL_ASSETS,
  })
}
