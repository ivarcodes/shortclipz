'use client'

import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { LayoutDashboard, LogOut, LogIn, User } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="flex items-center justify-between px-5 py-3 border-b border-[#222]">
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="w-8 h-8 rounded-[6px] bg-white text-black flex items-center justify-center text-xs font-bold">
          S
        </div>
        <span className="text-sm font-semibold text-white/90">ShortClipz</span>
      </Link>

      <div className="flex items-center gap-1">
        {user ? (
          <>
            <Link href="/dashboard" className="btn-ghost text-xs flex items-center gap-1.5">
              <LayoutDashboard size={14} />
              Dashboard
            </Link>
            <div className="flex items-center gap-2.5 pl-3 ml-1 border-l border-[#222]">
              <div className="w-7 h-7 rounded-[4px] bg-[#111] border border-[#333] flex items-center justify-center">
                <User size={12} className="text-[#888]" />
              </div>
              <button onClick={logout} className="flex items-center gap-1.5 text-xs text-[#888] hover:text-red-400 transition-colors">
                <LogOut size={12} />
                Sign out
              </button>
            </div>
          </>
        ) : (
          <Link href="/auth/signin" className="btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5">
            <LogIn size={13} />
            Sign in
          </Link>
        )}
      </div>
    </nav>
  )
}
