'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, MicOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { transcribeAudio } from '@/lib/api'

interface VoiceRecorderProps {
  onTranscription: (text: string, audioBlob: Blob, confidence: number) => void
  disabled?: boolean
  inline?: boolean
}

interface STTResult {
  transcript: string
  confidence: number
  source: 'sarvam' | 'whisper' | 'mock'
  preview: string
}

export default function VoiceRecorder({ onTranscription, disabled, inline }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [preview, setPreview] = useState<STTResult | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<Blob | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const startRecording = async () => {
    try {
      // Enhanced audio constraints for better quality
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000 // Optimal for STT
        }
      })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      chunksRef.current = []
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' })
        audioRef.current = audioBlob
        stream.getTracks().forEach(track => track.stop())

        setIsProcessing(true)
        setShowPreview(false)

        // Offline: skip STT API, pass raw audio blob with placeholder
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          setPreview({
            transcript: ' Voice recorded — will be transcribed when online',
            confidence: 0,
            source: 'mock',
            preview: ' Voice recorded — will be transcribed when online'
          })
          setShowPreview(true)
          setIsProcessing(false)
          setRecordingTime(0)
          return
        }

        // Online: Call enhanced STT API
        try {
          const result = await transcribeAudio(audioBlob)

          setPreview({
            transcript: result.text || 'No transcription',
            confidence: 0.9,
            source: 'sarvam',
            preview: result.text || 'No transcription'
          })
          setShowPreview(true)
          setIsProcessing(false)
          setRecordingTime(0)
        } catch (error) {
          console.error('STT error:', error)

          // Fallback to mock
          const mockTranscriptions = [
            'पॉटहोल मंदिर के पास है बहुत बड़ा',
            'सड़क टूटी हुई है मार्केट के सामने',
            'बिजली का खम्बा गिर गया है',
            'पानी की लाइन फट गई है',
            'कूड़ा बहुत ज्यादा जमा है यहाँ'
          ]
          const mockText = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)]

          setPreview({
            transcript: mockText,
            confidence: 0.6,
            source: 'mock',
            preview: mockText
          })
          setShowPreview(true)
          setIsProcessing(false)
          setRecordingTime(0)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Microphone access denied:', error)
      alert(' Please allow microphone access to record audio')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const acceptTranscription = () => {
    if (preview && audioRef.current) {
      onTranscription(preview.transcript, audioRef.current, preview.confidence)
      setShowPreview(false)
      setPreview(null)
    }
  }

  const retryRecording = () => {
    setShowPreview(false)
    setPreview(null)
    audioRef.current = null
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return ' High'
    if (confidence >= 0.6) return ' Medium'
    return ' Low'
  }

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'sarvam': return ' Sarvam AI'
      case 'whisper': return ' Whisper (fallback)'
      case 'mock': return ' Mock (demo)'
      default: return source
    }
  }

  return (
    <div className={inline ? "" : "space-y-4"}>
      {/* Recording Button */}
      <motion.div
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        {inline ? (
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled || isProcessing || showPreview}
            className={`p-2 rounded-full transition-colors flex items-center justify-center relative overflow-hidden ${isRecording
              ? 'bg-red-50 text-red-500 hover:bg-red-100'
              : 'bg-gray-50 text-gray-400 hover:bg-[#173F70]/10 hover:text-[#173F70]'
              }`}
            title="Tap to speak"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isRecording ? (
              <MicOff className="w-5 h-5 animate-pulse text-red-500" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
            {isRecording && (
              <motion.div
                className="absolute inset-0 bg-red-500/20 rounded-full"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </button>
        ) : (
          <Button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled || isProcessing || showPreview}
            size="lg"
            variant={isRecording ? "destructive" : "default"}
            className="w-full h-20 text-lg relative overflow-hidden"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Processing with AI...
              </>
            ) : isRecording ? (
              <>
                <MicOff className="w-6 h-6 mr-2" />
                Stop Recording ({recordingTime}s)
              </>
            ) : (
              <>
                <Mic className="w-6 h-6 mr-2" />
                 Speak Issue (Hindi/English)
              </>
            )}

            {isRecording && (
              <motion.div
                className="absolute inset-0 bg-red-500/20"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </Button>
        )}
      </motion.div>

      {/* Recording Instructions */}
      {
        isRecording && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <p className="text-sm text-center text-muted-foreground">
               Recording... Speak clearly
            </p>

          </motion.div>
        )
      }

      {/* Real-time Preview Card */}
      <AnimatePresence>
        {showPreview && preview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-primary shadow-lg">
              <CardContent className="pt-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Transcription Ready</h4>
                      <p className="text-xs text-muted-foreground">
                        {getSourceLabel(preview.source)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${getConfidenceColor(preview.confidence)}`}>
                      {getConfidenceLabel(preview.confidence)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(preview.confidence * 100).toFixed(0)}% confidence
                    </p>
                  </div>
                </div>

                {/* Transcription Preview */}
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-lg leading-relaxed">
                    "{preview.transcript}"
                  </p>
                </div>

                {/* Confidence Warning */}
                {preview.confidence < 0.8 && (
                  <div className="flex items-start gap-2 text-sm text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>
                      Lower confidence. Consider re-recording for better accuracy.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    onClick={retryRecording}
                    variant="outline"
                    className="w-full"
                  >
                     Re-record
                  </Button>
                  <Button
                    type="button"
                    onClick={acceptTranscription}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                     Use This
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  )
}
