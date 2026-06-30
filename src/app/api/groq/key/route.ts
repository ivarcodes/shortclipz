import { getSession } from '@/lib/auth'
import { createHash, randomBytes, createCipheriv } from 'crypto'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { key } = await request.json()
    if (!key || typeof key !== 'string' || !key.startsWith('gsk_')) {
      return Response.json({ error: 'Invalid API key format' }, { status: 400 })
    }

    const algorithm = 'aes-256-cbc'
    const secret = process.env.JWT_SECRET!
    const iv = randomBytes(16)
    const cipher = createCipheriv(algorithm, createHash('sha256').update(secret).digest(), iv)

    let encrypted = cipher.update(key, 'utf-8', 'hex')
    encrypted += cipher.final('hex')
    const stored = iv.toString('hex') + ':' + encrypted

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Set-Cookie': `groq_key=${encodeURIComponent(stored)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`,
        'Content-Type': 'application/json',
      },
    })
  } catch {
    return Response.json({ error: 'Failed to save key' }, { status: 500 })
  }
}

export async function DELETE() {
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Set-Cookie': 'groq_key=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
      'Content-Type': 'application/json',
    },
  })
}
