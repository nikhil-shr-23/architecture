'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const jobFormSchema = z.object({
  title: z.string().min(3, { message: 'Job title must be at least 3 characters' }),
  company_name: z.string().min(2, { message: 'Company name must be at least 2 characters' }),
  location: z.string().min(2, { message: 'Location must be at least 2 characters' }),
  job_type: z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship']),
  salary_range: z.string().optional(),
  description: z.string().min(20, { message: 'Description must be at least 20 characters' }),
  requirements: z.string().min(20, { message: 'Requirements must be at least 20 characters' }),
  contact_email: z.string().email({ message: 'Please enter a valid email address' }),
  application_url: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
})

type JobFormValues = z.infer<typeof jobFormSchema>

export default function JobPostForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: '',
      company_name: '',
      location: '',
      job_type: 'full-time',
      salary_range: '',
      description: '',
      requirements: '',
      contact_email: '',
      application_url: '',
    },
  })

  async function onSubmit(data: JobFormValues) {
    setIsSubmitting(true)

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError) {
        throw userError
      }

      const { error } = await supabase
        .from('jobs')
        .insert({
          ...data,
          posted_by: userData.user.id,
          status: 'active',
        })

      if (error) {
        throw error
      }

      toast.success('Job posted successfully!')
      setIsOpen(false)
      form.reset()
      router.refresh()
    } catch (error) {
      console.error('Error posting job:', error)
      toast.error(error.message || 'Failed to post job')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Post a Job</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a New Job</DialogTitle>
          <DialogDescription>
            Fill out the form below to post a new job opportunity for architects.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Senior Architect" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Architecture" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="New York, NY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="job_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="salary_range"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary Range (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="$80,000 - $120,000" {...field} />
                  </FormControl>
                  <FormDescription>
                    Providing a salary range can attract more qualified candidates
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the job responsibilities and what the role entails..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirements</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List the skills, qualifications, and experience required..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="jobs@acmearchitecture.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="application_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://acmearchitecture.com/careers/apply" {...field} />
                  </FormControl>
                  <FormDescription>
                    External link where candidates can apply
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Posting...' : 'Post Job'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
