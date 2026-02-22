'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Loader2, Upload, MapPin, Camera, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import VoiceRecorder from '@/components/VoiceRecorder'
import StaticMapPreview from '@/components/StaticMapPreview'

interface TriageResult {
  success: boolean
  issue?: {
    id: string
    category: string
    severity: number
    description: string
    status: string
    riskLabel?: string
    riskDescription?: string
    department?: string
  }
  karmaEarned?: number
  error?: string
}

interface QueuedReport {
  id: string
  timestamp: number
  imageFile: File
  audioBlob?: Blob
  lat: number
  lng: number
  location: string
  description: string
}

export default function ReportPage() {
  // Form state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [lat, setLat] = useState(28.6139)
  const [lng, setLng] = useState(77.2090)
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TriageResult | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [offlineQueue, setOfflineQueue] = useState<QueuedReport[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Handle client-side mount
  useEffect(() => {
    setIsMounted(true)
    setIsOnline(navigator.onLine)
  }, [])

  // Auto-detect GPS on mount
  useEffect(() => {
    if (isMounted) {
      detectLocation()
      loadOfflineQueue()
    }
  }, [isMounted])

  // Process offline queue when back online
  useEffect(() => {
    if (!isMounted) return

    const handleOnline = () => {
      setIsOnline(true)
      if (offlineQueue.length > 0) {
        processOfflineQueue()
      }
    }
    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isMounted, offlineQueue])

  const detectLocation = () => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported')
      return
    }

    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = position.coords.latitude
        const newLng = position.coords.longitude
        setLat(newLat)
        setLng(newLng)
        reverseGeocode(newLat, newLng)
        setLocationLoading(false)
      },
      (error) => {
        console.error('Geolocation error:', error)
        setLocation('📍 Delhi, India (default)')
        setLocationLoading(false)
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    )
  }

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      )
      const data = await response.json()
      const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      setLocation(address)
    } catch (error) {
      setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = async () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click()
    }
  }

  const handleMapClick = (newLat: number, newLng: number) => {
    setLat(newLat)
    setLng(newLng)
    reverseGeocode(newLat, newLng)
  }

  const handleVoiceTranscription = (text: string, blob: Blob, confidence: number) => {
    setDescription(text)
    setAudioBlob(blob)
    
    // Show confidence indicator
    if (confidence < 0.8) {
      console.warn('⚠️ Lower STT confidence:', confidence)
    }
  }

  const loadOfflineQueue = () => {
    try {
      const stored = localStorage.getItem('sewasetu_offline_queue')
      if (stored) {
        setOfflineQueue(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Error loading offline queue:', error)
    }
  }

  const saveToOfflineQueue = (report: Omit<QueuedReport, 'id' | 'timestamp'>) => {
    const queuedReport: QueuedReport = {
      ...report,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
    }
    const newQueue = [...offlineQueue, queuedReport]
    setOfflineQueue(newQueue)
    localStorage.setItem('sewasetu_offline_queue', JSON.stringify(newQueue))
  }

  const processOfflineQueue = async () => {
    // Process queued reports one by one
    for (const report of offlineQueue) {
      try {
        const formData = new FormData()
        formData.append('image', report.imageFile)
        if (report.audioBlob) formData.append('audio', report.audioBlob)
        formData.append('lat', report.lat.toString())
        formData.append('lng', report.lng.toString())
        formData.append('location', report.location)
        if (report.description) formData.append('description', report.description)

        await fetch('/api/triage', {
          method: 'POST',
          body: formData,
        })
      } catch (error) {
        console.error('Error processing queued report:', error)
      }
    }
    
    setOfflineQueue([])
    localStorage.removeItem('sewasetu_offline_queue')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!imageFile) {
      alert('Please upload an image')
      return
    }

    // If offline, save to queue
    if (!isOnline) {
      saveToOfflineQueue({
        imageFile,
        audioBlob: audioBlob || undefined,
        lat,
        lng,
        location,
        description,
      })
      alert('📡 Offline: Report saved to queue. Will upload when online.')
      resetForm()
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('image', imageFile)
      if (audioBlob) formData.append('audio', audioBlob)
      formData.append('lat', lat.toString())
      formData.append('lng', lng.toString())
      formData.append('location', location)
      if (description) formData.append('description', description)

      const response = await fetch('/api/triage', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setImageFile(null)
    setImagePreview(null)
    setAudioBlob(null)
    setDescription('')
    setResult(null)
    detectLocation()
  }

  // Success screen
  if (result?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-background dark:from-green-950 py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto max-w-2xl space-y-6"
        >
          <Card className="border-green-500 bg-white dark:bg-slate-900 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-green-700 dark:text-green-300 text-2xl">
                <CheckCircle className="w-8 h-8" />
                ✅ Issue Reported Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Issue ID</p>
                <p className="font-mono font-bold text-lg">{result.issue?.id}</p>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-950/50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-amber-600">
                  🏆 +{result.karmaEarned} Karma Points
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>🤖 AI Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Category</p>
                  <p className="font-bold capitalize text-lg">{result.issue?.category}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-950/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Severity</p>
                  <p className="text-3xl font-bold text-red-600">{result.issue?.severity}/10</p>
                </div>
              </div>
              
              {result.issue?.riskLabel && (
                <div className="bg-orange-50 dark:bg-orange-950/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">⚠️ Risk Assessment</p>
                  <p className="font-semibold text-orange-700 dark:text-orange-300">
                    {result.issue.riskLabel}
                  </p>
                  <p className="text-sm mt-1">{result.issue.riskDescription}</p>
                </div>
              )}
              
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p>{result.issue?.description}</p>
              </div>
              
              {result.issue?.department && (
                <div className="bg-purple-50 dark:bg-purple-950/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">📋 Assigned To</p>
                  <p className="font-semibold">{result.issue.department}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Button onClick={resetForm} size="lg" className="w-full h-14 text-lg">
            Report Another Issue
          </Button>
        </motion.div>
      </div>
    )
  }

  // Main form
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6 px-4 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold">📱 Report Civic Issue</h1>
          <p className="text-sm opacity-90 mt-1">
            Voice • GPS • AI-Powered • Instant Response
          </p>
        </div>
      </div>

      {/* Offline indicator */}
      {isMounted && !isOnline && (
        <div className="bg-yellow-500 text-black py-2 px-4 text-center text-sm font-medium">
          📡 Offline Mode: Reports will be queued
        </div>
      )}

      {/* Offline queue indicator */}
      {offlineQueue.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-100 dark:bg-orange-900 py-2 px-4 text-center text-sm"
        >
          📤 {offlineQueue.length} report(s) queued for upload
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="container mx-auto max-w-2xl px-4 py-6 space-y-6">
        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                📍 Location
              </CardTitle>
              <CardDescription>Tap map to adjust pin location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <StaticMapPreview lat={lat} lng={lng} onRelocate={detectLocation} />
              
              <Button
                type="button"
                onClick={detectLocation}
                disabled={locationLoading}
                variant="outline"
                className="w-full"
              >
                {locationLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mr-2" />
                    Use My Current Location
                  </>
                )}
              </Button>
              
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Current Location</p>
                <p className="text-sm font-medium">{location || 'Loading...'}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {lat.toFixed(6)}, {lng.toFixed(6)}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Voice Recording */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎤 Voice Description
              </CardTitle>
              <CardDescription>Speak in Hindi or English</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <VoiceRecorder
                onTranscription={handleVoiceTranscription}
                disabled={loading}
              />
              
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description will appear here after recording..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Image Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                📸 Photo Evidence
              </CardTitle>
              <CardDescription>Take photo or upload from gallery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {imagePreview && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative w-full h-64 rounded-lg overflow-hidden bg-muted"
                >
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  onClick={handleCameraCapture}
                  variant="outline"
                  className="h-20"
                >
                  <Camera className="w-6 h-6 mr-2" />
                  Camera
                </Button>
                
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="h-20"
                >
                  <Upload className="w-6 h-6 mr-2" />
                  Gallery
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
              
              <input
                ref={cameraInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
              />
              
              {imageFile && (
                <p className="text-sm text-center text-muted-foreground">
                  ✓ {imageFile.name}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            type="submit"
            size="lg"
            className="w-full h-16 text-xl font-bold shadow-lg"
            disabled={loading || !imageFile}
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                🚀 Submit Report
              </>
            )}
          </Button>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {result && !result.success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="border-red-500 bg-red-50 dark:bg-red-950 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-600 dark:text-red-400">{result.error}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  )
}
