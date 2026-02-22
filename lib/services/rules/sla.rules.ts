/**
 * SLA (Service Level Agreement) Rules
 * Determines response time based on issue severity and category
 */

export interface SLAInput {
  category: string
  severity: number
  riskLabel?: string
}

export function calculateSLA(input: SLAInput): number {
  if (input.severity >= 8) return 24
  if (input.severity >= 5) return 48
  if (input.severity >= 3) return 72
  return 168
}

export function getSLAStatus(createdAt: Date, slaHours: number): 'ON_TIME' | 'AT_RISK' | 'BREACHED' {
  const now = new Date()
  const elapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
  const remaining = slaHours - elapsed
  if (remaining < 0) return 'BREACHED'
  if (remaining < slaHours * 0.2) return 'AT_RISK'
  return 'ON_TIME'
}
