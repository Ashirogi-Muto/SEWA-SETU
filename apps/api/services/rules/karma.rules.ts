/**
 * Karma Rules - Gamification System
 * Calculate karma points for various civic actions
 */

export interface KarmaInput {
  action: 'REPORT' | 'VERIFY' | 'RESOLVE' | 'COMMENT' | 'UPVOTE'
  severity?: number
  timeTaken?: number // hours (for RESOLVE)
  slaHours?: number
}

export function calculateKarma(input: KarmaInput): number {
  switch (input.action) {
    case 'REPORT':
      // Base: 10 points + severity bonus
      const severityBonus = input.severity ? Math.floor(input.severity / 2) : 0
      return 10 + severityBonus

    case 'VERIFY':
      // Verifying other reports: 5 points
      return 5

    case 'RESOLVE':
      // Resolving issues: 20 points + SLA bonus
      if (input.timeTaken && input.slaHours) {
        const slaBonus = input.timeTaken < input.slaHours ? 10 : 0
        return 20 + slaBonus
      }
      return 20

    case 'COMMENT':
      // Helpful comments: 2 points
      return 2

    case 'UPVOTE':
      // Upvoting issues: 1 point
      return 1

    default:
      return 0
  }
}

export function getKarmaLevel(totalKarma: number): {
  level: string
  nextLevel: number
  progress: number
} {
  const levels = [
    { name: 'Bronze', threshold: 0 },
    { name: 'Silver', threshold: 100 },
    { name: 'Gold', threshold: 500 },
    { name: 'Platinum', threshold: 1000 },
    { name: 'Diamond', threshold: 5000 }
  ]

  const currentLevel = levels.reverse().find(l => totalKarma >= l.threshold) || levels[0]
  const nextLevel = levels.reverse().find(l => l.threshold > totalKarma)

  return {
    level: currentLevel.name,
    nextLevel: nextLevel?.threshold || currentLevel.threshold,
    progress: nextLevel 
      ? ((totalKarma - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)) * 100
      : 100
  }
}
