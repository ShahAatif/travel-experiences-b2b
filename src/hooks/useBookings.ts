
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Booking } from '@/types';
import { toast } from 'sonner';

export function useBookings() {
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading, error } = useQuery<Booking[], Error>({
    queryKey: ['bookings'],
    queryFn: async () => {
      const res = await fetch('/api/bookings');
      if (!res.ok) throw new Error('Failed to fetch bookings');
      return res.json();
    },
  });

  const createBooking = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        body: data,
      });
      if (!res.ok) throw new Error('Failed to create booking');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create booking');
    },
  });

  const updateBookingStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Booking['status'] }) => {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update booking status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking status updated');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update booking status');
    },
  });

  return {
    bookings,
    isLoading,
    error,
    createBooking,
    updateBookingStatus,
  };
}

export function useBooking(id: string) {
  const { data: booking, isLoading, error } = useQuery<any, Error>({
    queryKey: ['booking', id],
    queryFn: async () => {
      const res = await fetch(`/api/bookings/${id}`);
      if (!res.ok) throw new Error('Failed to fetch booking');
      return res.json();
    },
    enabled: !!id,
  });

  return { booking, isLoading, error };
}