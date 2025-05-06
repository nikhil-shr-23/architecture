import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import DashboardLayout from '@/components/dashboard-layout'
import PostForm from '@/components/post-form'
import PostFeed from '@/components/post-feed'
import DashboardResumeUpload from '@/components/dashboard-resume-upload'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Fetch posts with profiles, likes, and comments
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:profiles(*),
      likes:likes(*),
      comments:comments(*, profiles:profiles(*))
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  console.log('Dashboard fetched posts:', posts);
  if (postsError) {
    console.error('Error fetching posts:', postsError);
  }

  return (
    <DashboardLayout>
      <Toaster />
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Welcome, {profile?.full_name || 'Architect'}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            {/* Post creation form */}
            <PostForm user={session.user as unknown as Record<string, unknown>} profile={profile} />

            {/* Post feed */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Feed</h2>
              <PostFeed initialPosts={posts || []} currentUser={session.user as unknown as { id: string }} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
              <div className="text-center">
                <div className="inline-block h-24 w-24 rounded-full overflow-hidden bg-gray-100">
                  {/* Profile image will go here */}
                  <div className="h-full w-full flex items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-medium">{profile?.full_name || 'Your Name'}</h3>
                <p className="text-sm text-gray-500">{profile?.title || 'Architect'}</p>
              </div>
              <div className="mt-4">
                <a href="/profile" className="block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  View Profile
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Resume</h2>
              {profile?.resume_url ? (
                <div className="space-y-4">
                  <div className="flex items-center p-4 border rounded-lg">
                    <div className="mr-4 text-blue-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {profile.resume_name || 'Resume'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        Your uploaded resume
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" download>
                          Download
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href="/profile" className="flex items-center">
                          <span>Manage</span>
                        </a>
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Your resume is visible to recruiters. You can upload a new version below to replace it.
                  </p>

                  {/* Client component for resume upload */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium mb-2">Upload a new version:</h3>
                    <DashboardResumeUpload userId={session.user.id as string} />
                  </div>
                </div>
              ) : (
                <DashboardResumeUpload userId={session.user.id as string} />
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
