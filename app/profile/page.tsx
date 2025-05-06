import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import DashboardLayout from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import EditProfileButton from './edit-profile-button'
import ConnectButton from '@/components/connect-button'
import ResumeUpload from '@/components/resume-upload'
import AvatarUpload from '@/components/avatar-upload'
import ProfileImage from '@/components/profile-image'
import { Toaster } from '@/components/ui/sonner'

interface ProfilePageProps {
  params: Promise<Record<string, string>>
  searchParams: Promise<{ id?: string }>
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Determine which profile to show - current user or requested profile
  const searchParamsData = await searchParams
  const profileId = searchParamsData.id || session.user.id
  const isOwnProfile = profileId === session.user.id

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single()

  if (!profile) {
    // Profile not found
    redirect('/dashboard')
  }

  // Fetch user experiences
  const { data: experiences } = await supabase
    .from('experiences')
    .select('*')
    .eq('user_id', profileId)
    .order('start_date', { ascending: false })

  // Fetch user education
  const { data: education } = await supabase
    .from('education')
    .select('*')
    .eq('user_id', profileId)
    .order('start_date', { ascending: false })

  // Fetch user skills
  const { data: skills } = await supabase
    .from('skills')
    .select('*')
    .eq('user_id', profileId)

  // Fetch user projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', profileId)

  return (
    <DashboardLayout>
      <Toaster />
      <div className="p-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-600 relative">
            {/* Profile Image */}
            <div className="absolute bottom-0 left-6 transform translate-y-1/2">
              <ProfileImage
                avatarUrl={profile?.avatar_url}
                fullName={profile?.full_name}
                isOwnProfile={isOwnProfile}
              />
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-4 right-6 flex space-x-2">
              {isOwnProfile ? (
                <EditProfileButton />
              ) : (
                <ConnectButton
                  profileId={profileId}
                  currentUserId={session.user.id}
                />
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-16 px-6 pb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
              <div>
                <h1 className="text-3xl font-bold">{profile?.full_name || 'Architect'}</h1>
                <p className="text-lg text-gray-600 mt-1">{profile?.title || 'Architect'}</p>
                <p className="text-gray-500 mt-1">{profile?.location || 'Location'}</p>

                <div className="mt-4">
                  {profile?.bio ? (
                    <p className="text-gray-700">{profile.bio}</p>
                  ) : (
                    isOwnProfile ? (
                      <p className="text-gray-400 italic">Add a bio to tell people about yourself</p>
                    ) : (
                      <p className="text-gray-400 italic">No bio available</p>
                    )
                  )}
                </div>
              </div>

              {/* Resume Quick Access for Recruiters */}
              {!isOwnProfile && profile?.resume_url && (
                <div className="mt-4 md:mt-0 md:ml-4">
                  <Button asChild className="flex items-center space-x-2">
                    <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" download>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      Download Resume
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Tabs defaultValue="experience" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="resume">Resume</TabsTrigger>
              {isOwnProfile && <TabsTrigger value="settings">Settings</TabsTrigger>}
            </TabsList>

            <TabsContent value="experience" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Experience</CardTitle>
                  <Button variant="outline" size="sm">Add Experience</Button>
                </CardHeader>
                <CardContent>
                  {experiences && experiences.length > 0 ? (
                    <div className="space-y-6">
                      {experiences.map((exp) => (
                        <div key={exp.id} className="border-b pb-6 last:border-0 last:pb-0">
                          <h3 className="text-lg font-semibold">{exp.title}</h3>
                          <p className="text-gray-600">{exp.company}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(exp.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} -
                            {exp.end_date
                              ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                              : ' Present'}
                          </p>
                          <p className="text-gray-700 mt-2">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <p>No experience added yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="education" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Education</CardTitle>
                  <Button variant="outline" size="sm">Add Education</Button>
                </CardHeader>
                <CardContent>
                  {education && education.length > 0 ? (
                    <div className="space-y-6">
                      {education.map((edu) => (
                        <div key={edu.id} className="border-b pb-6 last:border-0 last:pb-0">
                          <h3 className="text-lg font-semibold">{edu.school}</h3>
                          <p className="text-gray-600">{edu.degree}, {edu.field_of_study}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(edu.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} -
                            {edu.end_date
                              ? new Date(edu.end_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                              : ' Present'}
                          </p>
                          <p className="text-gray-700 mt-2">{edu.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <p>No education added yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Skills</CardTitle>
                  <Button variant="outline" size="sm">Add Skills</Button>
                </CardHeader>
                <CardContent>
                  {skills && skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <div key={skill.id} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                          {skill.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <p>No skills added yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Projects</CardTitle>
                  <Button variant="outline" size="sm">Add Project</Button>
                </CardHeader>
                <CardContent>
                  {projects && projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {projects.map((project) => (
                        <div key={project.id} className="border rounded-lg overflow-hidden">
                          <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-semibold">{project.name}</h3>
                            <p className="text-sm text-gray-500">{project.year}</p>
                            <p className="text-gray-700 mt-2 line-clamp-3">{project.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <p>No projects added yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resume" className="mt-6">
              {isOwnProfile ? (
                <ResumeUpload userId={profileId} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Resume</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                              View or download resume
                            </p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" download>
                              Download
                            </a>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500">No resume available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {isOwnProfile && (
              <TabsContent value="settings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Profile Picture</h3>
                        <AvatarUpload userId={profileId} currentAvatarUrl={profile?.avatar_url} />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-4">Account Settings</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Update your account settings and manage your profile information.
                        </p>
                        <div className="space-y-4">
                          <Button variant="outline" className="w-full justify-start" asChild>
                            <a href="/profile/edit">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                              Edit Profile Information
                            </a>
                          </Button>
                          <Button variant="outline" className="w-full justify-start" asChild>
                            <a href="/account/password">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                              </svg>
                              Change Password
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  )
}
