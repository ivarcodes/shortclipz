import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UploadForm from '@/components/UploadForm'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/auth/signin')

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create a Clip</h1>
        <p className="text-zinc-400 mt-2">Upload a video and let AI do the rest</p>
      </div>
      <UploadForm />
    </div>
  )
}
