import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDistanceToNow } from 'date-fns'

export default async function JobsPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch active jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      *,
      profiles:profiles!jobs_posted_by_fkey(*)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  // Fetch jobs posted by the current user
  const { data: myJobs } = await supabase
    .from('jobs')
    .select(`
      *,
      profiles:profiles!jobs_posted_by_fkey(*)
    `)
    .eq('posted_by', session.user.id)
    .order('created_at', { ascending: false })

  // Sample job data for demonstration
  const sampleJobs = [
    {
      id: 'sample-1',
      title: 'Senior Architect',
      company_name: 'Foster + Partners',
      location: 'London, UK',
      job_type: 'full-time',
      salary_range: '$90,000 - $120,000',
      description: 'We are seeking a Senior Architect to join our award-winning team in London. The ideal candidate will have experience in designing sustainable commercial buildings and leading project teams.',
      requirements: 'Master\'s degree in Architecture, 7+ years of experience, LEED certification, proficiency in Revit and AutoCAD.',
      contact_email: 'careers@fosterandpartners.com',
      application_url: 'https://fosterandpartners.com/careers',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      profiles: {
        full_name: 'Foster + Partners HR',
        avatar_url: null
      }
    },
    {
      id: 'sample-2',
      title: 'Project Architect',
      company_name: 'Zaha Hadid Architects',
      location: 'New York, NY',
      job_type: 'full-time',
      salary_range: '$75,000 - $95,000',
      description: 'Zaha Hadid Architects is looking for a talented Project Architect to join our New York office. You will be responsible for developing design concepts and working with clients to deliver exceptional architectural solutions.',
      requirements: 'Bachelor\'s or Master\'s degree in Architecture, 5+ years of experience, strong design portfolio, experience with parametric design tools.',
      contact_email: 'jobs@zaha-hadid.com',
      application_url: 'https://www.zaha-hadid.com/careers',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      profiles: {
        full_name: 'ZHA Recruitment',
        avatar_url: null
      }
    },
    {
      id: 'sample-3',
      title: 'Junior Architect',
      company_name: 'BIG - Bjarke Ingels Group',
      location: 'Copenhagen, Denmark',
      job_type: 'full-time',
      salary_range: '€45,000 - €60,000',
      description: 'BIG is seeking a Junior Architect to join our Copenhagen office. This is an opportunity to work on innovative and sustainable projects across various scales and typologies.',
      requirements: 'Bachelor\'s degree in Architecture, 1-3 years of experience, proficiency in Rhino, Grasshopper, and Adobe Creative Suite, strong visualization skills.',
      contact_email: 'jobs@big.dk',
      application_url: 'https://big.dk/careers',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      profiles: {
        full_name: 'BIG HR Team',
        avatar_url: null
      }
    },
    {
      id: 'sample-4',
      title: 'Architectural Designer',
      company_name: 'SOM - Skidmore, Owings & Merrill',
      location: 'Chicago, IL',
      job_type: 'full-time',
      salary_range: '$65,000 - $85,000',
      description: 'SOM is looking for an Architectural Designer to join our Chicago office. You will collaborate with multidisciplinary teams on large-scale commercial and institutional projects.',
      requirements: 'Master\'s degree in Architecture, 2-4 years of experience, strong design and technical skills, experience with BIM software.',
      contact_email: 'careers@som.com',
      application_url: 'https://www.som.com/careers',
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      profiles: {
        full_name: 'SOM Recruitment',
        avatar_url: null
      }
    },
    {
      id: 'sample-5',
      title: 'Landscape Architect',
      company_name: 'AECOM',
      location: 'San Francisco, CA',
      job_type: 'full-time',
      salary_range: '$70,000 - $90,000',
      description: 'AECOM is seeking a Landscape Architect to join our San Francisco office. You will work on urban design and landscape architecture projects with a focus on sustainability and resilience.',
      requirements: 'Bachelor\'s or Master\'s degree in Landscape Architecture, 3-5 years of experience, proficiency in AutoCAD and Adobe Creative Suite, knowledge of sustainable design practices.',
      contact_email: 'jobs@aecom.com',
      application_url: 'https://aecom.jobs',
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
      profiles: {
        full_name: 'AECOM HR',
        avatar_url: null
      }
    }
  ];

  // Combine real jobs with sample jobs if there are no real jobs yet
  const allJobs = jobs && jobs.length > 0 ? jobs : [...(jobs || []), ...sampleJobs];

  const getJobTypeBadgeColor = (jobType: string) => {
    switch (jobType) {
      case 'full-time':
        return 'bg-green-100 text-green-800';
      case 'part-time':
        return 'bg-blue-100 text-blue-800';
      case 'contract':
        return 'bg-purple-100 text-purple-800';
      case 'freelance':
        return 'bg-orange-100 text-orange-800';
      case 'internship':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Job Opportunities</h1>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
            <TabsTrigger value="my-jobs">My Posted Jobs {myJobs && myJobs.length > 0 ? `(${myJobs.length})` : ''}</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              {allJobs.map(job => (
                <Card key={job.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <CardDescription className="text-base mt-1">
                          {job.company_name} • {job.location}
                        </CardDescription>
                      </div>
                      <Badge className={getJobTypeBadgeColor(job.job_type)}>
                        {job.job_type.replace('-', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {job.salary_range && (
                      <div className="mb-4">
                        <span className="font-medium">Salary Range:</span> {job.salary_range}
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Job Description</h3>
                      <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Requirements</h3>
                      <p className="text-gray-700 whitespace-pre-line">{job.requirements}</p>
                    </div>
                    
                    <div className="text-sm text-gray-500 mt-4">
                      Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 flex justify-between">
                    <div>
                      <span className="text-sm text-gray-600">Contact: </span>
                      <a href={`mailto:${job.contact_email}`} className="text-blue-600 hover:underline">
                        {job.contact_email}
                      </a>
                    </div>
                    
                    {job.application_url && (
                      <Button asChild>
                        <a href={job.application_url} target="_blank" rel="noopener noreferrer">
                          Apply Now
                        </a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-jobs" className="mt-6">
            {myJobs && myJobs.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {myJobs.map(job => (
                  <Card key={job.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <CardDescription className="text-base mt-1">
                            {job.company_name} • {job.location}
                          </CardDescription>
                        </div>
                        <Badge className={getJobTypeBadgeColor(job.job_type)}>
                          {job.job_type.replace('-', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {job.salary_range && (
                        <div className="mb-4">
                          <span className="font-medium">Salary Range:</span> {job.salary_range}
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <h3 className="font-semibold mb-2">Job Description</h3>
                        <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                      </div>
                      
                      <div className="text-sm text-gray-500 mt-4">
                        Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                      </div>
                    </CardContent>
                    <CardFooter className="bg-gray-50 flex justify-between">
                      <div>
                        <span className="text-sm text-gray-600">Status: </span>
                        <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                          {job.status}
                        </Badge>
                      </div>
                      
                      <Button variant="outline">
                        Edit Job
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center p-6">
                <CardContent className="pt-6">
                  <p className="text-gray-500 mb-4">You haven't posted any jobs yet.</p>
                  <p className="text-gray-500">Click the "Post a Job" button in the navigation bar to create your first job listing.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
