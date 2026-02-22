import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/apps/api/db/prisma'
import { triageIssue, calculateReportKarma } from '@/apps/api/routes/issues.routes'
import { getAIServiceStatus, getAIServiceMode } from '@/apps/api/routes/ai.routes'
import { uploadImage, uploadAudio } from '@/apps/api/db/supabase'

export const runtime = 'nodejs'
export const maxDuration = 30

/**
 * POST /api/triage - Upload image/audio → AI analysis → Save to DB
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('📥 Received triage request')
    
    const formData = await request.formData()
    
    const image = formData.get('image') as File | null
    const audio = formData.get('audio') as Blob | null
    const lat = parseFloat(formData.get('lat') as string)
    const lng = parseFloat(formData.get('lng') as string)
    const location = formData.get('location') as string
    
    if (!image || isNaN(lat) || isNaN(lng) || !location) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: image, lat, lng, location' },
        { status: 400 }
      )
    }
    
    console.log('📤 Step 1: Uploading files...')
    
    const [imageUrl, audioUrl] = await Promise.all([
      uploadImage(image),
      audio ? uploadAudio(audio) : Promise.resolve(undefined)
    ])
    
    console.log('✅ Files uploaded:', { imageUrl, audioUrl })
    
    console.log('🤖 Step 2: Running AI pipeline...')
    
    const aiResult = await triageIssue({
      imageUrl,
      audioBlob: audio || undefined,
      lat,
      lng,
      location
    })
    
    console.log('✅ AI analysis complete:', aiResult)
    
    console.log('💾 Step 3: Saving to database...')
    
    const issue = await prisma.issue.create({
      data: {
        imageUrl,
        audioUrl: audioUrl || null,
        transcript: aiResult.transcript || null,
        category: aiResult.category,
        severity: aiResult.severity,
        riskLabel: aiResult.riskLabel,
        riskDescription: aiResult.riskDescription,
        department: aiResult.department,
        slaHours: aiResult.slaHours,
        status: 'OPEN',
        lat,
        lng,
        location,
        userId: null
      }
    })
    
    console.log('✅ Issue created:', issue.id)
    
    const karmaEarned = calculateReportKarma(aiResult.severity)
    const duration = Date.now() - startTime
    console.log(`✅ Triage complete in ${duration}ms`)
    
    const serviceStatus = getAIServiceStatus()
    
    return NextResponse.json({
      success: true,
      issue: {
        id: issue.id,
        category: issue.category,
        severity: issue.severity,
        riskLabel: issue.riskLabel,
        riskDescription: issue.riskDescription,
        department: issue.department,
        slaHours: issue.slaHours,
        status: issue.status,
        transcript: issue.transcript,
        createdAt: issue.createdAt
      },
      karmaEarned,
      meta: {
        processingTimeMs: duration,
        aiServices: serviceStatus,
        mode: getAIServiceMode()
      }
    })
    
  } catch (error) {
    console.error('❌ Triage error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/triage - Check service status
 */
export async function GET() {
  const status = getAIServiceStatus()
  const mode = getAIServiceMode()
  
  return NextResponse.json({
    status: 'operational',
    mode,
    services: {
      sarvam: status.sarvam ? '✅ Configured' : '⚠️ Using fallback',
      cloudflare: status.cloudflare ? '✅ Configured' : '⚠️ Using fallback',
      groq: status.groq ? '✅ Configured' : '⚠️ Using fallback'
    },
    ready: true
  })
}
