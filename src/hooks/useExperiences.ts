import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Experience } from '@/types';
import { toast } from 'sonner';

export function useExperiences() {
  const queryClient = useQueryClient();

  const { data: experiences = [], isLoading, error } = useQuery<Experience[], Error>({
    queryKey: ['experiences'],
    queryFn: async () => {
      const res = await fetch('/api/experiences');
      if (!res.ok) throw new Error('Failed to fetch experiences');
      return res.json();
    },
  });

  const createExperience = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch('/api/experiences', {
        method: 'POST',
        body: data,
      });
      if (!res.ok) throw new Error('Failed to create experience');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      toast.success('Experience created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create experience');
    },
  });

  const updateExperience = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const res = await fetch(`/api/experiences/${id}`, {
        method: 'PATCH',
        body: data,
      });
      if (!res.ok) throw new Error('Failed to update experience');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      toast.success('Experience updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update experience');
    },
  });

  const deleteExperience = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/experiences/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete experience');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      toast.success('Experience deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete experience');
    },
  });

  return {
    experiences,
    isLoading,
    error,
    createExperience,
    updateExperience,
    deleteExperience,
  };
}

export function useExperience(id: string) {
  const { data: experience, isLoading, error } = useQuery<Experience, Error>({
    queryKey: ['experience', id],
    queryFn: async () => {
      const res = await fetch(`/api/experiences/${id}`);
      if (!res.ok) throw new Error('Failed to fetch experience');
      return res.json();
    },
    enabled: !!id,
  });

  return { experience, isLoading, error };
}