'use client'

export interface ChartSegment {
  name: string
  value: number
  color: string
}

function buildConicGradient(segments: ChartSegment[]) {
  let acc = 0
  const parts = segments.map(({ value, color }) => {
    const start = acc
    acc += value
    return `${color} ${start}% ${acc}%`
  })
  return `conic-gradient(from 0deg, ${parts.join(', ')})`
}

export default function DepartmentDonutChart({ segments, total }: { segments: ChartSegment[], total: number }) {
  if (!segments || segments.length === 0) return null

  return (
    <div className="h-[220px] w-full relative flex items-center justify-center">
      <div
        className="w-[180px] h-[180px] rounded-full shrink-0"
        style={{
          background: buildConicGradient(segments),
          mask: 'radial-gradient(circle, transparent 55%, black 55%)',
          WebkitMask: 'radial-gradient(circle, transparent 55%, black 55%)',
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <span className="text-2xl font-bold text-slate-800 dark:text-white">{total}</span>
          <span className="block text-xs text-slate-500 dark:text-gray-400 font-medium">Issues</span>
        </div>
      </div>
    </div>
  )
}
