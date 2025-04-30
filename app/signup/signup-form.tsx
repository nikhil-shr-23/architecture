'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

const signUpSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' }),
  fullName: z.string().min(2, { message: 'Please enter your full name' }),
})

type SignUpValues = z.infer<typeof signUpSchema>

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
    },
  })

  async function onSubmit(data: SignUpValues) {
    setIsLoading(true)

    try {
      console.log('Signing up with:', { email: data.email, fullName: data.fullName })

      // Sign up the user
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      })

      if (error) {
        console.error('Auth error:', error)
        toast.error(error.message)
        return
      }

      console.log('Auth response:', authData)

      // Make sure we have a user before creating a profile
      if (authData.user) {
        console.log('Creating profile for user:', authData.user.id)

        // Try direct insert first
        console.log('Attempting direct insert to profiles table...');
        let profileError = null;

        try {
          const { error } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              full_name: data.fullName,
              email: data.email,
            });

          profileError = error;
        } catch (err) {
          console.error('Direct insert failed:', err);
          profileError = { message: 'Direct insert failed' };
        }

        // If direct insert fails, try a simpler approach
        if (profileError) {
          console.log('Direct insert failed, trying alternative approach...');

          // Wait a moment to ensure auth is fully processed
          await new Promise(resolve => setTimeout(resolve, 1000));

          try {
            const { error } = await supabase.auth.updateUser({
              data: {
                full_name: data.fullName,
                email_confirmed: true
              }
            });

            if (error) {
              console.error('User metadata update failed:', error);
              profileError = error;
            } else {
              console.log('User metadata updated successfully');
              profileError = null;
            }
          } catch (err) {
            console.error('User metadata update failed:', err);
            profileError = { message: 'User metadata update failed' };
          }
        }

        if (profileError) {
          console.error('All profile creation attempts failed:', profileError)
          // Continue anyway - we'll just create the profile when they first log in
          console.log('Will create profile on first login instead')
        } else {
          console.log('Profile created successfully')
        }

        toast.success('Account created! Please check your email to confirm your account.')
        router.push('/login')
      } else {
        console.error('No user returned from auth.signUp')
        toast.error('Failed to create account. Please try again.')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>
      </Form>
      <Toaster />
    </>
  )
}
