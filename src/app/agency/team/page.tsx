'use client';

import AgencyLayout from '@/app/agency/layout';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/loading';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, Mail, Eye, Edit, Trash2 } from 'lucide-react';
import { TeamMember } from '@/types';
import { useState } from 'react';

export default function TeamPage() {
  const { data: members, isLoading } = useQuery<TeamMember[], Error>({
    queryKey: ['team-members'],
    queryFn: async () => {
      const res = await fetch('/api/team/members', { cache: 'no-cache' });
      if (!res.ok) throw new Error('Failed to fetch team members');
      return res.json();
    },
  });

  const roleColors: Record<string, string> = {
    OWNER: 'bg-purple-100 text-purple-700',
    MANAGER: 'bg-blue-100 text-blue-700',
    AGENT: 'bg-green-100 text-green-700',
    VIEWER: 'bg-gray-100 text-gray-700',
  };

  if (isLoading) {
    return (
      <AgencyLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </AgencyLayout>
    );
  }

  return (
    <AgencyLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your team members and permissions
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </div>

        {members && members.length > 0 ? (
          <div className="space-y-4">
            {members.map((member) => (
              <Card key={member.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {member.user?.firstName?.[0]}
                        {member.user?.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {member.user?.firstName} {member.user?.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{member.user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={roleColors[member.role] || 'bg-gray-100 text-gray-700'}>
                      {member.role}
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No team members yet
            </h3>
            <p className="text-gray-500 mb-4">
              Invite your first team member to get started
            </p>
            <Button>Invite Member</Button>
          </Card>
        )}
      </div>
    </AgencyLayout>
  );
}