'use client'

import CountdownTimer from '@/components/CountdownTimer'
import { Download, Clock, Film } from 'lucide-react'

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
  clipId, expired, expiresAt, fileSize, duration, title, downloads,
}: Props) {
  function formatSize(bytes?: number) {
    if (!bytes) return 'Unknown'
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="max-w-xs mx-auto px-5 py-16">
      <div className="card p-6 space-y-5">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-[8px] bg-[#111] border border-[#333] flex items-center justify-center">
            <Film size={18} className="text-[#666]" />
          </div>
          <h1 className="text-base font-bold tracking-tight">{title || 'Your Clip'}</h1>
          <p className="text-xs text-[#555] font-medium">Download before it expires</p>
        </div>

        <CountdownTimer expiresAt={expiresAt} />

        {expired ? (
          <div className="py-4 px-3 rounded-[6px] bg-red-500/5 border border-red-500/10 text-center space-y-1">
            <p className="text-xs font-semibold text-red-400">Expired</p>
            <p className="text-[10px] text-[#555]">Upload again to create a new one.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-[6px] bg-[#0a0a0a] border border-[#222] divide-y divide-[#222]">
              {[
                { label: 'Duration', value: duration ? `${Math.round(duration)}s` : '—' },
                { label: 'Size', value: formatSize(fileSize) },
                { label: 'Downloads', value: String(downloads) },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-[11px] text-[#555] font-medium">{r.label}</span>
                  <span className="text-[11px] text-white font-semibold">{r.value}</span>
                </div>
              ))}
            </div>

            <a href={`/api/clips/${clipId}/download`} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-[6px] font-semibold text-sm text-black bg-white hover:bg-zinc-200 transition-all">
              <Download size={14} />
              Download Clip
            </a>

            <p className="text-center text-[10px] text-[#333] font-medium">Auto-deletes after timer runs out</p>
          </div>
        )}
      </div>
    </div>
  )
}
