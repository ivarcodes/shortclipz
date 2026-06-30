import dbConnect from '@/lib/db'
import Scene from '@/lib/models/Scene'
import { notFound } from 'next/navigation'
import DownloadClient from './DownloadClient'

export const dynamic = 'force-dynamic'

export default async function ClipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let scene
  try {
    await dbConnect()
    scene = await Scene.findById(id)
  } catch {
    scene = null
  }

  if (!scene) notFound()
  if (scene.status !== 'done') notFound()

  const expired = new Date() > scene.expiresAt

  return (
    <DownloadClient
      clipId={id}
      expired={expired}
      expiresAt={scene.expiresAt.toISOString()}
      fileSize={scene.fileSize}
      duration={scene.duration}
      title={scene.title}
      downloads={scene.downloads}
    />
  )
}
