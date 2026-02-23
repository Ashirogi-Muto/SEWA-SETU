'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Bot, User, Search, FileText, Phone } from 'lucide-react'

// Dummy predefined FAQs
const FAQS = [
    { q: "How do I create a report?", a: "To create a report, tap the '+' button on the home screen, take a photo, and describe the issue." },
    { q: "How is karma calculated?", a: "Karma is awarded when your reports are verified and resolved by the authorities. Bonus karma is given for high-impact reports." },
    { q: "I can't update my phone number", a: "Head to 'Edit Profile' to request a phone number update. An OTP will be sent to your new number for verification." }
]

export default function HelpSupportPage() {
    const router = useRouter()
    const [message, setMessage] = useState('')
    const [chatHistory, setChatHistory] = useState([
        { id: 1, sender: 'bot', text: 'Hello! I am the SewaSetu Support Assistant. How can I help you today?' }
    ])
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [chatHistory])

    const handleSend = (e?: React.FormEvent) => {
        if (e) e.preventDefault()

        if (!message.trim()) return

        // Add user message
        const newHistory = [...chatHistory, { id: Date.now(), sender: 'user', text: message }]
        setChatHistory(newHistory)
        setMessage('')

        // Simulate bot thinking then replying
        setTimeout(() => {
            let botReply = "I'm a dummy assistant, so I'm not fully connected yet, but thank you for your query! If this is urgent, please call 1800-SEWA-HELP."

            // Simple mock matching from FAQ
            const match = FAQS.find(faq => message.toLowerCase().includes(faq.q.toLowerCase().split(' ')[1] || 'no-match'))
            if (match) botReply = match.a

            setChatHistory(prev => [...prev, { id: Date.now(), sender: 'bot', text: botReply }])
        }, 1000)
    }

    return (
        <div className="flex flex-col w-full h-[100dvh] bg-[#F4F7FB]">
            {/* Header */}
            <header className="w-full bg-white px-5 pt-6 pb-3 flex items-center justify-between shadow-sm shrink-0 z-10 sticky top-0">
                <div className="flex items-center">
                    <button
                        onClick={() => router.back()}
                        className="mr-3 p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-[#173F70]" />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black text-[#173F70]">Help & Support</h1>
                        <span className="text-xs text-green-500 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Support Online
                        </span>
                    </div>
                </div>
                <button className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100">
                    <Phone className="w-5 h-5" />
                </button>
            </header>

            {/* Quick Links Section (scrollable underneath if needed, but keeping it fixed here to mimic a modern chat view) */}
            <div className="px-4 py-3 bg-white border-b border-gray-100 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
                <button className="flex-none flex items-center gap-1.5 bg-blue-50 text-blue-700 rounded-full px-3 py-1.5 text-xs font-bold border border-blue-100 whitespace-nowrap">
                    <FileText className="w-3.5 h-3.5" /> FAQ
                </button>
                {FAQS.map((faq, i) => (
                    <button
                        key={i}
                        className="flex-none bg-gray-50 text-gray-700 rounded-full px-3 py-1.5 text-xs font-semibold border border-gray-200 whitespace-nowrap hover:bg-gray-100"
                        onClick={() => {
                            setMessage(faq.q)
                            // Needs slight delay to update input before sending
                            setTimeout(() => handleSend(), 10)
                        }}
                    >
                        {faq.q}
                    </button>
                ))}
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {chatHistory.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex justify-center items-center shrink-0 shadow-sm ${msg.sender === 'user' ? 'bg-[#173F70] text-white' : 'bg-white border text-blue-600'
                            }`}>
                            {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>

                        <div className={`p-3.5 rounded-[20px] shadow-sm text-sm leading-relaxed ${msg.sender === 'user'
                            ? 'bg-[#173F70] text-white rounded-tr-none'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-100 p-4 pb-8 shrink-0">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-full py-3.5 pl-5 pr-12 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#173F70]/20 focus:border-[#173F70] transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!message.trim()}
                        className="w-12 h-12 rounded-full bg-[#173F70] text-white flex justify-center items-center shadow-md disabled:opacity-50 disabled:bg-gray-300 transition-colors shrink-0"
                    >
                        <Send className="w-5 h-5 ml-1" />
                    </button>
                </form>
            </div>

        </div>
    )
}
