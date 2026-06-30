'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { LogIn, UserPlus, Loader2 } from 'lucide-react'

export default function SignInPage() {
  const { user, login, register } = useAuth()
  const router = useRouter()
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) router.push('/dashboard')
  }, [user, router])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (isRegister) await register(name, email, password)
      else await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-5">
      <div className="w-full max-w-xs">
        <div className="card p-6 space-y-5">
          <div className="text-center space-y-1.5">
            <div className="w-10 h-10 mx-auto rounded-[8px] bg-[#111] border border-[#333] flex items-center justify-center">
              {isRegister ? <UserPlus size={18} className="text-[#888]" /> : <LogIn size={18} className="text-[#888]" />}
            </div>
            <h1 className="text-base font-bold">{isRegister ? 'Create account' : 'Sign in'}</h1>
            <p className="text-xs text-[#888]">
              {isRegister ? 'Register to start creating clips' : 'Sign in to your account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {isRegister && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Name"
                required
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="Email"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder={isRegister ? 'Password (6+ chars)' : 'Password'}
              minLength={6}
              required
            />

            {error && (
              <div className="py-2 px-3 rounded-[6px] bg-red-500/5 border border-red-500/10 text-xs text-red-400 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-[6px] font-semibold text-sm bg-white text-black hover:bg-zinc-200 disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 size={14} className="animate-spin" /> Please wait...</>
              ) : isRegister ? <><UserPlus size={14} /> Create Account</> : <><LogIn size={14} /> Sign In</>}
            </button>
          </form>

          <p className="text-center text-xs text-[#888]">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsRegister(!isRegister); setError('') }}
              className="text-[#999] hover:text-white transition-colors"
            >
              {isRegister ? 'Sign in' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
