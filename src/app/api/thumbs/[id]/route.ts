import fs from 'fs/promises'
import path from 'path'

const THUMBS_DIR = path.join(process.cwd(), 'public', 'thumbs')

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const thumbPath = path.join(THUMBS_DIR, id)

  try {
    const buffer = await fs.readFile(thumbPath)
    return new Response(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }
}
