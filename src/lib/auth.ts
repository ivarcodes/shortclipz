import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET!
const COOKIE_NAME = 'session_token'

if (!JWT_SECRET) {
  throw new Error('Please define JWT_SECRET in .env.local')
}

export interface SessionUser {
  id: string
  email: string
  name: string
}

export async function createSession(user: SessionUser): Promise<string> {
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
  return token
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null

    const decoded = jwt.verify(token, JWT_SECRET) as SessionUser
    return decoded
  } catch {
    return null
  }
}

export function requireAuth(session: SessionUser | null): asserts session is SessionUser {
  if (!session) {
    throw new Error('Unauthorized')
  }
}
