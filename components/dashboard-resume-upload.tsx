'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function DashboardResumeUpload({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      // Check file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Please upload a PDF, DOC, or DOCX file')
        return
      }

      // Check file size (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }

      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload')
      return
    }

    setUploading(true)

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-resume-${Date.now()}.${fileExt}`
      const filePath = `resumes/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath)

      // Update profile with resume URL
      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            resume_url: urlData.publicUrl,
            resume_name: file.name,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        if (updateError) {
          // If the error is about missing column, try without resume_name
          if (updateError.message && updateError.message.includes('resume_name')) {
            console.warn('resume_name column not found, updating without it')
            const { error: fallbackError } = await supabase
              .from('profiles')
              .update({
                resume_url: urlData.publicUrl,
                updated_at: new Date().toISOString(),
              })
              .eq('id', userId)

            if (fallbackError) {
              throw fallbackError
            }
          } else {
            throw updateError
          }
        }
      } catch (err) {
        console.error('Error updating profile:', err)
        throw err
      }

      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      toast.success('Resume uploaded successfully')
      router.refresh()
    } catch (error) {
      console.error('Error uploading resume:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload resume')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p className="mt-4 text-gray-500">Drag and drop your resume here, or click to browse</p>
        <p className="mt-2 text-sm text-gray-400">PDF, DOC, or DOCX up to 5MB</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <label className="block">
            <span className="sr-only">Choose file</span>
            <input
              type="file"
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              onChange={handleFileChange}
              ref={fileInputRef}
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
          </label>
        </div>

        {file && (
          <div className="flex items-center p-2 border rounded-lg">
            <div className="mr-2 text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Resume'}
          </Button>
        </div>
      </div>
    </div>
  )
}
