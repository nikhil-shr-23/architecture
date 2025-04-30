'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

type Post = {
  id: string
  user_id: string
  content: string
  image_url: string | null
  created_at: string
  profiles: {
    full_name: string
    avatar_url: string | null
    title: string | null
  }
  likes: {
    id: string
    user_id: string
  }[]
  comments: {
    id: string
    user_id: string
    content: string
    created_at: string
    profiles: {
      full_name: string
      avatar_url: string | null
    }
  }[]
}

export default function PostFeed({
  initialPosts,
  currentUser
}: {
  initialPosts: Post[],
  currentUser: { id: string }
}) {
  console.log('PostFeed initialPosts:', initialPosts);

  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [commentContents, setCommentContents] = useState<{[key: string]: string}>({})
  const [showComments, setShowComments] = useState<{[key: string]: boolean}>({})
  const [isSubmitting, setIsSubmitting] = useState<{[key: string]: boolean}>({})
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Function to refresh posts
  const refreshPosts = async () => {
    setIsRefreshing(true)
    try {
      console.log('Refreshing posts...');
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:profiles(*),
          likes:likes(*),
          comments:comments(*, profiles:profiles(*))
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error refreshing posts:', error);
        throw error;
      }

      console.log('Refreshed posts:', data);
      setPosts(data || []);
    } catch (error) {
      console.error('Failed to refresh posts:', error);
      toast.error('Failed to refresh posts');
    } finally {
      setIsRefreshing(false);
    }
  }

  const toggleLike = async (postId: string) => {
    const isLiked = posts.find(p => p.id === postId)?.likes.some(like => like.user_id === currentUser.id)

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUser.id)

        if (error) throw error

        // Update local state
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes: post.likes.filter(like => like.user_id !== currentUser.id)
            }
          }
          return post
        }))
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: currentUser.id
          })

        if (error) throw error

        // Update local state
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes: [...post.likes, { id: 'temp-id', user_id: currentUser.id }]
            }
          }
          return post
        }))
      }
    } catch (error: any) {
      console.error('Error toggling like:', error)
      toast.error(error.message || 'Failed to update like')
    }
  }

  const toggleComments = (postId: string) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }))
  }

  const handleCommentChange = (postId: string, content: string) => {
    setCommentContents(prev => ({
      ...prev,
      [postId]: content
    }))
  }

  const submitComment = async (postId: string) => {
    const content = commentContents[postId]
    if (!content?.trim()) return

    setIsSubmitting(prev => ({ ...prev, [postId]: true }))

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          content: content.trim()
        })
        .select('*, profiles:profiles(*)')
        .single()

      if (error) throw error

      // Update local state
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, data]
          }
        }
        return post
      }))

      // Clear comment input
      setCommentContents(prev => ({
        ...prev,
        [postId]: ''
      }))
    } catch (error: any) {
      console.error('Error adding comment:', error)
      toast.error(error.message || 'Failed to add comment')
    } finally {
      setIsSubmitting(prev => ({ ...prev, [postId]: false }))
    }
  }

  // Add useEffect to log when posts change
  useEffect(() => {
    console.log('Posts state updated:', posts);
  }, [posts]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{posts.length === 0 ? 'No posts yet' : 'Recent Posts'}</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshPosts}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Refreshing...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </>
          )}
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card className="text-center p-6">
          <p className="text-gray-500">No posts yet. Be the first to share something!</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
        <Card key={post.id} className="overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.profiles.avatar_url || undefined} alt={post.profiles.full_name} />
                <AvatarFallback>
                  {post.profiles.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="font-medium">{post.profiles.full_name}</div>
                <div className="text-sm text-gray-500">
                  {post.profiles.title}
                  <span className="mx-1">•</span>
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="whitespace-pre-wrap">{post.content}</p>
            </div>

            {post.image_url && (
              <div className="mb-4">
                <img
                  src={post.image_url}
                  alt="Post image"
                  className="rounded-md max-h-96 w-full object-contain bg-gray-100"
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t pt-4 flex flex-col">
            <div className="flex justify-between w-full mb-2">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLike(post.id)}
                  className={post.likes.some(like => like.user_id === currentUser.id) ? 'text-blue-600' : ''}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    fill={post.likes.some(like => like.user_id === currentUser.id) ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {post.likes.length > 0 && post.likes.length}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleComments(post.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {post.comments.length > 0 && post.comments.length}
                </Button>
              </div>
            </div>

            {showComments[post.id] && (
              <div className="w-full">
                {post.comments.length > 0 && (
                  <div className="mb-4 space-y-3 max-h-60 overflow-y-auto">
                    {post.comments.map(comment => (
                      <div key={comment.id} className="flex space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.profiles.avatar_url || undefined} alt={comment.profiles.full_name} />
                          <AvatarFallback>
                            {comment.profiles.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                          <div className="font-medium text-sm">{comment.profiles.full_name}</div>
                          <p className="text-sm">{comment.content}</p>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {currentUser.id.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex space-x-2">
                    <Textarea
                      placeholder="Write a comment..."
                      value={commentContents[post.id] || ''}
                      onChange={(e) => handleCommentChange(post.id, e.target.value)}
                      className="min-h-[60px] text-sm"
                    />
                    <Button
                      onClick={() => submitComment(post.id)}
                      disabled={!commentContents[post.id]?.trim() || isSubmitting[post.id]}
                      size="sm"
                    >
                      {isSubmitting[post.id] ? 'Posting...' : 'Post'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
        </div>
      )}
    </div>
  )
}
