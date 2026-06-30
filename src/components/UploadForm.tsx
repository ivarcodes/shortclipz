'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import ProcessingStatus from './ProcessingStatus'

const CAPTION_STYLES = [
  { value: 'modern', label: 'Modern', desc: 'White text, dark pill bg' },
  { value: 'classic', label: 'Classic', desc: 'Yellow text, black outline' },
  { value: 'karaoke', label: 'Karaoke', desc: 'Word-by-word highlight' },
  { value: 'animated', label: 'Animated', desc: 'Slide-in text animation' },
]

const MAX_SIZE = 500 * 1024 * 1024

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [captionStyle, setCaptionStyle] = useState('modern')
  const [uploading, setUploading] = useState(false)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    setDragging(true)
  }

  function handleDragLeave() {
    setDragging(false)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    validateAndSet(f)
  }

  function handleSelect(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) validateAndSet(f)
  }

  function validateAndSet(f: File) {
    setError('')
    if (!f.type.startsWith('video/')) {
      setError('Only video files are allowed')
      return
    }
    if (f.size > MAX_SIZE) {
      setError('File is too large. Max 500MB')
      return
    }
    setFile(f)
  }

  function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('captionStyle', captionStyle)

    try {
      const res = await fetch('/api/videos', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setVideoId(data.videoId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploading(false)
    }
  }

  if (videoId) {
    return <ProcessingStatus videoId={videoId} />
  }

  return (
    <div className="max-w-lg mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
          dragging
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-500'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={handleSelect}
          className="hidden"
        />
        {file ? (
          <div className="space-y-2">
            <p className="text-white font-medium">{file.name}</p>
            <p className="text-sm text-zinc-400">{formatSize(file.size)}</p>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null) }}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <svg className="w-10 h-10 mx-auto text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-zinc-400">Drop your video here or click to browse</p>
            <p className="text-xs text-zinc-600">MP4, WebM, MOV — up to 500MB</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-zinc-300 mb-3">Caption Style</label>
        <div className="grid grid-cols-2 gap-3">
          {CAPTION_STYLES.map((style) => (
            <button
              key={style.value}
              onClick={() => setCaptionStyle(style.value)}
              className={`p-3 rounded-lg text-left border transition-all ${
                captionStyle === style.value
                  ? 'border-purple-500 bg-purple-500/10 text-white'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500'
              }`}
            >
              <p className="font-medium text-sm">{style.label}</p>
              <p className="text-xs mt-1 opacity-70">{style.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-400 text-center">{error}</p>}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="mt-6 w-full py-3 rounded-lg font-medium text-black bg-white hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        {uploading ? 'Uploading...' : 'Upload & Generate Clip'}
      </button>
    </div>
  )
}
