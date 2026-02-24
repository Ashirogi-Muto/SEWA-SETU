'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { fetchUserProfile, updateUserProfile } from '@/lib/api'
import { ArrowLeft, Camera, User, Mail, Phone, MapPin, Save, Loader2 } from 'lucide-react'

export default function EditProfilePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        location: ''
    })

    useEffect(() => {
        fetchUserProfile()
            .then((data) => {
                setFormData({
                    name: data?.name || '',
                    email: data?.email || '',
                    phone: data?.phone || '',
                    location: data?.location || ''
                })
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setAvatarPreview(url)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            await updateUserProfile(formData)
            router.push('/profile')
        } catch (error) {
            console.error('Failed to save profile', error)
            alert('Failed to save profile changes. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="flex flex-col w-full min-h-screen bg-[#F4F7FB] pb-32">
            {/* Header */}
            <header className="w-full bg-white px-5 pt-6 pb-3 flex items-center shadow-sm shrink-0 z-10 sticky top-0">
                <button
                    onClick={() => router.back()}
                    className="mr-3 p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-[#173F70]" />
                </button>
                <h1 className="text-xl font-black text-[#173F70]">Edit Profile</h1>
            </header>

            {loading ? (
                <div className="flex justify-center items-center flex-1">
                    <Loader2 className="w-8 h-8 text-[#173F70] animate-spin" />
                </div>
            ) : (
                <form onSubmit={handleSave} className="flex-1 flex flex-col p-4 gap-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center mt-2">
                        <div className="relative">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-24 h-24 rounded-full bg-gray-200 border-[4px] border-white shadow-md flex items-center justify-center overflow-hidden cursor-pointer"
                            >
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-12 h-12 text-gray-400" />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 bg-[#173F70] text-white p-2 rounded-full shadow-lg border-2 border-white hover:bg-[#123158] transition-colors"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <span
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm font-bold text-[#173F70] mt-3 cursor-pointer hover:underline"
                        >
                            Change Photo
                        </span>
                    </div>

                    {/* Form Fields */}
                    <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col gap-4">

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-700 pl-1">Full Name</label>
                            <div className="relative flex items-center">
                                <User className="w-5 h-5 text-gray-400 absolute left-3" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#173F70]/20 focus:border-[#173F70] transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-700 pl-1">Email Address</label>
                            <div className="relative flex items-center">
                                <Mail className="w-5 h-5 text-gray-400 absolute left-3" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#173F70]/20 focus:border-[#173F70] transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-700 pl-1">Phone Number</label>
                            <div className="relative flex items-center">
                                <Phone className="w-5 h-5 text-gray-400 absolute left-3" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter your phone number"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#173F70]/20 focus:border-[#173F70] transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-700 pl-1">Location / Address</label>
                            <div className="relative flex items-center">
                                <MapPin className="w-5 h-5 text-gray-400 absolute left-3" />
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Enter your location"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#173F70]/20 focus:border-[#173F70] transition-all"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Save Button */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="mt-2 bg-[#173F70] text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-[#123158] transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                    >
                        {saving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            )}
        </div>
    )
}
