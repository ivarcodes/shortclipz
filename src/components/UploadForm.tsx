'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import ProcessingStatus from './ProcessingStatus'
import { Upload, Check, X, Loader2, Type, Bold, Mic, Wand2 } from 'lucide-react'

const CAPTION_STYLES = [
  { value: 'modern', label: 'Modern', icon: Type },
  { value: 'classic', label: 'Classic', icon: Bold },
  { value: 'karaoke', label: 'Karaoke', icon: Mic },
  { value: 'animated', label: 'Animated', icon: Wand2 },
]

const MAX_SIZE = 500 * 1024 * 1024

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [captionStyle, setCaptionStyle] = useState('modern')
  const [uploading, setUploading] = useState(false)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDragOver(e: DragEvent) { e.preventDefault(); setDragging(true) }
  function handleDragLeave() { setDragging(false) }
  function handleDrop(e: DragEvent) {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]; validateAndSet(f)
  }
  function handleSelect(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (f) validateAndSet(f)
  }

  function validateAndSet(f: File) {
    setError('')
    if (!f.type.startsWith('video/')) { setError('Video files only'); return }
    if (f.size > MAX_SIZE) { setError('Max 500MB'); return }
    setFile(f)
  }

  function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true); setError('')
    const formData = new FormData()
    formData.append('file', file); formData.append('captionStyle', captionStyle)

    try {
      const xhr = new XMLHttpRequest()
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100))
      })
      const result = await new Promise<string>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.responseText)
          else reject(new Error(JSON.parse(xhr.responseText).error || 'Upload failed'))
        }
        xhr.onerror = () => reject(new Error('Network error'))
        xhr.open('POST', '/api/videos')
        xhr.send(formData)
      })
      setVideoId(JSON.parse(result).videoId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploading(false)
      setUploadProgress(0)
    }
  }

  if (videoId) return <ProcessingStatus videoId={videoId} />

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative rounded-[8px] py-14 text-center cursor-pointer border transition-all ${
          dragging
            ? 'border-[#666] bg-white/[0.03]'
            : 'border-[#222] bg-transparent hover:border-[#444]'
        }`}
      >
        <input ref={inputRef} type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleSelect} className="hidden" />
        {file ? (
          <div className="space-y-3 animate-fade-in">
            <div className="w-12 h-12 mx-auto rounded-[8px] bg-[#111] border border-[#333] flex items-center justify-center">
              <Check size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white truncate max-w-xs mx-auto">{file.name}</p>
              <p className="text-xs text-[#888] mt-0.5">{formatSize(file.size)}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setFile(null) }} className="inline-flex items-center gap-1 text-xs text-[#888] hover:text-red-400 transition-colors">
              <X size={12} /> Remove
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto rounded-[8px] bg-[#111] border border-[#333] flex items-center justify-center">
              <Upload size={20} className="text-[#888]" />
            </div>
            <div>
              <p className="text-sm text-[#999] font-medium">Drop video here</p>
              <p className="text-xs text-[#888] mt-1">MP4, WebM, MOV — up to 500MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Caption style */}
      <div className="space-y-3">
        <p className="text-xs text-[#888] font-semibold uppercase tracking-wider">Caption style</p>
        <div className="grid grid-cols-4 gap-2">
          {CAPTION_STYLES.map((s) => {
            const Icon = s.icon
            return (
              <button
                key={s.value}
                onClick={() => setCaptionStyle(s.value)}
                className={`py-3 rounded-[6px] text-center transition-all border ${
                  captionStyle === s.value
                    ? 'border-[#666] bg-white/[0.05] text-white'
                    : 'border-[#222] text-[#888] hover:border-[#444]'
                }`}
              >
                <Icon size={16} className="mx-auto mb-1" />
                <span className="text-[11px] font-semibold">{s.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <div className="py-2.5 px-3 rounded-[6px] bg-red-500/8 border border-red-500/15 text-xs text-red-400 text-center font-medium">
          {error}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full py-3 rounded-[6px] font-semibold text-sm bg-white text-black hover:bg-zinc-200 disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            {uploadProgress > 0 ? `${uploadProgress}%` : 'Uploading...'}
          </>
        ) : (
          <>
            <Upload size={14} />
            Generate Clips
          </>
        )}
      </button>
    </div>
  )
}
