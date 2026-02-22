/**
 * SIMPLIFIED & DEBUGGED AI Pipeline - BULLETPROOF
 * Priority: NEVER CRASH > Extensive Logging > Simple Prompts > Accuracy
 */

import { stt } from './sarvam.service'

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
  description: string
  riskLabel: string
  riskDescription: string
  department: string
  slaHours: number
  confidence: number
  reasoning: string
  debugLogs: string[]
  isValid: boolean
}

// 12 Core categories with departments
const DEPT_MAP: Record<string, string> = {
  roads: 'Public Works Department (PWD)',
  electricity: 'UPPCL (Electricity Board)',
  streetlight: 'UPPCL (Electricity Board)',
  water: 'Jal Nigam (Water Supply)',
  water_supply: 'Jal Nigam (Water Supply)',
  drainage: 'Jal Nigam (Drainage)',
  sewerage: 'Jal Nigam (Sewerage)',
  waste: 'Municipal Corporation (MCD)',
  toilets: 'Municipal Corporation (MCD)',
  trees: 'Horticulture Department',
  encroachment: 'GNIDA (Development Authority)',
  billboards: 'GNIDA (Development Authority)',
  misc: 'None'
}

/**
 * Step 1: Simple Vision - Plain Text Description
 */
async function simpleVision(imageUrl: string, debugLogs: string[]): Promise<string> {
  const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
  const CLOUDFLARE_AI_TOKEN = process.env.CLOUDFLARE_AI_TOKEN

  try {
    console.log('\n📸 STEP 1: Vision Analysis (Simple)')
    console.log('   Image URL:', imageUrl.slice(0, 80) + '...')
    debugLogs.push(`STEP 1: Vision - Image: ${imageUrl.slice(0, 80)}`)

    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_AI_TOKEN) {
      console.log('   ⚠️  No API key, using mock')
      debugLogs.push('Vision: No API key - using mock')
      return 'Dark streetlight pole on road'
    }

    // ULTRA-SIMPLE PROMPT
    const prompt = 'Describe this image for a Greater Noida civic complaint in 1 short sentence. Focus on infrastructure issues like potholes, streetlights, garbage, drains, or trees.'

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.2-11b-vision-instruct`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_AI_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }],
          max_tokens: 100
        })
      }
    )

    if (!response.ok) {
      console.error('   ❌ Vision API error:', response.status)
      debugLogs.push(`Vision ERROR: ${response.status}`)
      return 'Infrastructure issue detected'
    }

    const data = await response.json()
    const description = data.result?.response || 'Infrastructure issue'
    
    console.log('   ✅ Vision Result:', description)
    debugLogs.push(`Vision SUCCESS: ${description}`)
    
    return description

  } catch (error: any) {
    console.error('   ❌ Vision crashed:', error.message)
    debugLogs.push(`Vision CRASH: ${error.message}`)
    return 'Infrastructure issue detected'
  }
}

/**
 * Step 2: Simple Groq - Text Classification
 */
async function simpleGroq(description: string, location: string, debugLogs: string[]): Promise<{
  category: string
  severity: number
  dept: string
}> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY

  try {
    console.log('\n🧠 STEP 2: Groq Classification (Simple)')
    console.log('   Description:', description)
    debugLogs.push(`STEP 2: Groq - Input: ${description}`)

    if (!GROQ_API_KEY) {
      console.log('   ⚠️  No API key, using mock')
      debugLogs.push('Groq: No API key - using mock')
      return mockClassification(description)
    }

    // ULTRA-SIMPLE PROMPT - Plain text output
    const prompt = `You are a civic issue classifier for Greater Noida.

Description: "${description}"
Location: ${location}

Classify this into ONE category from:
roads, electricity, streetlight, water, drainage, sewerage, waste, toilets, trees, encroachment, billboards, misc

Examples:
"Dark streetlight" → streetlight 8 UPPCL
"Large pothole" → roads 9 PWD
"Garbage pile" → waste 6 MCD
"Cat photo" → misc 0 None
"Fallen tree" → trees 5 Horticulture
"Blocked drain" → drainage 7 Jal-Nigam

Output EXACTLY this format (one line):
CATEGORY SEVERITY DEPARTMENT

Where:
- CATEGORY: one of the 12 categories or misc
- SEVERITY: number 0-10
- DEPARTMENT: PWD or UPPCL or Jal-Nigam or MCD or Horticulture or GNIDA or None

Now classify:
`

    const Groq = require('groq-sdk')
    const groq = new Groq({ apiKey: GROQ_API_KEY })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.2-90b-text-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 50
    })

    const result = completion.choices[0]?.message?.content || ''
    
    console.log('   📋 RAW Groq Response:', result)
    debugLogs.push(`Groq RAW: ${result}`)

    // REGEX PARSE (Simple, no JSON!)
    const parsed = parseSimpleOutput(result)
    
    console.log('   ✅ Parsed:', parsed)
    debugLogs.push(`Groq PARSED: ${JSON.stringify(parsed)}`)
    
    return parsed

  } catch (error: any) {
    console.error('   ❌ Groq crashed:', error.message)
    debugLogs.push(`Groq CRASH: ${error.message}`)
    return mockClassification(description)
  }
}

/**
 * Parse simple text output (NO JSON!)
 */
function parseSimpleOutput(text: string): { category: string; severity: number; dept: string } {
  try {
    // Remove extra whitespace and lowercase
    const cleaned = text.toLowerCase().trim()
    
    // Try to extract: category severity dept
    const words = cleaned.split(/\s+/)
    
    // Look for category
    const validCategories = ['roads', 'electricity', 'streetlight', 'water', 'water_supply', 'drainage', 'sewerage', 'waste', 'toilets', 'trees', 'encroachment', 'billboards', 'misc']
    const category = words.find(w => validCategories.includes(w)) || 'misc'
    
    // Look for severity (0-10)
    const severity = words.find(w => /^[0-9]|10$/.test(w))
    const severityNum = severity ? parseInt(severity) : 5
    
    // Look for dept
    const deptKeywords: Record<string, string> = {
      'pwd': 'Public Works Department (PWD)',
      'uppcl': 'UPPCL (Electricity Board)',
      'jal': 'Jal Nigam',
      'mcd': 'Municipal Corporation (MCD)',
      'horticulture': 'Horticulture Department',
      'gnida': 'GNIDA (Development Authority)'
    }
    
    let dept = 'None'
    for (const [keyword, fullDept] of Object.entries(deptKeywords)) {
      if (cleaned.includes(keyword)) {
        dept = fullDept
        break
      }
    }
    
    // Fallback: use category to get dept
    if (dept === 'None' && category !== 'misc') {
      dept = DEPT_MAP[category] || 'None'
    }
    
    return { category, severity: severityNum, dept }
    
  } catch (error) {
    console.error('Parse error:', error)
    return { category: 'misc', severity: 0, dept: 'None' }
  }
}

/**
 * Mock classification (keyword-based)
 */
function mockClassification(description: string): { category: string; severity: number; dept: string } {
  const lower = description.toLowerCase()
  
  if (lower.includes('street') || lower.includes('light') || lower.includes('pole') || lower.includes('dark')) {
    return { category: 'streetlight', severity: 8, dept: 'UPPCL (Electricity Board)' }
  }
  if (lower.includes('pothole') || lower.includes('crack') || lower.includes('road')) {
    return { category: 'roads', severity: 9, dept: 'Public Works Department (PWD)' }
  }
  if (lower.includes('garbage') || lower.includes('trash') || lower.includes('waste')) {
    return { category: 'waste', severity: 6, dept: 'Municipal Corporation (MCD)' }
  }
  if (lower.includes('drain') || lower.includes('drainage')) {
    return { category: 'drainage', severity: 7, dept: 'Jal Nigam (Drainage)' }
  }
  if (lower.includes('water') || lower.includes('pipe') || lower.includes('leak')) {
    return { category: 'water', severity: 7, dept: 'Jal Nigam (Water Supply)' }
  }
  if (lower.includes('tree') || lower.includes('branch')) {
    return { category: 'trees', severity: 5, dept: 'Horticulture Department' }
  }
  if (lower.includes('cat') || lower.includes('dog') || lower.includes('animal') || lower.includes('person') || lower.includes('selfie')) {
    return { category: 'misc', severity: 0, dept: 'None' }
  }
  
  return { category: 'misc', severity: 1, dept: 'None' }
}

/**
 * Calculate SLA
 */
function calculateSLA(severity: number): number {
  if (severity >= 9) return 12
  if (severity >= 7) return 24
  if (severity >= 5) return 48
  if (severity >= 3) return 72
  return 168
}

/**
 * SIMPLIFIED BULLETPROOF PIPELINE
 */
export async function aiPipeline(input: TriageInput): Promise<TriageResult> {
  const debugLogs: string[] = []
  
  console.log('\n╔═══════════════════════════════════════════════════════╗')
  console.log('║  🔧 SIMPLIFIED AI PIPELINE (DEBUG MODE)              ║')
  console.log('╚═══════════════════════════════════════════════════════╝')
  debugLogs.push('=== AI PIPELINE START ===')
  debugLogs.push(`Image URL: ${input.imageUrl}`)
  debugLogs.push(`Location: ${input.location}`)

  try {
    // Step 0: Optional STT
    let transcript: string | undefined
    if (input.audioBlob) {
      try {
        console.log('\n🎤 STEP 0: Speech-to-Text (Optional)')
        transcript = await stt(input.audioBlob)
        console.log('   ✅ STT Result:', transcript)
        debugLogs.push(`STT: ${transcript}`)
      } catch (error: any) {
        console.error('   ❌ STT failed:', error.message)
        debugLogs.push(`STT ERROR: ${error.message}`)
      }
    }

    // Step 1: Simple Vision
    const description = await simpleVision(input.imageUrl, debugLogs)

    // Step 2: Simple Groq Classification
    const classification = await simpleGroq(description, input.location, debugLogs)

    // Step 3: Assemble Result (ALWAYS succeeds)
    const slaHours = calculateSLA(classification.severity)
    
    const riskLabels: Record<string, string> = {
      roads: 'Road Damage',
      electricity: 'Electrical Hazard',
      streetlight: 'Public Safety - Dark Area',
      water: 'Water Infrastructure',
      drainage: 'Drainage Issue',
      sewerage: 'Sewerage Problem',
      waste: 'Sanitation Issue',
      trees: 'Tree Hazard',
      misc: 'Other Issue'
    }

    const finalResult: TriageResult = {
      transcript,
      category: classification.category,
      severity: classification.severity,
      description: description || 'Civic infrastructure issue',
      riskLabel: riskLabels[classification.category] || 'Infrastructure Issue',
      riskDescription: `${description} at ${input.location}`,
      department: classification.dept,
      slaHours,
      confidence: 0.8,
      reasoning: `Simple classification: ${description} → ${classification.category}`,
      debugLogs,
      isValid: classification.category !== 'misc'
    }

    console.log('\n╔═══════════════════════════════════════════════════════╗')
    console.log('║  ✅ PIPELINE COMPLETE                                 ║')
    console.log('╚═══════════════════════════════════════════════════════╝')
    console.log(`   Category: ${finalResult.category.toUpperCase()}`)
    console.log(`   Severity: ${finalResult.severity}/10`)
    console.log(`   Department: ${finalResult.department}`)
    console.log(`   SLA: ${finalResult.slaHours} hours`)
    console.log('\n=== DEBUG LOGS ===')
    debugLogs.forEach(log => console.log(`   ${log}`))
    console.log('=== DEBUG END ===\n')
    
    debugLogs.push(`FINAL: ${finalResult.category}/${finalResult.severity}/${finalResult.department}`)
    debugLogs.push('=== AI PIPELINE END - SUCCESS ===')

    return finalResult

  } catch (error: any) {
    console.error('\n❌ PIPELINE CRASHED:', error)
    console.error('   Stack:', error.stack)
    debugLogs.push(`PIPELINE CRASH: ${error.message}`)
    debugLogs.push('=== AI PIPELINE END - CRASHED ===')

    // BULLETPROOF FALLBACK - Always returns valid data
    return {
      transcript: undefined,
      category: 'misc',
      severity: 1,
      description: 'AI processing error - manual review needed',
      riskLabel: 'Processing',
      riskDescription: 'Issue submitted successfully. AI analysis in progress.',
      department: 'Pending Review',
      slaHours: 72,
      confidence: 0.0,
      reasoning: `Pipeline crashed: ${error.message}`,
      debugLogs,
      isValid: false
    }
  }
}

export function getServiceStatus() {
  return {
    sarvam: !!process.env.SARVAM_API_KEY,
    cloudflare: !!(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_AI_TOKEN),
    groq: !!process.env.GROQ_API_KEY,
    allConfigured: !!(
      process.env.SARVAM_API_KEY && 
      process.env.CLOUDFLARE_ACCOUNT_ID && 
      process.env.CLOUDFLARE_AI_TOKEN && 
      process.env.GROQ_API_KEY
    )
  }
}
