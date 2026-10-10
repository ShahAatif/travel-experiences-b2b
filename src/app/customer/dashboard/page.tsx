'use client';

import CustomerLayout from '@/app/customer/layout';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/loading';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CalendarDays, DollarSign, Users } from 'lucide-react';
import { DashboardStats } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export default function CustomerDashboardPage() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery<DashboardStats, Error>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats');
      if (!res.ok) throw new Error('Failed to fetch dashboard stats');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Here&apos;s your activity overview.
            </p>
          </div>
          <Link
            href="/customer/bookings/new"
            className="bg-primary-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            + New Booking
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">My Bookings</h3>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalBookings ?? 0}
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-gray-500">
                  {stats?.completedBookings ?? 0} completed
                </span>
                <div className="flex space-x-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        'h-3 w-3 inline-block rounded-full',
                        i < (stats?.averageRating ?? 0)
                          ? 'bg-yellow-300'
                          : 'bg-gray-200'
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Total Spent</h3>
              <p className="text-2xl font-bold text-gray-900">
                ${stats?.totalRevenue?.toFixed(2) ?? '0.00'}
              </p>
              <div className="text-sm text-gray-500 mt-1">
                Average per booking:{" "}
                ${((stats?.totalRevenue ?? 0) / Math.max(1, stats?.totalBookings ?? 1)).toFixed(
                  2
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Upcoming Trips</h3>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.completedBookings ?? 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Completed bookings
              </p>
            </div>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
            {stats?.recentBookings && stats.recentBookings.length > 0 ? (
              <div className="space-y-3">
                {stats.recentBookings.slice(0, 5).map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/customer/bookings/${booking.id}`}
                    className="flex items-center justify-between border-b border-gray-100 last:border-0 pb-3 last:pb-0"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {booking.experience?.title || 'Travel Experience'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {booking.selectedDate.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 rounded-full text-xs font-medium">
                        {booking.status}
                      </span>
                      <p className="text-sm font-semibold text-gray-700 mt-1">
                        ${booking.total.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">You have no bookings yet. Start exploring amazing experiences!</p>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Link
                href="/customer/bookings"
                className="flex items-center justify-center border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 text-center">
                  <CalendarDays className="h-5 w-5 text-primary-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">View Bookings</p>
                </div>
              </Link>

              <Link
                href="/customer/profile"
                className="flex items-center justify-center border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 text-center">
                  <Users className="h-5 w-5 text-primary-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Edit Profile</p>
                </div>
              </Link>

              <Link
                href="/experiences"
                className="flex items-center justify-center border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 text-center">
                  <DollarSign className="h-5 w-5 text-primary-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Browse Experiences</p>
                </div>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </CustomerLayout>
  );
}