/**
 * Gatekeeper Service - ResNet-50 Pre-Filter for Civic Images
 * KILLS HALLUCINATIONS by rejecting non-civic images BEFORE vision/LLM
 */

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const CLOUDFLARE_AI_TOKEN = process.env.CLOUDFLARE_AI_TOKEN

// Non-civic classes that should be IMMEDIATELY REJECTED
const NON_CIVIC_CLASSES = [
  // Animals
  'cat', 'dog', 'bird', 'horse', 'cow', 'sheep', 'bear', 'lion', 'tiger',
  'elephant', 'monkey', 'giraffe', 'zebra', 'deer', 'rabbit', 'squirrel',
  
  // People
  'person', 'man', 'woman', 'child', 'face', 'hand', 'people', 'crowd',
  'selfie', 'portrait',
  
  // Food
  'food', 'pizza', 'burger', 'sandwich', 'fruit', 'apple', 'banana',
  'bread', 'cake', 'ice cream', 'restaurant', 'plate', 'dish',
  
  // Vehicles (usually not the issue itself)
  'car', 'truck', 'bus', 'motorcycle', 'bicycle', 'vehicle', 'taxi',
  'ambulance', 'train', 'airplane', 'boat',
  
  // Nature/Sky (unless related to civic issue)
  'sky', 'cloud', 'sunset', 'sunrise', 'mountain', 'ocean', 'beach',
  'forest', 'grass', 'flower', 'leaf', 'plant',
  
  // Indoor/Random
  'bedroom', 'kitchen', 'living room', 'furniture', 'table', 'chair',
  'bed', 'sofa', 'tv', 'computer', 'phone', 'book', 'toy', 'game',
  
  // Buildings (unless showing damage)
  'building', 'house', 'apartment', 'office', 'mall', 'shop', 'store'
]

// Civic-related classes that are ALLOWED
const CIVIC_CLASSES = [
  // Infrastructure
  'street', 'road', 'pavement', 'sidewalk', 'asphalt', 'concrete',
  'pole', 'post', 'sign', 'traffic light', 'street light', 'lamp',
  'drain', 'sewer', 'manhole', 'gutter', 'pipe', 'hydrant',
  'fence', 'wall', 'barrier', 'railing', 'curb', 'divider',
  
  // Defects
  'hole', 'crack', 'damage', 'broken', 'trash', 'garbage', 'waste',
  'debris', 'rubble', 'litter', 'dump', 'leak', 'water', 'flood',
  
  // Urban elements
  'bench', 'bin', 'container', 'box', 'pole', 'wire', 'cable'
]

export interface GatekeeperResult {
  isCivic: boolean
  confidence: number
  topPredictions: Array<{ label: string; score: number }>
  reason: string
  shouldReject: boolean
}

/**
 * ResNet-50 Classification - Pre-filter for civic images
 */
export async function gatekeeperCheck(imageUrl: string): Promise<GatekeeperResult> {
  try {
    console.log('🚨 GATEKEEPER: ResNet-50 Civic Sanity Check...')
    console.log('   Image URL:', imageUrl.slice(0, 80) + '...')
    
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_AI_TOKEN) {
      console.log('   ⚠️  No API key, using permissive mock')
      return {
        isCivic: true,
        confidence: 0.7,
        topPredictions: [{ label: 'street', score: 0.7 }],
        reason: 'Gatekeeper bypassed (no API key)',
        shouldReject: false
      }
    }

    // Call Cloudflare ResNet-50
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/microsoft/resnet-50`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_AI_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: imageUrl
        })
      }
    )

    if (!response.ok) {
      console.warn('   ⚠️  ResNet-50 API error, allowing image through')
      return {
        isCivic: true,
        confidence: 0.5,
        topPredictions: [],
        reason: 'Gatekeeper API error - permissive fallback',
        shouldReject: false
      }
    }

    const data = await response.json()
    const predictions = data.result || []
    
    // Get top 5 predictions
    const top5 = predictions
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 5)
    
    console.log('   📊 ResNet-50 Top 5 Predictions:')
    for (const pred of top5) {
      console.log(`      • ${pred.label}: ${(pred.score * 100).toFixed(1)}%`)
    }
    
    // Check if any top prediction is non-civic
    const nonCivicDetected = top5.find((pred: any) => {
      const label = pred.label.toLowerCase()
      return NON_CIVIC_CLASSES.some(nc => label.includes(nc) || nc.includes(label))
    })
    
    if (nonCivicDetected && nonCivicDetected.score > 0.3) {
      console.log(`   ❌ GATEKEEPER: REJECTED - Non-civic detected!`)
      console.log(`      Reason: ${nonCivicDetected.label} (${(nonCivicDetected.score * 100).toFixed(1)}%)`)
      
      return {
        isCivic: false,
        confidence: nonCivicDetected.score,
        topPredictions: top5,
        reason: `Non-civic image detected: ${nonCivicDetected.label}`,
        shouldReject: true
      }
    }
    
    // Check if any civic class is present with high confidence
    const civicDetected = top5.find((pred: any) => {
      const label = pred.label.toLowerCase()
      return CIVIC_CLASSES.some(cc => label.includes(cc) || cc.includes(label))
    })
    
    if (civicDetected && civicDetected.score > 0.5) {
      console.log(`   ✅ GATEKEEPER: APPROVED - Civic infrastructure detected`)
      console.log(`      Match: ${civicDetected.label} (${(civicDetected.score * 100).toFixed(1)}%)`)
      
      return {
        isCivic: true,
        confidence: civicDetected.score,
        topPredictions: top5,
        reason: `Civic infrastructure detected: ${civicDetected.label}`,
        shouldReject: false
      }
    }
    
    // Ambiguous case - check confidence of top prediction
    const topPred = top5[0]
    if (topPred && topPred.score < 0.4) {
      console.log(`   ⚠️  GATEKEEPER: LOW CONFIDENCE - Likely unclear image`)
      console.log(`      Top: ${topPred.label} (${(topPred.score * 100).toFixed(1)}%)`)
      
      return {
        isCivic: false,
        confidence: topPred.score,
        topPredictions: top5,
        reason: 'Unclear image - low classification confidence',
        shouldReject: true
      }
    }
    
    // Default: Allow through but flag as uncertain
    console.log(`   ⚠️  GATEKEEPER: UNCERTAIN - Allowing with caution`)
    console.log(`      Top: ${topPred?.label || 'unknown'} (${topPred ? (topPred.score * 100).toFixed(1) : 0}%)`)
    
    return {
      isCivic: true,
      confidence: topPred?.score || 0.3,
      topPredictions: top5,
      reason: 'Uncertain classification - proceeding with caution',
      shouldReject: false
    }
    
  } catch (error) {
    console.error('   ❌ GATEKEEPER ERROR:', error)
    
    // Permissive fallback on error - let vision/LLM handle it
    return {
      isCivic: true,
      confidence: 0.5,
      topPredictions: [],
      reason: 'Gatekeeper error - permissive fallback',
      shouldReject: false
    }
  }
}

/**
 * Simple keyword-based fallback gatekeeper
 */
export function keywordGatekeeperCheck(description: string): GatekeeperResult {
  const lowerDesc = description.toLowerCase()
  
  // Check for obvious non-civic keywords
  const nonCivicKeywords = ['cat', 'dog', 'animal', 'person', 'selfie', 'face', 'food', 'car', 'vehicle']
  for (const keyword of nonCivicKeywords) {
    if (lowerDesc.includes(keyword)) {
      return {
        isCivic: false,
        confidence: 0.9,
        topPredictions: [{ label: keyword, score: 0.9 }],
        reason: `Non-civic keyword detected: ${keyword}`,
        shouldReject: true
      }
    }
  }
  
  // Check for civic keywords
  const civicKeywords = ['pothole', 'crack', 'street', 'light', 'pole', 'drain', 'garbage', 'trash', 'wire', 'pipe', 'leak', 'flood']
  for (const keyword of civicKeywords) {
    if (lowerDesc.includes(keyword)) {
      return {
        isCivic: true,
        confidence: 0.8,
        topPredictions: [{ label: keyword, score: 0.8 }],
        reason: `Civic keyword detected: ${keyword}`,
        shouldReject: false
      }
    }
  }
  
  // Default: uncertain
  return {
    isCivic: true,
    confidence: 0.5,
    topPredictions: [],
    reason: 'No clear keywords, proceeding cautiously',
    shouldReject: false
  }
}
