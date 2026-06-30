'use client'

import { useState } from 'react'
import Image from 'next/image'
import CountdownTimer from './CountdownTimer'

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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Your Clips are Ready!</h2>
        <p className="text-zinc-400">
          {doneCount} short clips generated — pick the ones you want
        </p>
      </div>

      <CountdownTimer expiresAt={expiresAt} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenes.map((scene) => (
          <div
            key={scene.id}
            className="bg-zinc-900/70 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-all group"
          >
            <div className="relative aspect-video bg-zinc-800 overflow-hidden">
              {scene.thumbnail ? (
                <Image
                  src={scene.thumbnail}
                  alt={scene.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-600">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
                {formatTime(scene.duration)}
              </div>
            </div>

            <div className="p-4 space-y-3">
              <h3 className="font-medium text-white truncate">{scene.title}</h3>
              <div className="flex justify-between text-xs text-zinc-500">
                <span>{formatSize(scene.fileSize)}</span>
                <span>{Math.round(scene.end - scene.start)}s</span>
              </div>
              <button
                onClick={() => handleDownload(scene.id)}
                disabled={downloading === scene.id}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 rounded-lg text-sm font-medium text-white transition-all"
              >
                {downloading === scene.id ? 'Downloading...' : 'Download'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-zinc-600 pt-4">
        All clips expire after the timer above. Download before time runs out.
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
