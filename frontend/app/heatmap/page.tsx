'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HeatmapPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Issue Heatmap</h1>
        <p className="text-muted-foreground">
          Visualize civic issues across the city (Coming Soon)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Interactive Map</CardTitle>
          <CardDescription>
            Real-time visualization of reported issues with severity-based heatmap
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[600px] bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Heatmap Coming Soon</h3>
              <p className="text-muted-foreground max-w-md">
                Interactive Leaflet map with cluster visualization, severity-based color coding,
                and real-time updates will be integrated here.
              </p>
              <div className="mt-6 space-y-2 text-sm text-left max-w-md mx-auto">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span>High Severity (7-10)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span>Medium Severity (4-6)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span>Low Severity (1-3)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>✓ Cluster markers for density</div>
            <div>✓ Severity-based color coding</div>
            <div>✓ Filter by category & status</div>
            <div>✓ Real-time updates</div>
            <div>✓ Click for issue details</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technologies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>• React Leaflet</div>
            <div>• OpenStreetMap tiles</div>
            <div>• Marker clustering</div>
            <div>• WebSocket for live data</div>
            <div>• Geolocation API</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>• Issue density by ward</div>
            <div>• Response time metrics</div>
            <div>• Department performance</div>
            <div>• Temporal patterns</div>
            <div>• Resolution rate trends</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
