import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to SewaSetu
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          AI-powered civic issue reporting with intelligent triage, gamified engagement, and real-time impact tracking
        </p>
        <Link href="/report">
          <Button size="lg" className="text-lg px-8 py-6">
            Report an Issue
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <Card>
          <CardHeader>
            <CardTitle>📸 Smart Reporting</CardTitle>
            <CardDescription>Photo + Voice powered by AI</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Upload a photo and voice note. Our AI analyzes severity, categorizes issues, and routes to the right department.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🎯 Intelligent Triage</CardTitle>
            <CardDescription>Sarvam + Cloudflare + Groq</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Multi-modal AI pipeline: speech-to-text, computer vision, and reasoning for accurate issue classification.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>⭐ Karma System</CardTitle>
            <CardDescription>Gamified civic engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Earn karma points for reporting, verifying, and resolving issues. Build reputation and unlock rewards.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Report the Issue</h3>
                <p className="text-sm text-muted-foreground">
                  Take a photo and record a voice note describing the civic problem
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">AI Analyzes</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI triages severity, identifies risks, and suggests the responsible department
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Track Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Earn karma points and track resolution in real-time on the admin dashboard
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
