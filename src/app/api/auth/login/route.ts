import dbConnect from '@/lib/db'
import User from '@/lib/models/User'
import { createSession, setSessionCookie } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 })
    }

    await dbConnect()

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const valid = await user.comparePassword(password)
    if (!valid) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 })
    }

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
    const message = err instanceof Error ? err.message : 'Login failed'
    return Response.json({ error: message }, { status: 500 })
  }
}
