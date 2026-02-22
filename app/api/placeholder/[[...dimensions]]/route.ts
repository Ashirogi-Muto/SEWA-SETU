import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/placeholder/1200/800 - Placeholder image for heatmap map/issue images.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ dimensions?: string[] }> }
) {
  const { dimensions } = await params
  const width = dimensions?.[0] ? parseInt(dimensions[0], 10) : 600
  const height = dimensions?.[1] ? parseInt(dimensions[1], 10) : 400
  const w = Number.isNaN(width) ? 600 : Math.min(2000, Math.max(1, width))
  const h = Number.isNaN(height) ? 400 : Math.min(2000, Math.max(1, height))
  const url = `https://placehold.co/${w}x${h}/0f172a/475569?text=Map`
  const res = await fetch(url)
  if (!res.ok) return new NextResponse(null, { status: 502 })
  const blob = await res.arrayBuffer()
  return new NextResponse(blob, {
    headers: { 'Content-Type': res.headers.get('Content-Type') || 'image/png' },
  })
}
