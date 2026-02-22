/**
 * Admin Routes - Business logic for admin operations
 */

import { getSLAStatus } from '../services/rules/sla.rules'

export interface IssueStats {
  total: number
  open: number
  inProgress: number
  resolved: number
}

export interface IssueWithSLA {
  id: string
  category: string
  severity: number
  status: string
  location: string
  createdAt: Date
  slaHours: number
  slaStatus: 'ON_TIME' | 'AT_RISK' | 'BREACHED'
  riskLabel?: string | null
  riskDescription?: string | null
}

export function calculateIssueStats(issues: any[]): IssueStats {
  return {
    total: issues.length,
    open: issues.filter(i => i.status === 'OPEN').length,
    inProgress: issues.filter(i => i.status === 'IN_PROGRESS').length,
    resolved: issues.filter(i => i.status === 'RESOLVED').length
  }
}

export function enrichIssuesWithSLA(issues: any[]): IssueWithSLA[] {
  return issues.map(issue => ({
    id: issue.id,
    category: issue.category,
    severity: issue.severity,
    status: issue.status,
    location: issue.location,
    createdAt: issue.createdAt,
    slaHours: issue.slaHours,
    slaStatus: getSLAStatus(issue.createdAt, issue.slaHours),
    riskLabel: issue.riskLabel,
    riskDescription: issue.riskDescription
  }))
}
