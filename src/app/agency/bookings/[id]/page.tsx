'use client';

import { useParams } from 'next/navigation';
import AgencyLayout from '@/app/agency/layout';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/shared/loading';
import { useRouter } from 'next/navigation';
import { Booking } from '@/types';
import { cn } from '@/lib/utils';
import { ArrowLeft, Calendar, DollarSign, Mail, User, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useEffect } from 'react';

export default function AgencyBookingDetailPage() {
  const params = useParams();
  const router = useRouter();

  const { data: booking, isLoading } = useQuery<Booking, Error>({
    queryKey: ['booking', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/bookings/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch booking');
      return res.json();
    },
    enabled: !!params.id,
  });

  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`/api/bookings/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update booking');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Booking updated');
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(error.message);
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

  if (!booking) {
    return (
      <AgencyLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Booking not found</p>
        </div>
      </AgencyLayout>
    );
  }

  return (
    <AgencyLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/agency/bookings">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Details Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Booking Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-medium">{booking.experience?.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{booking.selectedDate.toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">{booking.participantName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{booking.participantEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-bold text-lg">${booking.total.toFixed(2)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Participants</p>
                  <p className="font-medium">{booking.numberOfParticipants}</p>
                </div>
              </div>
              {booking.specialRequests && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">Special Requests</p>
                  <p className="text-sm">{booking.specialRequests}</p>
                </div>
              )}
            </Card>
          </div>

          {/* Actions Column */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Update Status</h2>
              <div className="space-y-2">
                {['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
                  <Button
                    key={status}
                    variant={booking.status === status ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => updateStatus.mutate(status)}
                    disabled={updateStatus.isPending}
                  >
                    {status === 'CONFIRMED' && <CheckCircle2 className="h-4 w-4 mr-2" />}
                    {status}
                  </Button>
                ))}
              </div>
            </Card>

            {booking.invoice && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Invoice</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Invoice #</p>
                    <p className="font-medium">{booking.invoice.invoiceNumber}</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">
                    {booking.invoice.status}
                  </Badge>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AgencyLayout>
  );
}