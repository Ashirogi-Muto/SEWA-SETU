/**
 * Shared TypeScript types across the monorepo
 */

export interface Issue {
  id: string
  imageUrl: string
  audioUrl?: string | null
  transcript?: string | null
  category: string
  severity: number
  riskLabel?: string | null
  riskDescription?: string | null
  department: string
  status: string
  lat: number
  lng: number
  location: string
  userId?: string | null
  slaHours: number
  createdAt: Date
  resolvedAt?: Date | null
}

export interface TriageRequest {
  image: File
  audio?: Blob
  lat: number
  lng: number
  location: string
  description?: string
}

export interface TriageResponse {
  success: boolean
  issue?: Issue
  karmaEarned?: number
  error?: string
}

export interface AIServiceStatus {
  sarvam: boolean
  cloudflare: boolean
  groq: boolean
  allConfigured: boolean
}
