import { useQuery } from '@tanstack/react-query';
import { DashboardStats } from '@/types';

export function useDashboardStats() {
  const { data, isLoading, error } = useQuery<DashboardStats, Error>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats');
      if (!res.ok) throw new Error('Failed to fetch dashboard stats');
      return res.json();
    },
  });

  return { data, isLoading, error };
}

export function useRevenueChart() {
  const { data, isLoading, error } = useQuery<
    { month: string; revenue: number; bookings: number }[],
    Error
  >({
    queryKey: ['revenue-chart'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/revenue-trend');
      if (!res.ok) throw new Error('Failed to fetch revenue trend');
      return res.json();
    },
  });

  return { data, isLoading, error };
}

export function useTopExperiences() {
  const { data, isLoading, error } = useQuery<
    { id: string; title: string; bookings: number; revenue: number }[],
    Error
  >({
    queryKey: ['top-experiences'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/top-experiences');
      if (!res.ok) throw new Error('Failed to fetch top experiences');
      return res.json();
    },
  });

  return { data, isLoading, error };
}