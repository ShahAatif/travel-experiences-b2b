import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Agency } from '@/types';
import { toast } from 'sonner';

export function useAgency() {
  const queryClient = useQueryClient();

  const { data: agency, isLoading, error } = useQuery<Agency, Error>({
    queryKey: ['agency'],
    queryFn: async () => {
      const res = await fetch('/api/agency/profile');
      if (!res.ok) throw new Error('Failed to fetch agency profile');
      return res.json();
    },
  });

  const updateAgency = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch('/api/agency/profile', {
        method: 'PATCH',
        body: data,
      });
      if (!res.ok) throw new Error('Failed to update agency profile');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency'] });
      toast.success('Agency profile updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update agency profile');
    },
  });

  return {
    agency,
    isLoading,
    error,
    updateAgency,
  };
}