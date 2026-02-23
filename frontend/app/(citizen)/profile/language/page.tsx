'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'

const LANGUAGES = [
    { id: 'en', name: 'English', nativeName: 'English' },
    { id: 'hi', name: 'Hindi', nativeName: 'हिन्दी' }
]

export default function LanguageSelectionPage() {
    const router = useRouter()
    const [selectedLang, setSelectedLang] = useState('en') // Defaulting to English, could be pulled from context/storage

    const handleSelect = (langId: string) => {
        setSelectedLang(langId)
        // Here we would typically update the user's language preference in an API or context
        // setTimeout simulates a save action
        setTimeout(() => {
            router.push('/profile')
        }, 300)
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
                <h1 className="text-xl font-black text-[#173F70]">Language / भाषा</h1>
            </header>

            <div className="flex-1 p-5 max-w-lg mx-auto w-full">
                <p className="text-gray-500 text-sm mb-6 mt-2 ml-1">
                    Choose your preferred language for the application interface.
                </p>

                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex flex-col divide-y divide-gray-100">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.id}
                            onClick={() => handleSelect(lang.id)}
                            className="flex items-center justify-between w-full p-5 hover:bg-gray-50 transition-colors text-left group"
                        >
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900 text-lg">{lang.nativeName}</span>
                                <span className="text-sm text-gray-500 font-medium">{lang.name}</span>
                            </div>

                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${selectedLang === lang.id
                                    ? 'bg-[#173F70] text-white'
                                    : 'border-2 border-gray-200 group-hover:border-[#173F70]/50'
                                }`}>
                                {selectedLang === lang.id && <Check className="w-4 h-4 text-white" />}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
