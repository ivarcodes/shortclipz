'use client'

import { useState, useEffect } from 'react'
import { Timer, AlertTriangle } from 'lucide-react'

export default function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [expired, setExpired] = useState(false)
  const [percentage, setPercentage] = useState(100)

  useEffect(() => {
    const expiry = new Date(expiresAt).getTime()
    const total = expiry - Date.now()

    function tick() {
      const diff = expiry - Date.now()
      if (diff <= 0) {
        setTimeLeft('Expired'); setExpired(true); setPercentage(0); return
      }
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
      setPercentage(Math.max(0, (diff / total) * 100))
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const isLow = parseInt(timeLeft.split(':')[0]) < 2 && !expired
  const r = 34
  const c = 2 * Math.PI * r

  if (expired) {
    return (
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-red-500/8 border border-red-500/12">
          <Timer size={12} className="text-red-400" />
          <span className="text-xs font-semibold text-red-400">Expired</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <p className="text-[9px] text-[#888] font-semibold tracking-widest uppercase flex items-center gap-1">
        <Timer size={10} /> Expires in
      </p>
      <div className="relative flex items-center justify-center">
        <svg width="80" height="80" className="transform -rotate-90">
          <circle cx="40" cy="40" r={r} fill="none" stroke="#1a1a1a" strokeWidth="2" />
          <circle cx="40" cy="40" r={r} fill="none" stroke={isLow ? '#f87171' : '#666'} strokeWidth="2" strokeDasharray={c} strokeDashoffset={c * (1 - percentage / 100)} strokeLinecap="round" className="transition-all duration-1000 ease-linear" />
        </svg>
        <p className={`absolute font-mono text-lg font-bold tabular-nums ${isLow ? 'text-red-400' : 'text-[#bbb]'}`}>{timeLeft}</p>
      </div>
      {isLow && (
        <p className="text-[9px] text-red-400 font-semibold animate-pulse-soft flex items-center gap-1">
          <AlertTriangle size={10} /> Download now!
        </p>
      )}
    </div>
  )
}
