'use client'

import { useState, useEffect } from 'react'
import ClipSelector from './ClipSelector'
import { Loader2, Music, Brain, Target, Scissors, Sparkles, Check, Upload } from 'lucide-react'

interface SceneData {
  id: string
  title: string
  start: number
  end: number
  duration: number
  fileSize: number
  status: string
  thumbnail: string | null
  expiresAt: string
}

const steps = [
  { key: 'uploading', label: 'Uploading', icon: Upload },
  { key: 'extracting', label: 'Extracting audio', icon: Music },
  { key: 'transcribing', label: 'Transcribing', icon: Brain },
  { key: 'analyzing', label: 'Finding scenes', icon: Target },
  { key: 'generating', label: 'Generating clips', icon: Scissors },
  { key: 'done', label: 'Ready!', icon: Sparkles },
]

const facts = [
  'Short-form video gets 1200% more shares.',
  'Videos under 60s retain 80% of viewers.',
  'Subtitled videos get 40% more views.',
  'First 3 seconds are everything.',
]

export default function ProcessingStatus({ videoId }: { videoId: string }) {
  const [status, setStatus] = useState('uploading')
  const [error, setError] = useState('')
  const [scenes, setScenes] = useState<SceneData[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [factIndex, setFactIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  const [particles] = useState(() =>
    Array.from({ length: 20 }).map((_, i) => ({
      id: i, left: `${((i * 19 + 7) % 100)}%`, top: `${((i * 11 + 3) % 50)}%`,
      delay: `${(i % 4) * 0.12}s`, emoji: ['✨', '⭐', '🎉', '💜'][i % 4],
    }))
  )

  useEffect(() => {
    const fi = setInterval(() => setFactIndex((i) => (i + 1) % facts.length), 4500)
    return () => clearInterval(fi)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function poll() {
      try {
        const res = await fetch(`/api/videos/${videoId}/status`)
        const data = await res.json()
        if (cancelled) return
        setStatus(data.status)
        if (data.error) setError(data.error)
        if (data.scenes) setScenes(data.scenes)

        if (data.status === 'uploading') { setCurrentStep(0); setProgress(8) }
        else if (data.status === 'processing') {
          if (data.scenes?.length > 0) {
            const done = data.scenes.filter((s: SceneData) => s.status === 'done').length
            setProgress(45 + (done / data.scenes.length) * 50)
            setCurrentStep(done > 0 && done < data.scenes.length ? 4 : 3)
          } else {
            setCurrentStep(1 + (Math.floor(data.scenes?.length || 0) % 2))
            setProgress(12 + Math.min(data.scenes?.length || 0, 30))
          }
        } else if (data.status === 'done') {
          setCurrentStep(5); setProgress(100)
          setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3500)
        }
        if (data.status === 'done' || data.status === 'failed') return
        setTimeout(poll, 2000)
      } catch { if (!cancelled) setTimeout(poll, 2000) }
    }
    poll()
    return () => { cancelled = true }
  }, [videoId])

  if (status === 'done' && scenes.filter(s => s.status === 'done').length > 0) {
    return <ClipSelector scenes={scenes.filter(s => s.status === 'done')} />
  }

  if (status === 'failed') {
    return (
      <div className="text-center py-12 space-y-4 animate-fade-in">
        <div className="text-2xl">😵</div>
        <p className="text-sm text-red-400 font-semibold">Processing failed</p>
        {error && <p className="text-xs text-[#888] max-w-xs mx-auto">{error}</p>}
        <a href="/dashboard" className="btn-primary text-xs">Try Again</a>
      </div>
    )
  }

  if (status === 'done') {
    return (
      <div className="text-center py-12 space-y-4 animate-fade-in">
        <div className="text-2xl">🤔</div>
        <p className="text-sm text-[#888] font-medium">No clips could be generated.</p>
        <a href="/dashboard" className="btn-primary text-xs">Try Again</a>
      </div>
    )
  }

  const StepIcon = steps[currentStep].icon

  return (
    <div className="max-w-sm mx-auto py-8">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {particles.map((p) => (
            <div key={p.id} className="absolute text-base" style={{ left: p.left, top: p.top, animation: `confetti-fall ${1.2 + (p.id % 3) * 0.4}s linear forwards`, animationDelay: p.delay }}>{p.emoji}</div>
          ))}
        </div>
      )}

      <div className="card p-6 space-y-6">
        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] text-[#888] font-medium">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Step */}
        <div className="text-center space-y-2" key={`step-${currentStep}`}>
          <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-white/10 border-t-white animate-spin" />
            <StepIcon size={22} className="text-white" />
          </div>
          <p className="text-sm font-bold text-white">{steps[currentStep].label}</p>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/40" style={{ animation: `pulse-soft 1.2s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>

        {/* Fact */}
        <p key={`fact-${factIndex}`} className="text-[10px] text-[#888] text-center font-medium animate-step-in">{facts[factIndex]}</p>

        {/* Scene progress */}
        {scenes.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-[#888] text-center font-medium">{scenes.filter(s => s.status === 'done').length}/{scenes.length} clips</p>
            <div className="flex justify-center gap-1">
              {scenes.map((s, i) => (
                <div key={i} className={`w-5 h-0.5 rounded-full transition-all duration-500 ${s.status === 'done' ? 'bg-green-500/60' : s.status === 'failed' ? 'bg-red-500/60' : 'bg-[#1a1a1a]'}`} />
              ))}
            </div>
          </div>
        )}

        {/* Steps timeline */}
        <div className="space-y-1.5 pt-1">
          {steps.slice(0, 5).map((step, i) => (
            <div key={step.key} className={`flex items-center gap-2.5 text-xs font-medium transition-all duration-500 ${i < currentStep ? 'text-green-400/80' : i === currentStep ? 'text-white' : 'text-[#888]'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center border ${i < currentStep ? 'bg-green-500/15 border-green-500/30' : i === currentStep ? 'bg-white/5 border-white/10 animate-pulse-soft' : 'bg-transparent border-[#222]'}`}>
                {i < currentStep ? <Check size={8} /> : i === currentStep ? <span className="w-1.5 h-1.5 rounded-full bg-white" /> : null}
              </span>
              {step.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
