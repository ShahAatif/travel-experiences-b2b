'use client';

import AgencyLayout from '@/app/agency/layout';
import { Metadata } from 'next';
import { useQuery } from '@tanstack/react-query';
import { Experience } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/loading';
import Link from 'next/link';
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Copy } from 'lucide-react';
import { useState } from 'react';
import { useExperiences } from '@/hooks/useExperiences';

export default function AgencyExperiencesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: experiences, isLoading } = useQuery<Experience[], Error>({
    queryKey: ['experiences', 'agency'],
    queryFn: async () => {
      const res = await fetch('/api/experiences?status=all', { cache: 'no-cache' });
      if (!res.ok) throw new Error('Failed to fetch experiences');
      const result = await res.json();
      return result.data || [];
    },
  });

  const { deleteExperience } = useExperiences();

  const filteredExperiences = experiences?.filter((exp) => {
    const matchesSearch =
      !searchTerm ||
      exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || exp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    ACTIVE: 'bg-green-100 text-green-700',
    INACTIVE: 'bg-yellow-100 text-yellow-700',
    ARCHIVED: 'bg-red-100 text-red-700',
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
            <h1 className="text-2xl font-bold text-gray-900">Experiences</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your travel experiences
            </p>
          </div>
          <Link href="/agency/experiences/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Experience
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search experiences..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {/* Experiences Grid */}
        {filteredExperiences && filteredExperiences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperiences.map((exp) => (
              <Card key={exp.id} className="overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={exp.coverImage}
                    alt={exp.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className={statusColors[exp.status]}>
                      {exp.status}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{exp.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {exp.destination} · {exp.category}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-primary-600">
                      ${exp.basePrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {exp.averageRating}★
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/agency/experiences/${exp.id}`} className="flex-1">
                      <Button variant="ghost" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/agency/experiences/${exp.id}/edit`} className="flex-1">
                      <Button variant="ghost" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="flex-1 text-red-600 hover:text-red-700"
                      onClick={() => deleteExperience.mutate(exp.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
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
              No experiences found
            </h3>
            <p className="text-gray-500 mb-4">
              Start by creating your first travel experience
            </p>
            <Link href="/agency/experiences/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Experience
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </AgencyLayout>
  );
}