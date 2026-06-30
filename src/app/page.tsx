'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ArrowRight, Upload, Cpu, Download, Sparkles, Subtitles, Zap, Trash2 } from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) router.push('/dashboard')
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[90vh]">
        <div className="w-5 h-5 border border-[#333] border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center px-5 pt-24 pb-32">
      <div className="max-w-xl mx-auto text-center space-y-16">
        {/* Hero */}
        <div className="space-y-6">
          <div className="tag bg-[#111] text-[#999] border border-[#333]">
            <Sparkles size={12} />
            AI-Powered Clip Generator
          </div>

          <h1 className="text-[#555]xl sm:text-[#666]xl lg:text-[#888]xl font-bold tracking-tight leading-[1.05]">
            Upload anything.{' '}
            <span className="text-[#888]">AI makes it a clip.</span>
          </h1>

          <p className="text-sm text-[#888] max-w-md mx-auto leading-relaxed">
            Drop a video. Our AI finds the best 30-60 second moment, transcribes speech,
            adds styled subtitles, and hands you the perfect short clip.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center pt-2">
            <a href="/auth/signin" className="btn-primary text-sm px-5 py-2 flex items-center gap-1.5">
              Get Started Free
              <ArrowRight size={14} />
            </a>
            <p className="text-xs text-[#888]">No credit card · 10-min access</p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          <p className="text-xs text-[#888] font-semibold tracking-wider uppercase">How it works</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { num: '01', icon: Upload, label: 'Upload', desc: 'Video up to 500MB' },
              { num: '02', icon: Cpu, label: 'AI Process', desc: 'Transcribe + find scenes' },
              { num: '03', icon: Download, label: 'Download', desc: 'Styled clip ready' },
            ].map((step) => (
              <div key={step.num} className="card p-5 text-center space-y-2">
                <step.icon size={18} className="mx-auto text-[#888]" />
                <p className="text-[10px] text-[#888] font-mono font-medium">{step.num}</p>
                <p className="text-sm font-semibold text-white">{step.label}</p>
                <p className="text-xs text-[#888]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-6">
          <p className="text-xs text-[#888] font-semibold tracking-wider uppercase">Why ShortClipz</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Sparkles, label: 'AI Scene Hunter', desc: 'Finds the most engaging moment automatically.' },
              { icon: Subtitles, label: 'Smart Captions', desc: 'Speech → styled subtitles, 4 visual styles.' },
              { icon: Zap, label: 'Fast Processing', desc: 'faster-whisper + Groq. Minutes, not hours.' },
              { icon: Trash2, label: 'Auto Cleanup', desc: 'Files deleted after 10 min. No clutter.' },
            ].map((f) => (
              <div key={f.label} className="card p-5 text-left space-y-2">
                <f.icon size={16} className="text-[#888]" />
                <p className="text-sm font-semibold text-white">{f.label}</p>
                <p className="text-xs text-[#888] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-[#222]">Next.js · faster-whisper · Groq</p>
      </div>
    </div>
  )
}
