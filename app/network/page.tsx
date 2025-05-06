import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'

export default async function NetworkPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch connections where user is the requester and status is accepted
  const { data: sentConnections } = await supabase
    .from('connections')
    .select(`
      *,
      connected_profile:profiles!connections_connected_user_id_fkey(*)
    `)
    .eq('user_id', session.user.id)
    .eq('status', 'accepted')

  // Fetch connections where user is the recipient and status is accepted
  const { data: receivedConnections } = await supabase
    .from('connections')
    .select(`
      *,
      requester:profiles!connections_user_id_fkey(*)
    `)
    .eq('connected_user_id', session.user.id)
    .eq('status', 'accepted')

  // Fetch pending connection requests sent to the user
  const { data: pendingRequests } = await supabase
    .from('connections')
    .select(`
      *,
      requester:profiles!connections_user_id_fkey(*)
    `)
    .eq('connected_user_id', session.user.id)
    .eq('status', 'pending')

  // Combine connections where user is either requester or recipient
  const connections = [
    ...(sentConnections || []).map(conn => ({
      id: conn.id,
      profile: conn.connected_profile,
      status: conn.status,
      created_at: conn.created_at
    })),
    ...(receivedConnections || []).map(conn => ({
      id: conn.id,
      profile: conn.requester,
      status: conn.status,
      created_at: conn.created_at
    }))
  ]

  // Fetch all architects (for "People You May Know" section)
  const { data: allArchitects } = await supabase
    .from('profiles')
    .select('*')
    .neq('id', session.user.id)
    .limit(10)

  // Filter out architects that are already connected
  const connectedIds = new Set(connections.map(conn => conn.profile.id))
  const pendingIds = new Set(pendingRequests?.map(req => req.user_id) || [])
  const suggestedArchitects = (allArchitects || []).filter(
    architect => !connectedIds.has(architect.id) && !pendingIds.has(architect.id)
  )

  return (
    <DashboardLayout>
      <Toaster />
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Your Network</h1>

        <Tabs defaultValue="connections" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingRequests?.length || 0})</TabsTrigger>
            <TabsTrigger value="suggestions">People You May Know</TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Connections</CardTitle>
              </CardHeader>
              <CardContent>
                {connections.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {connections.map(connection => (
                      <Card key={connection.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={connection.profile.avatar_url || undefined} alt={connection.profile.full_name} />
                              <AvatarFallback>
                                {connection.profile.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/profile?id=${connection.profile.id}`}
                                className="text-lg font-medium text-gray-900 hover:underline"
                              >
                                {connection.profile.full_name}
                              </Link>
                              <p className="text-sm text-gray-500 truncate">
                                {connection.profile.title || 'Architect'}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <Link href={`/profile?id=${connection.profile.id}`}>
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
                    <p className="text-gray-500 mb-4">You don&apos;t have any connections yet.</p>
                    <p className="text-gray-500">Connect with other architects to grow your network!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Connection Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingRequests && pendingRequests.length > 0 ? (
                  <div className="space-y-4">
                    {pendingRequests.map(request => (
                      <Card key={request.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={request.requester.avatar_url || undefined} alt={request.requester.full_name} />
                              <AvatarFallback>
                                {request.requester.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/profile?id=${request.requester.id}`}
                                className="text-lg font-medium text-gray-900 hover:underline"
                              >
                                {request.requester.full_name}
                              </Link>
                              <p className="text-sm text-gray-500 truncate">
                                {request.requester.title || 'Architect'}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                asChild
                              >
                                <Link href={`/profile?id=${request.requester.id}`}>
                                  View Profile
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">You don&apos;t have any pending connection requests.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suggestions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>People You May Know</CardTitle>
              </CardHeader>
              <CardContent>
                {suggestedArchitects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {suggestedArchitects.map(architect => (
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
                              </p>
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
                    <p className="text-gray-500">No suggestions available at the moment.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
