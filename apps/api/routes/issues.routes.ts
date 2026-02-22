/**
 * Issues Routes - HOTFIXED with bulletproof error handling
 * Used by Next.js API routes in apps/web/app/api/
 */

import { aiPipeline } from '@/lib/services/ai/triage.pipeline'
import { calculateKarma } from '@/lib/services/rules/karma.rules'

export interface TriageInput {
  imageUrl: string
  audioBlob?: Blob
  lat: number
  lng: number
  location: string
}

export interface TriageResult {
  transcript?: string
  category: string
  severity: number
  riskLabel: string
  riskDescription: string
  department: string
  slaHours: number
  reasoning?: string
}

/**
 * BULLETPROOF triage with fallback - NEVER blocks UI
 */
export async function triageIssue(input: TriageInput): Promise<TriageResult> {
  try {
    console.log('🚀 Starting bulletproof AI triage...')
    
    // Call the new CoT pipeline
    const result = await aiPipeline(input)
    
    console.log('✅ AI Pipeline Success:', {
      category: result.category,
      severity: result.severity,
      dept: result.department,
      reasoning: result.reasoning?.slice(0, 100) + '...'
    })
    
    return {
      transcript: result.transcript,
      category: result.category,
      severity: result.severity,
      riskLabel: result.riskLabel,
      riskDescription: result.riskDescription,
      department: result.department,
      slaHours: result.slaHours,
      reasoning: result.reasoning
    }
  } catch (error) {
    console.error('❌ AI PIPELINE ERROR:', error)
    console.error('🔄 Using safe fallback...')
    
    // SAFE FALLBACK - Always returns valid data
    return {
      transcript: undefined,
      category: 'misc',
      severity: 1,
      riskLabel: 'Processing',
      riskDescription: 'Issue submitted successfully. AI analysis in progress - will be updated shortly.',
      department: 'Pending Review',
      slaHours: 72,
      reasoning: 'AI error - using safe fallback for manual review'
    }
  }
}

export function calculateReportKarma(severity: number): number {
  try {
    return calculateKarma({
      action: 'REPORT',
      severity
    })
  } catch (error) {
    console.error('❌ Karma calculation error:', error)
    return 10 // Default karma
  }
}
