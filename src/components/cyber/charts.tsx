'use client'

// Lightweight pure-SVG charts to avoid the heavy recharts dependency
// (recharts compile was OOM-killing the dev server in this memory-constrained sandbox).

interface Series {
  key: string
  color: string
  gradientId?: string
}

/** Stacked-area style line chart with gradient fills. */
export function MiniAreaChart({
  data,
  series,
  height = 220,
  yTicks = 4,
}: {
  data: Record<string, any>[]
  series: Series[]
  height?: number
  yTicks?: number
}) {
  const W = 600
  const H = height
  const padL = 36
  const padR = 8
  const padT = 8
  const padB = 20
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const allVals = data.flatMap((d) => series.map((s) => Number(d[s.key]) || 0))
  const maxVal = Math.max(...allVals, 1)
  const niceMax = Math.ceil(maxVal / 1000) * 1000 || maxVal

  const x = (i: number) => padL + (i / (data.length - 1 || 1)) * innerW
  const y = (v: number) => padT + innerH - (v / niceMax) * innerH

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        {series.map((s, i) => (
          <linearGradient key={i} id={s.gradientId ?? `grad-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity={0.45} />
            <stop offset="100%" stopColor={s.color} stopOpacity={0} />
          </linearGradient>
        ))}
      </defs>

      {/* grid + y ticks */}
      {Array.from({ length: yTicks + 1 }).map((_, i) => {
        const val = (niceMax / yTicks) * i
        const yy = y(val)
        return (
          <g key={i}>
            <line x1={padL} y1={yy} x2={W - padR} y2={yy} stroke="oklch(1 0 0 / 0.06)" strokeWidth="1" />
            <text x={padL - 4} y={yy + 3} fill="#64748b" fontSize="9" textAnchor="end">
              {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toFixed(0)}
            </text>
          </g>
        )
      })}

      {/* x ticks (every 3rd) */}
      {data.map((d, i) =>
        i % 3 === 0 ? (
          <text key={i} x={x(i)} y={H - 6} fill="#64748b" fontSize="9" textAnchor="middle">
            {d._x ?? ''}
          </text>
        ) : null
      )}

      {series.map((s, si) => {
        const pts = data.map((d, i) => `${x(i)},${y(Number(d[s.key]) || 0)}`)
        const linePath = `M ${pts.join(' L ')}`
        const areaPath = `${linePath} L ${x(data.length - 1)},${y(0)} L ${x(0)},${y(0)} Z`
        return (
          <g key={si}>
            <path d={areaPath} fill={`url(#${s.gradientId ?? `grad-${si}`})`} />
            <path d={linePath} fill="none" stroke={s.color} strokeWidth="2" />
          </g>
        )
      })}
    </svg>
  )
}

/** Vertical or horizontal bar chart. */
export function MiniBarChart({
  data,
  dataKey,
  nameKey,
  height = 220,
  horizontal = false,
  color,
  colors,
}: {
  data: Record<string, any>[]
  dataKey: string
  nameKey: string
  height?: number
  horizontal?: boolean
  color?: string
  colors?: string[]
}) {
  const W = 600
  const H = height
  const padL = horizontal ? 90 : 30
  const padR = 8
  const padT = 8
  const padB = 20
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const vals = data.map((d) => Number(d[dataKey]) || 0)
  const maxVal = Math.max(...vals, 1)

  if (horizontal) {
    const barH = innerH / data.length - 6
    const x = (v: number) => (v / maxVal) * innerW
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        {data.map((d, i) => {
          const v = Number(d[dataKey]) || 0
          const yy = padT + i * (innerH / data.length) + 3
          const c = colors?.[i % colors.length] ?? color ?? '#06b6d4'
          return (
            <g key={i}>
              <text x={padL - 6} y={yy + barH / 2 + 3} fill="#94a3b8" fontSize="10" textAnchor="end">
                {d[nameKey]}
              </text>
              <rect x={padL} y={yy} width={x(v)} height={barH} fill={c} rx="2" opacity="0.85" />
              <text x={padL + x(v) + 4} y={yy + barH / 2 + 3} fill="#e2e8f0" fontSize="9">
                {v}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  const barW = innerW / data.length - 8
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      {Array.from({ length: 5 }).map((_, i) => {
        const val = (maxVal / 4) * i
        const yy = padT + innerH - (val / maxVal) * innerH
        return (
          <g key={i}>
            <line x1={padL} y1={yy} x2={W - padR} y2={yy} stroke="oklch(1 0 0 / 0.06)" />
            <text x={padL - 4} y={yy + 3} fill="#64748b" fontSize="9" textAnchor="end">
              {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toFixed(0)}
            </text>
          </g>
        )
      })}
      {data.map((d, i) => {
        const v = Number(d[dataKey]) || 0
        const xx = padL + i * (innerW / data.length) + 4
        const bh = (v / maxVal) * innerH
        const c = colors?.[i % colors.length] ?? color ?? '#10b981'
        return (
          <g key={i}>
            <rect x={xx} y={padT + innerH - bh} width={barW} height={bh} fill={c} rx="2" opacity="0.85" />
            <text x={xx + barW / 2} y={H - 6} fill="#94a3b8" fontSize="9" textAnchor="middle">
              {d[nameKey]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Stacked bar chart (for compliance posture). */
export function MiniStackedBar({
  data,
  categories,
  colors,
  height = 220,
}: {
  data: { label: string; [k: string]: any }[]
  categories: { key: string; label: string }[]
  colors: string[]
  height?: number
}) {
  const W = 600
  const H = height
  const padL = 30
  const padR = 8
  const padT = 8
  const padB = 24
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const totals = data.map((d) => categories.reduce((s, c) => s + (Number(d[c.key]) || 0), 0))
  const maxTotal = Math.max(...totals, 1)
  const barW = innerW / data.length - 24

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      {Array.from({ length: 5 }).map((_, i) => {
        const val = (maxTotal / 4) * i
        const yy = padT + innerH - (val / maxTotal) * innerH
        return (
          <g key={i}>
            <line x1={padL} y1={yy} x2={W - padR} y2={yy} stroke="oklch(1 0 0 / 0.06)" />
            <text x={padL - 4} y={yy + 3} fill="#64748b" fontSize="9" textAnchor="end">
              {val}
            </text>
          </g>
        )
      })}
      {data.map((d, i) => {
        const xx = padL + i * (innerW / data.length) + 12
        let acc = 0
        return (
          <g key={i}>
            {categories.map((c, ci) => {
              const v = Number(d[c.key]) || 0
              const segH = (v / maxTotal) * innerH
              const yy = padT + innerH - acc - segH
              acc += segH
              return <rect key={c.key} x={xx} y={yy} width={barW} height={segH} fill={colors[ci % colors.length]} opacity="0.88" />
            })}
            <text x={xx + barW / 2} y={H - 8} fill="#94a3b8" fontSize="10" textAnchor="middle">
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
