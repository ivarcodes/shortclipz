import dbConnect from '@/lib/db'
import Scene from '@/lib/models/Scene'
import fs from 'fs/promises'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  await dbConnect()
  const scene = await Scene.findById(id)
  if (!scene) {
    return Response.json({ error: 'Clip not found' }, { status: 404 })
  }

  if (new Date() > scene.expiresAt) {
    return Response.json({ error: 'Clip has expired' }, { status: 410 })
  }

  if (scene.status !== 'done' || !scene.clipFilePath) {
    return Response.json({ error: 'Clip not ready' }, { status: 400 })
  }

  try {
    await fs.access(scene.clipFilePath)
  } catch {
    return Response.json({ error: 'File not found on server' }, { status: 404 })
  }

  const stat = await fs.stat(scene.clipFilePath)

  scene.downloads += 1
  await scene.save()

  const fileBuffer = await fs.readFile(scene.clipFilePath)
  const fileName = `shortclipz-${scene.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`

  return new Response(fileBuffer, {
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': String(stat.size),
    },
  })
}
