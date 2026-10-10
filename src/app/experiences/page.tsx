'use client';

import { Suspense, useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Experience } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/loading';
import { Search, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('term') || '');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: experiences, isLoading } = useQuery<Experience[], Error>({
    queryKey: ['experiences', searchTerm, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (selectedCategory) params.set('category', selectedCategory);
      const res = await fetch(`/api/experiences?${params.toString()}`, {
        cache: 'no-cache',
      });
      if (!res.ok) throw new Error('Failed to fetch experiences');
      return res.json();
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set('term', searchTerm);
    router.push(`/search?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <section className="bg-white">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Discover Amazing{' '}
              <span className="text-primary-600"> Travel Experiences</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              Book unique experiences from verified agencies worldwide
            </p>

            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search destinations, activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 text-base"
                />
                <Button type="submit" size="lg" className="px-8">
                  Search <Search className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>

            <div className="mt-8 flex justify-center gap-2">
              {['Tours', 'Adventures', 'Cruises', 'Cultural'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat.toLowerCase())}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                    selectedCategory === cat.toLowerCase()
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {searchTerm ? `Results for "${searchTerm}"` : 'Featured Experiences'}
        </h2>

        {experiences && experiences.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No experiences found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {experiences?.map((exp) => (
              <Card
                key={exp.id}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => router.push(`/experiences/${exp.id}`)}
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={exp.coverImage}
                    alt={exp.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg text-gray-900">{exp.title}</h3>
                      <p className="text-sm text-gray-500">{exp.destination}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary-600">
                        ${exp.basePrice.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">/person</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Min: {exp.minGroupSize} · Max: {exp.maxGroupSize}
                    </span>
                    <span className="text-sm font-medium text-amber-500">
                      {exp.averageRating > 0 ? `${exp.averageRating}★` : 'No reviews'}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}