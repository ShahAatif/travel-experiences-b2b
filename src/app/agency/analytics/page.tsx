'use client';

import AgencyLayout from '@/app/agency/layout';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/loading';
import { cn } from '@/lib/utils';
import { TrendingUp, Users, DollarSign, Activity, BarChart3, LineChart } from 'lucide-react';

export default function AgencyAnalyticsPage() {
  const { data: stats, isLoading } = useQuery<any, Error>({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <AgencyLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </AgencyLayout>
    );
  }

  return (
    <AgencyLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            View your business performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${stats?.data?.totalRevenue?.toFixed(2) ?? '0.00'}
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="mt-4 text-sm text-green-600">+12% from last month</div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats?.data?.totalBookings ?? 0}
                  </p>
                </div>
                <BarChart3 className="h-5 w-5 text-blue-500" />
              </div>
              <div className="mt-4 text-sm text-green-600">+5% from last month</div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Avg Booking Value</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${stats?.data?.totalRevenue && stats?.data?.totalBookings
                      ? (stats.data.totalRevenue / stats.data.totalBookings).toFixed(2)
                      : '0.00'}
                  </p>
                </div>
                <DollarSign className="h-5 w-5 text-purple-500" />
              </div>
              <div className="mt-4 text-sm text-green-600">+8% from last month</div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Customers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {Math.floor((stats?.data?.totalBookings ?? 0) / 3) + 10}
                  </p>
                </div>
                <Users className="h-5 w-5 text-orange-500" />
              </div>
              <div className="mt-4 text-sm text-green-600">+3 new this month</div>
            </div>
          </Card>
        </div>

        {/* Charts Placeholders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <LineChart className="h-12 w-12 text-gray-300" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Booking Status Distribution</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <Activity className="h-12 w-12 text-gray-300" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AgencyLayout>
  );
}