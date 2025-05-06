import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Toaster } from '@/components/ui/sonner'

export default async function RecruitersPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch architects with resumes
  const { data: architectsWithResumes } = await supabase
    .from('profiles')
    .select('*')
    .not('resume_url', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(20)

  // Fetch all architects
  const { data: allArchitects } = await supabase
    .from('profiles')
    .select('*')
    .neq('id', session.user.id)
    .order('updated_at', { ascending: false })
    .limit(20)

  return (
    <DashboardLayout>
      <Toaster />
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Recruiter View</h1>

        <div className="mb-6">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <Input
              type="search"
              placeholder="Search architects by name, skills, or location..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Architects with Resumes</CardTitle>
              <CardDescription>
                Browse architects who have uploaded their resumes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {architectsWithResumes && architectsWithResumes.length > 0 ? (
                <div className="space-y-4">
                  {architectsWithResumes.map(architect => (
                    <Card key={architect.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={architect.avatar_url || undefined} alt={architect.full_name} />
                            <AvatarFallback>
                              {architect.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/profile?id=${architect.id}`}
                              className="text-lg font-medium text-gray-900 hover:underline"
                            >
                              {architect.full_name}
                            </Link>
                            <p className="text-sm text-gray-500 truncate">
                              {architect.title || 'Architect'}
                              {architect.location && ` • ${architect.location}`}
                            </p>
                            {architect.resume_url && (
                              <Badge className="mt-1 bg-green-100 text-green-800">
                                Resume Available
                              </Badge>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <Link href={`/profile?id=${architect.id}`}>
                                View Profile
                              </Link>
                            </Button>
                            {architect.resume_url && (
                              <Button
                                size="sm"
                                asChild
                              >
                                <a href={architect.resume_url} target="_blank" rel="noopener noreferrer" download>
                                  Download Resume
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No architects with resumes found.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Architects</CardTitle>
              <CardDescription>
                Browse all architects on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allArchitects && allArchitects.length > 0 ? (
                <div className="space-y-4">
                  {allArchitects.map(architect => (
                    <Card key={architect.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={architect.avatar_url || undefined} alt={architect.full_name} />
                            <AvatarFallback>
                              {architect.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/profile?id=${architect.id}`}
                              className="text-lg font-medium text-gray-900 hover:underline"
                            >
                              {architect.full_name}
                            </Link>
                            <p className="text-sm text-gray-500 truncate">
                              {architect.title || 'Architect'}
                              {architect.location && ` • ${architect.location}`}
                            </p>
                            {architect.resume_url && (
                              <Badge className="mt-1 bg-green-100 text-green-800">
                                Resume Available
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link href={`/profile?id=${architect.id}`}>
                              View Profile
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No architects found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
