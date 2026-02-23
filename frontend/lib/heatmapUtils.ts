import L from 'leaflet'

/**
 * Computes the dynamic `max` intensity for a leaflet.heat layer based on
 * the density of points visible in the current map viewport.
 *
 * Divides the visible area into a grid of cells, counts points per cell,
 * and returns the maximum count. This means the densest visible area
 * becomes the "hottest" and all others are relative to it.
 *
 * @param map - Leaflet map instance
 * @param points - Array of [lat, lng, intensity] tuples
 * @param gridSize - Number of cells per axis (default 15, giving 15×15 grid)
 * @returns The max density value (minimum 1 to avoid division by zero)
 */
export function computeViewportMax(
    map: L.Map,
    points: [number, number, number][],
    gridSize: number = 15
): number {
    const bounds = map.getBounds()
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()

    const latRange = ne.lat - sw.lat
    const lngRange = ne.lng - sw.lng

    if (latRange <= 0 || lngRange <= 0) return 1

    const cellLat = latRange / gridSize
    const cellLng = lngRange / gridSize

    // Count points per grid cell (only those in viewport)
    const grid: Record<string, number> = {}

    for (const [lat, lng] of points) {
        if (lat < sw.lat || lat > ne.lat || lng < sw.lng || lng > ne.lng) continue
        const row = Math.floor((lat - sw.lat) / cellLat)
        const col = Math.floor((lng - sw.lng) / cellLng)
        const key = `${row}_${col}`
        grid[key] = (grid[key] || 0) + 1
    }

    const counts = Object.values(grid)
    if (counts.length === 0) return 1

    return Math.max(1, Math.max(...counts))
}
