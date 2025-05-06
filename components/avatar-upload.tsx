'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Image from 'next/image'

export default function AvatarUpload({ userId, currentAvatarUrl }: { userId: string, currentAvatarUrl?: string | null }) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentAvatarUrl || null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB')
      return
    }

    setAvatarFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!avatarFile) {
      toast.error('Please select an image')
      return
    }

    setIsUploading(true)

    try {
      // Upload file to Supabase Storage
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${userId}-avatar-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Delete old avatar if exists
      if (currentAvatarUrl) {
        const urlParts = currentAvatarUrl.split('/')
        const oldFileName = urlParts[urlParts.length - 1]
        if (oldFileName.includes(userId) && oldFileName.includes('avatar')) {
          const oldFilePath = `${oldFileName}`
          await supabase.storage
            .from('avatars')
            .remove([oldFilePath])
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: urlData.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (updateError) {
        throw updateError
      }

      toast.success('Profile picture updated successfully')
      setAvatarFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Force refresh to show the new avatar
      router.refresh()
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload profile picture')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!currentAvatarUrl) return

    setIsUploading(true)

    try {
      // Extract file path from URL
      const urlParts = currentAvatarUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const filePath = `${fileName}`

      // Delete file from storage
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath])

      if (deleteError && !deleteError.message.includes('Object not found')) {
        throw deleteError
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (updateError) {
        throw updateError
      }

      setAvatarPreview(null)
      toast.success('Profile picture removed')
      router.refresh()
    } catch (error) {
      console.error('Error removing avatar:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to remove profile picture')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div
        className="h-32 w-32 rounded-full overflow-hidden relative bg-gray-100 border-4 border-white"
        onClick={() => fileInputRef.current?.click()}
        style={{ cursor: 'pointer' }}
      >
        {avatarPreview ? (
          <div className="h-full w-full">
            <Image
              src={avatarPreview}
              alt="Avatar preview"
              width={128}
              height={128}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
        )}

        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
          </svg>
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
      />

      <div className="flex space-x-2">
        <Button
          onClick={handleUpload}
          disabled={!avatarFile || isUploading}
          size="sm"
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>

        {avatarPreview && (
          <Button
            onClick={handleRemoveAvatar}
            variant="outline"
            size="sm"
            disabled={isUploading}
          >
            Remove
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        Click on the image to change your profile picture<br />
        Recommended: Square image, max 2MB
      </p>
    </div>
  )
}
