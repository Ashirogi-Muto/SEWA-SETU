/**
 * AI Routes - AI service status and utilities
 */

const SARVAM_API_KEY = process.env.SARVAM_API_KEY
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const CLOUDFLARE_AI_TOKEN = process.env.CLOUDFLARE_AI_TOKEN
const GROQ_API_KEY = process.env.GROQ_API_KEY

export function getAIServiceStatus() {
  return {
    sarvam: !!SARVAM_API_KEY,
    cloudflare: !!(CLOUDFLARE_ACCOUNT_ID && CLOUDFLARE_AI_TOKEN),
    groq: !!GROQ_API_KEY,
    allConfigured: !!(SARVAM_API_KEY && CLOUDFLARE_ACCOUNT_ID && CLOUDFLARE_AI_TOKEN && GROQ_API_KEY)
  }
}

export function getAIServiceMode(): 'PRODUCTION' | 'HYBRID_FALLBACK' | 'DEMO' {
  const status = getAIServiceStatus()
  
  if (status.allConfigured) {
    return 'PRODUCTION'
  }
  
  if (status.sarvam || status.cloudflare || status.groq) {
    return 'HYBRID_FALLBACK'
  }
  
  return 'DEMO'
}
