'use client'

import CountdownTimer from '@/components/CountdownTimer'

interface Props {
  clipId: string
  expired: boolean
  expiresAt: string
  fileSize?: number
  duration?: number
  title?: string
  downloads: number
}

export default function DownloadClient({
  clipId,
  expired,
  expiresAt,
  fileSize,
  duration,
  title,
  downloads,
}: Props) {
  function formatSize(bytes?: number) {
    if (!bytes) return 'Unknown'
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-12 text-center space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{title || 'Your Clip is Ready!'}</h1>
        <p className="text-zinc-400">Download before it expires</p>
      </div>

      <CountdownTimer expiresAt={expiresAt} />

      {expired ? (
        <div className="p-8 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <p className="text-zinc-400">This clip is no longer available.</p>
          <p className="text-sm text-zinc-600 mt-1">Upload again to create a new one.</p>
        </div>
      ) : (
        <>
          <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Duration</span>
              <span className="text-white">{duration ? `${Math.round(duration)}s` : '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Size</span>
              <span className="text-white">{formatSize(fileSize)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Downloads</span>
              <span className="text-white">{downloads}</span>
            </div>
          </div>

          <a
            href={`/api/clips/${clipId}/download`}
            className="inline-block w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-medium text-white transition-all text-lg"
          >
            Download Clip
          </a>

          <p className="text-xs text-zinc-600">
            File will be deleted from server after the timer runs out
          </p>
        </>
      )}
    </div>
  )
}
