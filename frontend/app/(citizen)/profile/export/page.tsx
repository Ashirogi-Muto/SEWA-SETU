'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, FileText, CheckCircle2, Loader2, Calendar } from 'lucide-react'

export default function ExportDataPage() {
    const router = useRouter()
    const [downloading, setDownloading] = useState(false)
    const [downloaded, setDownloaded] = useState(false)

    const handleDownload = () => {
        setDownloading(true)
        // Simulate data compilation and download
        setTimeout(() => {
            setDownloading(false)
            setDownloaded(true)

            // Reset state after a few seconds
            setTimeout(() => {
                setDownloaded(false)
            }, 3000)
        }, 2000)
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
                <h1 className="text-xl font-black text-[#173F70]">Export Data</h1>
            </header>

            <div className="flex-1 p-5 flex flex-col items-center">

                <div className="w-full bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 flex flex-col items-center mt-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#173F70]/5 rounded-bl-full -z-0" />

                    <div className="w-20 h-20 rounded-full bg-blue-50 border-[4px] border-white shadow-sm flex items-center justify-center mb-4 z-10">
                        <FileText className="w-10 h-10 text-[#173F70]" />
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-2 z-10">Your Account Data</h2>
                    <p className="text-center text-gray-500 text-sm mb-6 z-10 leading-relaxed px-2">
                        Download a copy of your personal data, including your profile information, report history, and civic activity logs, packaged in a single CSV file.
                    </p>

                    <div className="w-full bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col gap-3 z-10">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                            <span className="text-sm font-medium text-gray-700">Profile & Contact Info</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                            <span className="text-sm font-medium text-gray-700">All Submitted Reports</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                            <span className="text-sm font-medium text-gray-700">Karma Points History</span>
                        </div>
                    </div>

                    <div className="w-full mt-6 flex items-center gap-2 text-xs text-gray-400 justify-center z-10">
                        <Calendar className="w-4 h-4" />
                        <span>Last updated: Today</span>
                    </div>
                </div>

                <div className="w-full mt-6">
                    <button
                        onClick={handleDownload}
                        disabled={downloading || downloaded}
                        className={`w-full font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-90 disabled:active:scale-100 ${downloaded
                            ? 'bg-[#10B981] text-white hover:bg-[#059669]'
                            : 'bg-[#173F70] text-white hover:bg-[#123158]'
                            }`}
                    >
                        {downloading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Preparing Data...
                            </>
                        ) : downloaded ? (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                Exported Successfully!
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                Export as CSV
                            </>
                        )}
                    </button>
                </div>

            </div>

        </div>
    )
}
