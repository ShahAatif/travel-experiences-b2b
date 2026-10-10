'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Experience } from '@/types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/loading';
import { useAuth } from '@/hooks/useAuth';
import { useBookings } from '@/hooks/useBookings';
import { toast } from 'sonner';
import { CheckCircle2, CreditCard, Calendar, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ExperienceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const { data: experience, isLoading: isLoadingExp } = useQuery<Experience, Error>({
    queryKey: ['experience', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/experiences/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch experience');
      return res.json();
    },
  });

  const { createBooking } = useBookings();
  const isBooking = createBooking.isPending;

  const onSubmit = (data: any) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to book');
      router.push('/auth/login');
      return;
    }
    createBooking.mutateAsync(data, {
      onSuccess: (result) => {
        toast.success('Booking confirmed!');
        router.push(`/customer/bookings/${result.data.id}`);
      },
      onError: (error) => {
        toast.error(error.message || 'Booking failed');
      },
    });
  };

  if (isLoadingExp) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Experience not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="relative h-96 rounded-xl overflow-hidden mb-6">
              <Image
                src={experience.coverImage}
                alt={experience.title}
                fill
                className="object-cover"
              />
            </div>

            <h1 className="text-3xl font-bold text-gray-900">{experience.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <span className="text-gray-500 flex items-center gap-1">
                <span>📍</span> {experience.destination}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">{experience.category}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">{experience.difficultyLevel}</span>
            </div>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">About This Experience</h2>
            <p className="text-gray-600 leading-relaxed">{experience.description}</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Reviews</h2>
            {experience.reviews && experience.reviews.length > 0 ? (
              <div className="space-y-4">
                {experience.reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.title}</span>
                      <span className="text-amber-500">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{review.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No reviews yet.</p>
            )}
          </Card>
        </div>

        <div>
          <Card className="sticky top-24 p-6 space-y-6">
            <div>
              <p className="text-3xl font-bold text-gray-900">
                ${experience.basePrice.toFixed(2)}
                <span className="text-base font-normal text-gray-500">/person</span>
              </p>
              <div className="mt-2 flex gap-4 text-sm text-gray-500">
                <span>Min: {experience.minGroupSize}</span>
                <span>•</span>
                <span>Max: {experience.maxGroupSize}</span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const data = {
                  selectedDate: new Date(formData.get('selectedDate') as string),
                  numberOfParticipants: parseInt(formData.get('numberOfParticipants') as string),
                  participantName: formData.get('participantName') as string,
                  participantEmail: formData.get('participantEmail') as string,
                  specialRequests: formData.get('specialRequests') as string,
                  experienceId: experience.id,
                };
                onSubmit(data);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Travel Date</label>
                <Input type="date" name="selectedDate" required className="w-full" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
                <Input
                  type="number"
                  name="numberOfParticipants"
                  min={1}
                  max={experience.maxGroupSize}
                  defaultValue={1}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                <Input type="text" name="participantName" placeholder="Your full name" required className="w-full" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input type="email" name="participantEmail" placeholder="your@email.com" required className="w-full" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests (optional)</label>
                <textarea
                  name="specialRequests"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Dietary needs, accessibility, etc."
                />
              </div>

              <Button type="submit" className="w-full" disabled={isBooking}>
                {isBooking ? 'Processing...' : (
                  <>Book Now <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </form>

            <div className="grid grid-cols-2 gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Flexible dates</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> Free cancellation</div>
              <div className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> Secure payment</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Verified host</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}