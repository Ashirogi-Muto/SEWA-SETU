/**
 * Sarvam AI Service - Hinglish Speech-to-Text
 */

const SARVAM_API_KEY = process.env.SARVAM_API_KEY

export async function stt(audioBlob: Blob): Promise<string> {
  if (!SARVAM_API_KEY) {
    console.log('📝 STT: Using mock (no API key)')
    return "सड़क पर बहुत बड़ा गड्ढा है। (There is a large pothole on the road.)"
  }

  try {
    console.log('🎤 STT: Calling Sarvam API...')
    
    const audioBuffer = await audioBlob.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString('base64')

    const response = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SARVAM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audio: base64Audio,
        language_code: 'hi-IN',
        model: 'saaras:v1'
      })
    })

    if (!response.ok) {
      throw new Error(`Sarvam API error: ${response.status}`)
    }

    const data = await response.json()
    const transcript = data.transcript || data.text || ''
    
    console.log('✅ STT: Success -', transcript.substring(0, 50))
    return transcript
  } catch (error) {
    console.error('❌ STT: Error, using fallback', error)
    return "सड़क पर गड्ढा है। (Pothole on road) [STT fallback]"
  }
}
