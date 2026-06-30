import dbConnect from '@/lib/db'
import User from '@/lib/models/User'
import { createSession, setSessionCookie } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return Response.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 })
    }

    await dbConnect()

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return Response.json({ error: 'Email already registered' }, { status: 409 })
    }

    const user = await User.create({ name, email: email.toLowerCase(), password })

    const token = await createSession({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    })

    await setSessionCookie(token)

    return Response.json({
      user: { id: user._id.toString(), name: user.name, email: user.email },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed'
    return Response.json({ error: message }, { status: 500 })
  }
}
