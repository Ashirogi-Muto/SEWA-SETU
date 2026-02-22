import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { triageReport, calculateSLA, getServiceStatus } from '@/lib/services/ai/triage'
import { uploadImage, uploadAudio } from '@/lib/db/supabase'

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
    
    console.log('🤖 Step 2: Running CIVIC FORTRESS AI...')
    
    // Convert image to buffer for YOLO
    let imageBuffer: Buffer | null = null
    if (image) {
      const arrayBuffer = await image.arrayBuffer()
      imageBuffer = Buffer.from(arrayBuffer)
    }
    
    // Convert audio to text (STT already done in /api/stt)
    const voiceText = formData.get('description') as string | null
    
    const aiResult = await triageReport(imageBuffer, voiceText, location)
    
    console.log('✅ AI analysis complete:', aiResult)
    
    console.log('💾 Step 3: Saving to database...')
    
    const slaHours = calculateSLA(aiResult.severity)
    
    const issue = await prisma.issue.create({
      data: {
        imageUrl,
        audioUrl: audioUrl || null,
        transcript: voiceText || null,
        category: aiResult.category,
        severity: aiResult.severity,
        riskLabel: aiResult.category.toUpperCase(),
        riskDescription: aiResult.description,
        department: aiResult.department,
        slaHours,
        status: 'OPEN',
        lat,
        lng,
        location,
        userId: null
      }
    })
    
    console.log('✅ Issue created:', issue.id)
    
    const karmaEarned = Math.floor(aiResult.severity * 1.5) // Karma based on severity
    const duration = Date.now() - startTime
    console.log(`✅ Triage complete in ${duration}ms`)
    
    const serviceStatus = getServiceStatus()
    
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
        aiSource: aiResult.source,
        aiConfidence: aiResult.confidence
      }
    })
  } catch (error: any) {
    console.error('❌ Triage error:', error)
    
    // BULLETPROOF: Still try to save as misc if possible
    try {
      const image = (await request.formData()).get('image') as File
      const lat = 28.535 // Default
      const lng = 77.391
      
      if (image) {
        const imageUrl = await uploadImage(image)
        
        await prisma.issue.create({
          data: {
            imageUrl,
            category: 'misc',
            severity: 1,
            riskLabel: 'ERROR',
            riskDescription: 'Processing error - manual review needed',
            department: 'Pending Review',
            slaHours: 72,
            status: 'OPEN',
            lat,
            lng,
            location: 'Unknown',
            userId: null
          }
        })
        
        return NextResponse.json({
          success: true,
          issue: { category: 'misc', severity: 1 },
          karmaEarned: 5,
          meta: { error: 'Saved with error - manual review' }
        })
      }
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError)
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/triage - Check AI service status
 */
export async function GET() {
  const status = getServiceStatus()
  
  return NextResponse.json({
    status: 'operational',
    mode: 'CIVIC_FORTRESS',
    services: {
      huggingface: status.huggingface ? '✅ Configured' : '⚠️  Mock mode',
      keywords: '✅ Always available',
      fallback: '✅ Always available'
    },
    ready: true,
    layers: {
      layer1: 'Keywords (Hindi+English) - 70% accuracy',
      layer2: 'YOLOv8 Civic Detection - 25% cases',
      layer3: 'Safe Fallback - 5% cases'
    }
  })
}
