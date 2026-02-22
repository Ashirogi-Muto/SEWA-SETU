'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Camera, UserCircle2, Loader2, CheckCircle, Trophy, Mic } from 'lucide-react'

const CATEGORY_OPTIONS = [
  '🛣️ Potholes',
  '💡 Streetlights',
  '🚰 Drainage',
  '🗑️ Garbage',
  '💧 Water Supply',
  '🚽 Sewage Overflow',
  '🔧 Road Repair',
  '⚡ Electricity',
  '🧹 Street Cleaning',
  '🌧️ Waterlogging',
  '🐕 Stray Animals',
  '🌳 Parks/Greens',
]

export default function ReportPage() {
  const router = useRouter()
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude)
          setLng(position.coords.longitude)
          setLocation(`${position.coords.latitude.toFixed(4)}°N, ${position.coords.longitude.toFixed(4)}°E`)
        },
        () => setLocation('Location unavailable')
      )
    }
  }

  useEffect(() => {
    detectLocation()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setImageFile(file)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setResult(null)
    try {
      const formData = new FormData()
      if (imageFile) formData.append('image', imageFile)
      if (lat != null) formData.append('lat', lat.toString())
      if (lng != null) formData.append('lng', lng.toString())
      formData.append('location', location || '')
      formData.append('description', description)
      formData.append('category', category)

      const response = await fetch('/api/triage', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Submit error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (result?.success) {
    return (
      <div className="flex flex-col w-full pb-28 bg-[#F4F7FB] min-h-screen">
        <header className="w-full bg-white px-5 pt-6 pb-3 flex justify-between items-center shadow-sm shrink-0 z-10">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="SewaSetu" className="h-10 w-auto object-contain" />
            <span className="text-xl font-bold text-[#173F70]">SewaSetu</span>
          </div>
          <UserCircle2 className="w-10 h-10 text-[#173F70]" strokeWidth={2} />
        </header>
        <div className="flex flex-col px-4 pt-6 gap-4 max-w-md mx-auto w-full">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Report Submitted!</h2>
            <p className="text-sm text-gray-600 mb-4">ID: {result.issue?.id?.slice(0, 8) ?? '—'}</p>
            {result.karmaEarned && (
              <div className="bg-amber-50 p-3 rounded-xl mb-4 flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5 text-amber-600" />
                <span className="font-bold text-amber-900">+{result.karmaEarned} Karma</span>
              </div>
            )}
            <button
              onClick={() => router.push('/home')}
              className="w-full bg-[#173F70] text-white font-bold py-3 rounded-xl"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full pb-28 bg-[#F4F7FB] min-h-screen">
      {/* Header - match home page */}
      <header className="w-full bg-white px-5 pt-6 pb-3 flex justify-between items-center shadow-sm shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="SewaSetu" className="h-10 w-auto object-contain" />
          <span className="text-xl font-bold text-[#173F70]">SewaSetu</span>
        </div>
        <UserCircle2 className="w-10 h-10 text-[#173F70]" strokeWidth={2} />
      </header>

      <h1 className="text-xl font-bold text-gray-900 text-center mt-5 mb-2 shrink-0">New Report</h1>

      {/* Main form card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-5 mx-4 shrink-0">
        {/* Category */}
        <div>
          <label className="text-sm font-bold text-gray-900 block mb-2">Select Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#173F70]/20 appearance-none"
          >
            <option value="">Choose a category...</option>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="mb-1">
          <label className="text-sm font-bold text-gray-900 block mb-2">Description</label>
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-3 pr-12 text-sm text-gray-700 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-[#173F70]/20"
              placeholder="Describe the issue here..."
            />
            {/* Voice Recording Button */}
            <button
              type="button"
              className="absolute bottom-3 right-3 p-2 bg-gray-50 hover:bg-[#173F70]/10 text-gray-400 hover:text-[#173F70] rounded-full transition-colors flex items-center justify-center"
              title="Tap to speak"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="text-sm font-bold text-gray-900 block mb-2">Location</label>
          <div
            className="w-full h-24 rounded-lg border border-gray-200 mb-3 relative overflow-hidden"
            style={{
              backgroundImage: 'url("https://a.tile.openstreetmap.org/13/4375/3275.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <MapPin className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#173F70] fill-white drop-shadow-md" />
          </div>
          <button
            type="button"
            onClick={detectLocation}
            className="w-full border-2 border-[#173F70] text-[#173F70] font-bold py-3 rounded-xl flex justify-center items-center gap-2 bg-white hover:bg-[#173F70]/5 transition-colors"
          >
            <MapPin className="w-5 h-5" />
            Use Current Location
          </button>
        </div>

        {/* Add Evidence */}
        <div>
          <label className="text-sm font-bold text-gray-900 block mb-2">Add Evidence</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-[#173F70] text-[#173F70] font-bold py-3 rounded-xl flex justify-center items-center gap-2 bg-white hover:bg-[#173F70]/5 transition-colors"
          >
            <Camera className="w-5 h-5" />
            Upload Photo/Video
          </button>
          {imageFile && (
            <p className="text-xs text-gray-500 mt-2">Selected: {imageFile.name}</p>
          )}
        </div>
      </div>

      {/* Submit - outside card */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="mx-4 mt-2 w-[calc(100%-2rem)] bg-[#173F70] text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-[#0f2a4a] transition-colors shrink-0 disabled:opacity-70 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Report'
        )}
      </button>
    </div>
  )
}
