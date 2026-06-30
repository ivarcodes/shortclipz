import { getSession } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Video from '@/lib/models/Video'
import { processVideo } from '@/lib/processing'
import { after } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import { v4 as uuid } from 'uuid'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')
const MAX_SIZE = 500 * 1024 * 1024
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const captionStyle = (formData.get('captionStyle') as string) || 'modern'

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return Response.json({ error: 'File too large. Max 500MB' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json({ error: 'Invalid file type. Only MP4, WebM, MOV, AVI allowed' }, { status: 400 })
    }

    await ensureUploadDir()
    const fileName = `${uuid()}-${file.name}`
    const filePath = path.join(UPLOAD_DIR, fileName)

    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buffer)

    await dbConnect()

    const video = await Video.create({
      userId: session.id,
      fileName: file.name,
      filePath,
      fileSize: file.size,
      mimeType: file.type,
      status: 'uploading',
      captionStyle,
    })

    after(() => {
      processVideo(video._id.toString()).catch((err) => {
        console.error('Processing failed:', err)
      })
    })

    return Response.json({
      videoId: video._id.toString(),
      status: video.status,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    return Response.json({ error: message }, { status: 500 })
  }
}
