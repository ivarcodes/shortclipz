'use client'

import { useState, useEffect } from 'react'

export default function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const expiry = new Date(expiresAt).getTime()

    function tick() {
      const now = Date.now()
      const diff = expiry - now

      if (diff <= 0) {
        setTimeLeft('Expired')
        setExpired(true)
        return
      }

      const mins = Math.floor(diff / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`)
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  if (expired) {
    return (
      <div className="text-center">
        <p className="text-red-400 font-medium text-lg">This clip has expired</p>
        <p className="text-sm text-zinc-500 mt-1">Videos are deleted after 10 minutes</p>
      </div>
    )
  }

  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Expires in</p>
      <p className={`text-5xl font-mono font-bold tabular-nums ${parseInt(timeLeft.split(':')[0]) < 2 ? 'text-red-400' : 'text-white'}`}>
        {timeLeft}
      </p>
    </div>
  )
}
