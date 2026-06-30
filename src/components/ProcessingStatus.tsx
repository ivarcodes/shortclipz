'use client'

import { useState, useEffect } from 'react'
import ClipSelector from './ClipSelector'

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

export default function ProcessingStatus({ videoId }: { videoId: string }) {
  const [status, setStatus] = useState('uploading')
  const [error, setError] = useState('')
  const [scenes, setScenes] = useState<SceneData[]>([])

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

        if (data.status === 'done' || data.status === 'failed') return
        setTimeout(poll, 2000)
      } catch {
        if (!cancelled) setTimeout(poll, 2000)
      }
    }

    poll()
    return () => { cancelled = true }
  }, [videoId])

  if (status === 'uploading') {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4">
        <div className="animate-spin w-10 h-10 border-2 border-zinc-600 border-t-white rounded-full mx-auto" />
        <p className="text-zinc-400">Uploading your video...</p>
      </div>
    )
  }

  if (status === 'processing') {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4">
        <div className="animate-spin w-10 h-10 border-2 border-zinc-600 border-t-purple-500 rounded-full mx-auto" />
        <div className="space-y-2">
          <p className="text-zinc-300 font-medium">AI is analyzing your video</p>
          <p className="text-sm text-zinc-500">
            Transcribing → Finding best scenes → Generating clips with subtitles
          </p>
          <div className="flex justify-center gap-1 mt-4">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
        {scenes.length > 0 && (
          <p className="text-sm text-zinc-600">{scenes.filter(s => s.status === 'done').length} clips ready so far...</p>
        )}
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4">
        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
          <span className="text-red-400 text-xl">!</span>
        </div>
        <p className="text-red-400 font-medium">Processing failed</p>
        {error && <p className="text-sm text-zinc-500">{error}</p>}
        <a
          href="/dashboard"
          className="inline-block px-4 py-2 text-sm bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          Try again
        </a>
      </div>
    )
  }

  if (status === 'done') {
    const doneScenes = scenes.filter(s => s.status === 'done')
    if (doneScenes.length === 0) {
      return (
        <div className="max-w-md mx-auto text-center py-12 space-y-4">
          <p className="text-zinc-400">No clips could be generated. Try a different video.</p>
          <a href="/dashboard" className="inline-block px-4 py-2 text-sm bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
            Try again
          </a>
        </div>
      )
    }
    return <ClipSelector scenes={doneScenes} />
  }

  return null
}
