/**
 * Main AI Module - Bulletproof Triple-Validation Pipeline
 * Exports enhanced reasoning with embeddings for Next.js API routes
 */

import { aiPipeline as tripleValidationPipeline, getServiceStatus as getStatus } from '@/lib/services/ai/triage.pipeline'

// Re-export for API routes
export { tripleValidationPipeline as aiPipeline, getStatus as getServiceStatus }

// Type exports
export type { TriageInput, TriageResult } from '@/lib/services/ai/triage.pipeline'
export type { DetailedVisionResult } from '@/lib/services/ai/vision.service'
