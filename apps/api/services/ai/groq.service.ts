/**
 * PRODUCTION LLM Confirmation Service - Verifies Embeddings Match
 * LLM CONFIRMS embeddings decision, does NOT override
 */

import Groq from 'groq-sdk'
import { z } from 'zod'
import { CivicCategory } from './embeddings.service'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null

// EXACTLY 12 categories (Production Standard)
const VALID_CATEGORIES = [
  'roads', 'electricity', 'streetlight', 'water', 'water_supply',
  'drainage', 'sewerage', 'waste', 'toilets', 'trees',
  'encroachment', 'billboards', 'misc'
] as const

export const ConfirmationSchema = z.object({
  category: z.enum(VALID_CATEGORIES),
  confirmed: z.boolean(),
  severity: z.number().min(0).max(10),
  reasoning: z.string()
})

export interface ConfirmationInput {
  embeddingCategory: string
  embeddingConfidence: number
  objects: string[]
  conditions: string[]
  context: string
  location: string
}

/**
 * LLM CONFIRMATION: Verify embeddings match is correct
 */
export async function confirmCategory(input: ConfirmationInput): Promise<{
  category: string
  confirmed: boolean
  severity: number
  reasoning: string
}> {
  if (!groq) {
    console.log('🧠 LLM: Using mock confirmation')
    return mockConfirmation(input)
  }

  try {
    console.log('🧠 LLM CONFIRMATION: Verifying embeddings match...')
    
    // Strict confirmation prompt
    const prompt = `You are a civic issue validator. Your job is to CONFIRM or REJECT the embeddings-based category match.

**EMBEDDINGS ANALYSIS (Primary Decision)**:
- Category: ${input.embeddingCategory}
- Confidence: ${input.embeddingConfidence.toFixed(2)}

**VISION ANALYSIS (Supporting Evidence)**:
- Objects detected: ${input.objects.join(', ') || 'None'}
- Conditions: ${input.conditions.join(', ') || 'None'}
- Context: ${input.context}
- Location: ${input.location}

**YOUR TASK: CONFIRM OR REJECT**

**CONFIRMATION RULES**:
1. If embeddings confidence > 0.6 AND objects match category → CONFIRM
2. If embeddings says "streetlight" AND objects = [pole, light] → CONFIRM
3. If embeddings says "roads" AND objects = [pothole, crack] → CONFIRM
4. If embeddings says "waste" AND objects = [garbage] → CONFIRM

**REJECTION RULES**:
1. If NO infrastructure objects detected → REJECT (misc)
2. If embeddings = "misc" → REJECT (misc)
3. If objects clearly mismatch category → REJECT (misc)
4. If confidence < 0.6 AND no clear objects → REJECT (misc)

**12 VALID CATEGORIES ONLY**:
roads, electricity, streetlight, water, water_supply, drainage, sewerage, waste, toilets, trees, encroachment, billboards, misc

**SEVERITY SCORING** (if confirmed):
- 9-10: Critical (fallen wire, large pothole, sewage overflow)
- 7-8: Urgent (dark streetlight, drain block, garbage pile)
- 5-6: High (minor crack, small leak)
- 3-4: Medium (cosmetic damage)
- 1-2: Low (minor issues)
- 0: Non-issue (misc)

**OUTPUT STRICT JSON** (no explanation):
{
  "category": "roads|electricity|streetlight|...|misc",
  "confirmed": true|false,
  "severity": 0-10,
  "reasoning": "Brief reason for confirmation/rejection"
}

**CRITICAL**: If you REJECT, set category="misc", confirmed=false, severity=0

Think: Does vision evidence support embeddings category?`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.2-90b-text-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2, // Low for consistent confirmation
      max_tokens: 300
    })

    const content = completion.choices[0]?.message?.content || '{}'
    
    console.log('   📋 RAW LLM RESPONSE:', content.slice(0, 200))
    
    // Extract JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/g)
    
    if (jsonMatch && jsonMatch.length > 0) {
      const jsonStr = jsonMatch[jsonMatch.length - 1]
      const parsed = JSON.parse(jsonStr)
      const validated = ConfirmationSchema.parse(parsed)
      
      console.log('   ✅ LLM CONFIRMATION:', {
        category: validated.category,
        confirmed: validated.confirmed ? '✅ CONFIRMED' : '❌ REJECTED',
        severity: validated.severity
      })
      
      return validated
    }

    throw new Error('No valid JSON in confirmation response')
    
  } catch (error) {
    console.error('❌ LLM Confirmation error:', error)
    return mockConfirmation(input)
  }
}

function mockConfirmation(input: ConfirmationInput) {
  console.log('🔄 Mock LLM Confirmation')
  
  // Simple confirmation logic
  const hasObjects = input.objects.length > 0
  const highConfidence = input.embeddingConfidence > 0.6
  
  if (input.embeddingCategory === 'misc' || !hasObjects || !highConfidence) {
    return {
      category: 'misc',
      confirmed: false,
      severity: 0,
      reasoning: 'Mock: Rejected - low confidence or no objects'
    }
  }
  
  // Confirm embeddings category
  let severity = 5
  
  // Adjust severity based on conditions
  if (input.conditions.some(c => c.includes('large') || c.includes('deep') || c.includes('broken'))) {
    severity = 8
  }
  if (input.conditions.some(c => c.includes('dark') || c.includes('not working'))) {
    severity = 7
  }
  if (input.context.includes('school') || input.context.includes('highway')) {
    severity = Math.min(10, severity + 2)
  }
  
  return {
    category: input.embeddingCategory,
    confirmed: true,
    severity,
    reasoning: `Mock: Confirmed ${input.embeddingCategory} with ${input.objects.length} objects`
  }
}
