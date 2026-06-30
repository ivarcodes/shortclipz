'use client'

import { useState } from 'react'
import Image from 'next/image'
import CountdownTimer from './CountdownTimer'
import { Download, Loader2, Clock, Film, CheckCircle } from 'lucide-react'

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

export default function ClipSelector({ scenes }: { scenes: SceneData[] }) {
  const [downloading, setDownloading] = useState<string | null>(null)

  const expiresAt = scenes[0]?.expiresAt || ''

  function formatSize(bytes: number) {
    if (!bytes) return 'Unknown'
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  async function handleDownload(sceneId: string) {
    setDownloading(sceneId)
    try {
      const res = await fetch(`/api/clips/${sceneId}/download`)
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `shortclipz-${sceneId.slice(0, 8)}.mp4`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Download failed. The clip may have expired.')
    }
    setDownloading(null)
  }

  const doneCount = scenes.filter(s => s.status === 'done').length

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-green-500/8 text-green-400 border border-green-500/15">
          <CheckCircle size={12} />
          Ready
        </div>
        <h2 className="text-2xl sm:text-[#444]xl font-bold tracking-tight">Your Clips</h2>
        <p className="text-sm text-[#888] font-medium">
          {doneCount} short clip{doneCount !== 1 ? 's' : ''} — pick your favourites
        </p>
      </div>

      <CountdownTimer expiresAt={expiresAt} />

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {scenes.map((scene, idx) => (
          <div key={scene.id} className="card overflow-hidden group" style={{ animation: `fade-in 0.3s ease ${idx * 0.06}s both` }}>
            <div className="relative aspect-video bg-[#111] overflow-hidden">
              {scene.thumbnail ? (
                <Image src={scene.thumbnail} alt={scene.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 33vw" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Film size={24} className="text-[#888]" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold text-[#999] bg-black/60 border border-white/[0.06]">
                <Clock size={8} />
                {formatTime(scene.duration)}
              </div>
            </div>
            <div className="p-3 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-white truncate">{scene.title}</h3>
                <span className="shrink-0 text-[10px] font-medium text-[#888] bg-[#111] px-1.5 py-0.5 rounded border border-[#222]">
                  {Math.round(scene.end - scene.start)}s
                </span>
              </div>
              <div className="text-[10px] font-medium text-[#888]">{formatSize(scene.fileSize)}</div>
              <button
                onClick={() => handleDownload(scene.id)}
                disabled={downloading === scene.id}
                className="w-full py-2.5 rounded-[6px] text-xs font-semibold text-white bg-white/5 hover:bg-white/10 disabled:opacity-15 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
              >
                {downloading === scene.id ? (
                  <><Loader2 size={12} className="animate-spin" /> Downloading</>
                ) : (
                  <><Download size={12} /> Download</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-[10px] text-[#888] font-medium">
        Clips auto-delete after countdown. Download before time runs out.
      </p>
    </div>
  )
}

function formatTime(seconds: number) {
  if (!seconds) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
