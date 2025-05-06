'use client'

import { useState, useRef } from 'react'
// import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'

export default function PostForm({ user, profile }: { user: Record<string, unknown>, profile: Record<string, unknown> }) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // const router = useRouter()
  const supabase = createClient()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim() && !imageFile) {
      toast.error('Please add some content or an image to your post')
      return
    }

    setIsSubmitting(true)

    try {
      let imageUrl = null

      // Upload image if exists
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `post-images/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(filePath, imageFile)

        if (uploadError) {
          throw uploadError
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('posts')
          .getPublicUrl(filePath)

        imageUrl = urlData.publicUrl
      }

      // Create post
      console.log('Creating post with:', {
        user_id: user.id,
        content: content.trim(),
        image_url: imageUrl,
      });

      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim(),
          image_url: imageUrl,
        })

      if (error) {
        console.error('Error creating post:', error);
        throw error;
      }

      console.log('Post created successfully');

      toast.success('Post created successfully!')
      setContent('')
      setImageFile(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Force a hard refresh to ensure the new post is fetched from the server
      window.location.reload()
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error(error.message || 'Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
            <AvatarFallback>
              {profile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || user.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <form onSubmit={handleSubmit}>
              <Textarea
                placeholder="Share your architectural thoughts, ideas, or projects..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mb-3 min-h-[100px]"
              />

              {imagePreview && (
                <div className="relative mb-3">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={400}
                    height={300}
                    className="max-h-60 rounded-md object-contain"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1"
                    aria-label="Remove image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    ref={fileInputRef}
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    Add Image
                  </Button>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || (!content.trim() && !imageFile)}
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
