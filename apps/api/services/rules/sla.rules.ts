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
  // Critical issues (severity 8-10): 24 hours
  if (input.severity >= 8) {
    return 24
  }

  // High priority (severity 5-7): 48 hours
  if (input.severity >= 5) {
    return 48
  }

  // Medium priority (severity 3-4): 72 hours  
  if (input.severity >= 3) {
    return 72
  }

  // Low priority (severity 1-2): 168 hours (1 week)
  return 168
}

export function getSLAStatus(createdAt: Date, slaHours: number): 'ON_TIME' | 'AT_RISK' | 'BREACHED' {
  const now = new Date()
  const elapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60) // hours
  const remaining = slaHours - elapsed

  if (remaining < 0) {
    return 'BREACHED'
  }

  if (remaining < slaHours * 0.2) {
    return 'AT_RISK'
  }

  return 'ON_TIME'
}
