'use client'

import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-black/80 backdrop-blur-sm">
      <Link href="/" className="text-xl font-bold text-white">
        ShortClipz
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link
              href="/dashboard"
              className="text-sm text-zinc-300 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-400">{user.name}</span>
              <button
                onClick={logout}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Sign out
              </button>
            </div>
          </>
        ) : (
          <Link
            href="/auth/signin"
            className="px-4 py-2 text-sm bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  )
}
