'use client';

import CustomerLayout from '@/app/customer/layout';
import { useQuery } from '@tanstack/react-query';
import { Booking } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/loading';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Calendar, User } from 'lucide-react';

export default function CustomerBookingsPage() {
  const { data: bookings, isLoading } = useQuery<Booking[], Error>({
    queryKey: ['customer-bookings'],
    queryFn: async () => {
      const res = await fetch('/api/bookings', { cache: 'no-cache' });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      return res.json();
    },
  });

  const statusStyles: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    CANCELLED: 'bg-red-100 text-red-700',
    COMPLETED: 'bg-green-100 text-green-700',
  };

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage your travel bookings
          </p>
        </div>

        {bookings && bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {booking.experience?.title || 'Experience'}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {booking.selectedDate.toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {booking.participantName}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {booking.numberOfParticipants} participant(s) · Booking #{booking.bookingNumber}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg text-gray-900">
                      ${booking.total.toFixed(2)}
                    </span>
                    <Badge className={statusStyles[booking.status]}>
                      {booking.status}
                    </Badge>
                    <Link href={`/customer/bookings/${booking.id}`}>
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No bookings yet
            </h3>
            <p className="text-gray-500 mb-4">
              Your bookings will appear here
            </p>
            <Link href="/experiences">
              <button className="bg-primary-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary-700 transition-colors">
                Browse Experiences
              </button>
            </Link>
          </Card>
        )}
      </div>
    </CustomerLayout>
  );
}