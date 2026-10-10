'use client';

import AgencyLayout from '@/app/agency/layout';
import { Metadata } from 'next';
import { useQuery } from '@tanstack/react-query';
import { useRevenueChart } from '@/hooks/useDashboard';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/loading';
import { DashboardStats } from '@/types';
import { CalendarDays, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function AgencyDashboardPage() {
  const { data: stats, isLoading: isLoadingStats } = useQuery<DashboardStats, Error>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats');
      if (!res.ok) throw new Error('Failed to fetch dashboard stats');
      return res.json();
    },
  });

  const { data: revenueTrend } = useRevenueChart();

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats?.totalBookings ?? 0,
      icon: CalendarDays,
      className: 'bg-blue-500 text-white',
    },
    {
      title: 'Total Revenue',
      value: stats?.totalRevenue ?? 0,
      icon: DollarSign,
      className: 'bg-green-500 text-white',
    },
    {
      title: 'Pending Approvals',
      value: stats?.pendingApprovals ?? 0,
      icon: BarChart3,
      className: 'bg-amber-500 text-white',
    },
    {
      title: 'Completed Bookings',
      value: stats?.completedBookings ?? 0,
      icon: TrendingUp,
      className: 'bg-purple-500 text-white',
    },
  ];

  return (
    <AgencyLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back! Here&apos;s your business overview.
            </p>
          </div>
          <Link
            href="/agency/experiences/new"
            className="bg-primary-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            + New Experience
          </Link>
        </div>

        {isLoadingStats ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Card key={card.title} className="overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">{card.title}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {typeof card.value === 'number'
                            ? card.value
                            : card.value}
                        </p>
                      </div>
                      <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', card.className)}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Revenue Chart + Top Experiences */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
                  {revenueTrend && revenueTrend.length > 0 ? (
                    <div className="space-y-3">
                      {revenueTrend.map((item) => (
                        <div key={item.month}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">{item.month}</span>
                            <span className="font-medium">${item.revenue.toFixed(2)}</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full bg-primary-600 rounded-full transition-all duration-500"
                              style={{
                                width: `${
                                  (item.revenue / Math.max(...revenueTrend.map((r) => r.revenue))) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No revenue data available.</p>
                  )}
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Top Experiences</h3>
                  {stats?.topExperiences && stats.topExperiences.length > 0 ? (
                    <div className="space-y-3">
                      {stats.topExperiences.slice(0, 5).map((exp) => (
                        <Link
                          key={exp.id}
                          href={`/agency/experiences/${exp.id}`}
                          className="flex items-center justify-between group"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                              {exp.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {exp.bookings} bookings
                            </p>
                          </div>
                          <span className="font-semibold text-sm text-gray-700">
                            ${exp.revenue.toFixed(2)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No top experiences available.</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Recent Bookings */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
                {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentBookings.slice(0, 8).map((booking) => (
                      <Link
                        key={booking.id}
                        href={`/agency/bookings/${booking.id}`}
                        className="flex items-center justify-between border-b border-gray-100 last:border-0 pb-3 last:pb-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.experience?.title || 'Experience'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Booking #{booking.bookingNumber} · {booking.selectedDate.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={cn(
                              'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                              booking.status === 'CONFIRMED'
                                ? 'bg-green-100 text-green-700'
                                : booking.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-red-100 text-red-700'
                            )}
                          >
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
                  <p className="text-gray-500">No bookings yet. Start creating experiences to attract customers.</p>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </AgencyLayout>
  );
}
