import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UploadForm from '@/components/UploadForm'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/auth/signin')

  return (
    <div className="max-w-sm mx-auto px-5 py-16 sm:py-24">
      <div className="mb-10 text-center space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Create a Clip</h1>
        <p className="text-sm text-[#888]">Upload a video, AI does the rest</p>
      </div>
      <UploadForm />
    </div>
  )
}
