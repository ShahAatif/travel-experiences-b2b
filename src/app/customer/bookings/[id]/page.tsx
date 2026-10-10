'use client';

import { useParams } from 'next/navigation';
import CustomerLayout from '@/app/customer/layout';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/loading';
import { cn } from '@/lib/utils';
import { ArrowLeft, Calendar, DollarSign, Mail, User, FileText, CheckCircle2, Users } from 'lucide-react';
import Link from 'next/link';

export default function CustomerBookingDetailPage() {
  const params = useParams();

  const { data: booking, isLoading } = useQuery<any, Error>({
    queryKey: ['booking', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/bookings/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch booking');
      return res.json();
    },
    enabled: !!params.id,
  });

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </CustomerLayout>
    );
  }

  if (!booking) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Booking not found</p>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/customer/bookings">
            <button className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm font-medium">
              <ArrowLeft className="h-4 w-4" />
              Back to Bookings
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <Badge className={cn(
              'text-sm',
              booking.status === 'PENDING' && 'bg-amber-100 text-amber-700',
              booking.status === 'CONFIRMED' && 'bg-blue-100 text-blue-700',
              booking.status === 'CANCELLED' && 'bg-red-100 text-red-700',
              booking.status === 'COMPLETED' && 'bg-green-100 text-green-700',
            )}>
              {booking.status}
            </Badge>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Booking #{booking.bookingNumber}
        </h1>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Experience</p>
                <p className="font-medium text-lg">{booking.experience?.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-lg">
                  {booking.selectedDate.toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-medium text-lg">${booking.total.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Participants</p>
                <p className="font-medium text-lg">{booking.numberOfParticipants}</p>
              </div>
            </div>
          </div>

          {booking.specialRequests && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-500 mb-1">Special Requests</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {booking.specialRequests}
              </p>
            </div>
          )}

          {booking.payment?.status === 'COMPLETED' && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 mb-3">Payment</h3>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Payment Completed</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Paid on: {new Date(booking.payment.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </Card>

        <div className="mt-6">
          <Button className="w-full md:w-auto">
            Download Receipt
          </Button>
        </div>
      </div>
    </CustomerLayout>
  );
}