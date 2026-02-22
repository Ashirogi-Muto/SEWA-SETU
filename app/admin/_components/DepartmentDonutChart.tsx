'use client'

/* Pure CSS doughnut via conic-gradient. No Recharts/Chart.js. */
const SEGMENTS = [
  { name: 'PWD', value: 45, color: '#3B82F6' },
  { name: 'UPPCL', value: 30, color: '#F97316' },
  { name: 'Sanitation', value: 15, color: '#22C55E' },
  { name: 'Others', value: 10, color: '#A855F7' },
]

function buildConicGradient() {
  let acc = 0
  const parts = SEGMENTS.map(({ value, color }) => {
    const start = acc
    acc += value
    return `${color} ${start}% ${acc}%`
  })
  return `conic-gradient(from 0deg, ${parts.join(', ')})`
}

export default function DepartmentDonutChart() {
  return (
    <div className="h-[220px] w-full relative flex items-center justify-center">
      <div
        className="w-[180px] h-[180px] rounded-full shrink-0"
        style={{
          background: buildConicGradient(),
          mask: 'radial-gradient(circle, transparent 55%, black 55%)',
          WebkitMask: 'radial-gradient(circle, transparent 55%, black 55%)',
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <span className="text-2xl font-bold text-slate-800">1,245</span>
          <span className="block text-xs text-slate-500 font-medium">Issues</span>
        </div>
      </div>
    </div>
  )
}

export { SEGMENTS }
