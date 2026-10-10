'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  if (isAuthenticated) {
    const dashboard = user?.role === 'ADMIN' ? '/admin' :
      user?.role === 'AGENCY' ? '/agency/dashboard' : '/customer/dashboard';
    router.push(dashboard);
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Travel Experiences Hub</h1>
        <p className="text-gray-600 mb-8">Book amazing travel experiences from verified agencies</p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/login" className="bg-primary-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary-700 transition-colors">
            Sign In
          </Link>
          <Link href="/auth/signup" className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-300 transition-colors">
            Create Account
          </Link>
          <Link href="/experiences" className="bg-gray-100 text-gray-600 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-200 transition-colors">
            Browse Experiences
          </Link>
        </div>
      </div>
    </div>
  );
}