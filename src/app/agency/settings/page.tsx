'use client';

import AgencyLayout from '@/app/agency/layout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/shared/loading';
import { toast } from 'sonner';
import { Save, Shield, Bell, CreditCard as CreditCardIcon, Globe, MapPin } from 'lucide-react';

export default function AgencySettingsPage() {
  const queryClient = useQueryClient();

  const updateSettings = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch('/api/agency/profile', {
        method: 'PATCH',
        body: data,
      });
      if (!res.ok) throw new Error('Failed to update settings');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency'] });
      toast.success('Settings updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update settings');
    },
  });

  const { data: agency, isLoading } = useQuery<any, Error>({
    queryKey: ['agency'],
    queryFn: async () => {
      const res = await fetch('/api/agency/profile');
      if (!res.ok) throw new Error('Failed to fetch agency');
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

  const sections = [
    {
      icon: Globe,
      title: 'General Settings',
      description: 'Update your agency name and contact information',
    },
    {
      icon: CreditCardIcon,
      title: 'Bank Details',
      description: 'Configure payout information',
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Manage your notification preferences',
    },
    {
      icon: Shield,
      title: 'Security',
      description: 'Manage your account security',
    },
  ];

  return (
    <AgencyLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure your agency settings
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); updateSettings.mutate(new FormData(e.currentTarget)); }}>
          <div className="space-y-6">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.title} className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                      <p className="text-sm text-gray-500">{section.description}</p>
                    </div>
                  </div>
                  <div className="pl-12">
                    <Input
                      type="text"
                      name="name"
                      defaultValue={agency?.name}
                      disabled={updateSettings.isPending}
                      className="mb-4"
                      placeholder="Agency Name"
                    />
                    <Input
                      type="email"
                      name="email"
                      defaultValue={agency?.email}
                      disabled={updateSettings.isPending}
                      className="mb-4"
                      placeholder="Agency Email"
                    />
                  </div>
                </Card>
              );
            })}

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Save Changes</h3>
              <Button type="submit" disabled={updateSettings.isPending}>
                {updateSettings.isPending ? 'Saving...' : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save All Settings
                  </>
                )}
              </Button>
            </Card>
          </div>
        </form>
      </div>
    </AgencyLayout>
  );
}
