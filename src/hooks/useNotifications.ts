import { useQuery, useMutation } from '@tanstack/react-query';
import { NotificationPreference } from '@/types';
import { toast } from 'sonner';

export function useNotificationPreferences() {
  const { data: preferences, isLoading, error } = useQuery<NotificationPreference, Error>({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const res = await fetch('/api/notification-preferences');
      if (!res.ok) throw new Error('Failed to fetch notification preferences');
      return res.json();
    },
  });

  const updateNotificationPreferences = useMutation({
    mutationFn: async (data: Partial<NotificationPreference>) => {
      const res = await fetch('/api/notification-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update notification preferences');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Notification preferences updated');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update notification preferences');
    },
  });

  return {
    preferences,
    isLoading,
    error,
    updateNotificationPreferences,
  };
}