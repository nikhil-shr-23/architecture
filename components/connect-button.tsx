'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type ConnectionStatus = 'none' | 'pending' | 'accepted' | 'rejected' | 'loading'

export default function ConnectButton({ 
  profileId, 
  currentUserId,
  onConnectionChange
}: { 
  profileId: string, 
  currentUserId: string,
  onConnectionChange?: (status: ConnectionStatus) => void
}) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('loading')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  // Check if there's already a connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Check if current user sent a request to profile
        const { data: sentRequest, error: sentError } = await supabase
          .from('connections')
          .select('*')
          .eq('user_id', currentUserId)
          .eq('connected_user_id', profileId)
          .single()

        if (sentRequest) {
          setConnectionStatus(sentRequest.status)
          return
        }

        // Check if profile sent a request to current user
        const { data: receivedRequest, error: receivedError } = await supabase
          .from('connections')
          .select('*')
          .eq('user_id', profileId)
          .eq('connected_user_id', currentUserId)
          .single()

        if (receivedRequest) {
          setConnectionStatus(receivedRequest.status)
          return
        }

        // No connection found
        setConnectionStatus('none')
      } catch (error) {
        console.error('Error checking connection:', error)
        setConnectionStatus('none')
      }
    }

    if (currentUserId && profileId && currentUserId !== profileId) {
      checkConnection()
    } else {
      setConnectionStatus('none')
    }
  }, [currentUserId, profileId, supabase])

  const sendConnectionRequest = async () => {
    if (isLoading) return
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          user_id: currentUserId,
          connected_user_id: profileId,
          status: 'pending'
        })

      if (error) throw error

      setConnectionStatus('pending')
      toast.success('Connection request sent')
      if (onConnectionChange) onConnectionChange('pending')
    } catch (error: any) {
      console.error('Error sending connection request:', error)
      toast.error(error.message || 'Failed to send connection request')
    } finally {
      setIsLoading(false)
    }
  }

  const acceptConnectionRequest = async () => {
    if (isLoading) return
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('user_id', profileId)
        .eq('connected_user_id', currentUserId)

      if (error) throw error

      setConnectionStatus('accepted')
      toast.success('Connection request accepted')
      if (onConnectionChange) onConnectionChange('accepted')
    } catch (error: any) {
      console.error('Error accepting connection request:', error)
      toast.error(error.message || 'Failed to accept connection request')
    } finally {
      setIsLoading(false)
    }
  }

  const rejectConnectionRequest = async () => {
    if (isLoading) return
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'rejected' })
        .eq('user_id', profileId)
        .eq('connected_user_id', currentUserId)

      if (error) throw error

      setConnectionStatus('rejected')
      toast.success('Connection request rejected')
      if (onConnectionChange) onConnectionChange('rejected')
    } catch (error: any) {
      console.error('Error rejecting connection request:', error)
      toast.error(error.message || 'Failed to reject connection request')
    } finally {
      setIsLoading(false)
    }
  }

  const removeConnection = async () => {
    if (isLoading) return
    setIsLoading(true)

    try {
      // Try to delete where current user is the requester
      let { error } = await supabase
        .from('connections')
        .delete()
        .eq('user_id', currentUserId)
        .eq('connected_user_id', profileId)

      if (error) {
        // Try to delete where current user is the recipient
        const { error: error2 } = await supabase
          .from('connections')
          .delete()
          .eq('user_id', profileId)
          .eq('connected_user_id', currentUserId)

        if (error2) throw error2
      }

      setConnectionStatus('none')
      toast.success('Connection removed')
      if (onConnectionChange) onConnectionChange('none')
    } catch (error: any) {
      console.error('Error removing connection:', error)
      toast.error(error.message || 'Failed to remove connection')
    } finally {
      setIsLoading(false)
    }
  }

  // Don't show button if viewing own profile
  if (currentUserId === profileId) {
    return null
  }

  if (connectionStatus === 'loading') {
    return (
      <Button disabled>
        Loading...
      </Button>
    )
  }

  if (connectionStatus === 'none') {
    return (
      <Button onClick={sendConnectionRequest} disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Connect'}
      </Button>
    )
  }

  if (connectionStatus === 'pending') {
    // Check if current user sent the request or received it
    return (
      <div className="flex space-x-2">
        <Button variant="outline" onClick={removeConnection} disabled={isLoading}>
          {isLoading ? 'Cancelling...' : 'Cancel Request'}
        </Button>
      </div>
    )
  }

  if (connectionStatus === 'accepted') {
    return (
      <Button variant="outline" onClick={removeConnection} disabled={isLoading}>
        {isLoading ? 'Removing...' : 'Connected'}
      </Button>
    )
  }

  // For received pending requests, show accept/reject buttons
  return (
    <div className="flex space-x-2">
      <Button onClick={acceptConnectionRequest} disabled={isLoading}>
        {isLoading ? 'Accepting...' : 'Accept'}
      </Button>
      <Button variant="outline" onClick={rejectConnectionRequest} disabled={isLoading}>
        {isLoading ? 'Rejecting...' : 'Reject'}
      </Button>
    </div>
  )
}
