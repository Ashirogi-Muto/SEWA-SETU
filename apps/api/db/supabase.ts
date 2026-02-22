/**
 * Supabase Storage Upload Utility
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let supabase: ReturnType<typeof createClient> | null = null

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(image: File): Promise<string> {
  if (!supabase) {
    console.warn('⚠️ Supabase not configured, using mock URL')
    return `https://mock.sewasetu.app/images/${Date.now()}-${image.name}`
  }

  try {
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${image.name.split('.').pop()}`
    const fileBuffer = await image.arrayBuffer()

    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, fileBuffer, {
        contentType: image.type,
        upsert: true
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error('Image upload error:', error)
    return `https://mock.sewasetu.app/images/${Date.now()}-${image.name}`
  }
}

/**
 * Upload audio to Supabase Storage
 */
export async function uploadAudio(audio: Blob): Promise<string> {
  if (!supabase) {
    console.warn('⚠️ Supabase not configured, using mock URL')
    return `https://mock.sewasetu.app/audio/${Date.now()}.webm`
  }

  try {
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webm`
    const fileBuffer = await audio.arrayBuffer()

    const { data, error } = await supabase.storage
      .from('audio')
      .upload(fileName, fileBuffer, {
        contentType: 'audio/webm',
        upsert: true
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error('Audio upload error:', error)
    return `https://mock.sewasetu.app/audio/${Date.now()}.webm`
  }
}

export function isStorageConfigured(): boolean {
  return !!(supabaseUrl && supabaseKey)
}
