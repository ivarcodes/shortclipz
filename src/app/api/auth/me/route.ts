import { getSession, requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    requireAuth(session)
    return Response.json({ user: session })
  } catch {
    return Response.json({ user: null })
  }
}
