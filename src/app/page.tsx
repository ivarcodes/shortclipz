'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) router.push('/dashboard')
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[90vh]">
        <div className="animate-spin w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-6 text-center">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
            <span className="text-white">Short</span>
            <span className="text-purple-500">Clipz</span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Upload any video. AI finds the best moment, adds smart subtitles, and gives you a perfect short clip.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/auth/signin"
            className="px-8 py-3 bg-white text-black rounded-xl font-medium hover:bg-zinc-200 transition-all text-lg"
          >
            Get Started Free
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 max-w-lg mx-auto">
          {[
            { num: '01', label: 'Upload video', desc: 'MP4, WebM, MOV up to 500MB' },
            { num: '02', label: 'AI processing', desc: 'Transcribes + finds best clip' },
            { num: '03', label: 'Download clip', desc: 'Styled subtitles, 10-min access' },
          ].map((step) => (
            <div key={step.num} className="text-center p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <p className="text-purple-500 text-sm font-bold">{step.num}</p>
              <p className="text-white font-medium mt-1">{step.label}</p>
              <p className="text-xs text-zinc-500 mt-1">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
