import LoginForm from './login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Archinnection</h1>
          <h2 className="mt-2 text-xl text-gray-600">The Professional Network for Architects</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Sign in to your account</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />

            <div className="mt-6 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
