import { getSession } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Video from '@/lib/models/Video'
import Scene from '@/lib/models/Scene'
import path from 'path'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  await dbConnect()
  const video = await Video.findById(id)
  if (!video) {
    return Response.json({ error: 'Video not found' }, { status: 404 })
  }

  if (video.userId.toString() !== session.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const scenes = video.status === 'done'
    ? await Scene.find({ videoId: video._id })
    : []

  return Response.json({
    status: video.status,
    error: video.error || null,
    scenes: scenes.map((s) => ({
      id: s._id.toString(),
      title: s.title,
      start: s.start,
      end: s.end,
      duration: s.duration,
      fileSize: s.fileSize,
      status: s.status,
      thumbnail: s.thumbnailPath ? `/api/thumbs/${path.basename(s.thumbnailPath)}` : null,
      expiresAt: s.expiresAt,
    })),
  })
}
