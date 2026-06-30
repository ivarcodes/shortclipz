import dbConnect from '@/lib/db'
import Scene from '@/lib/models/Scene'
import fs from 'fs/promises'

export async function POST() {
  await dbConnect()

  const expired = await Scene.find({ expiresAt: { $lt: new Date() } })
  let deleted = 0

  for (const scene of expired) {
    try { await fs.unlink(scene.clipFilePath) } catch {}
    try { await fs.unlink(scene.thumbnailPath) } catch {}
    await Scene.deleteOne({ _id: scene._id })
    deleted++
  }

  return Response.json({ deleted })
}
