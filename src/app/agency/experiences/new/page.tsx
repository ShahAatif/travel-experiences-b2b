'use client';

import AgencyLayout from '@/app/agency/layout';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/shared/loading';
import { toast } from 'sonner';
import { useExperiences } from '@/hooks/useExperiences';
import { cn } from '@/lib/utils';
import { Upload, Calendar, DollarSign, Users, Image, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewExperiencePage() {
  const router = useRouter();
  const { createExperience } = useExperiences();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);

      await createExperience.mutateAsync(formData, {
        onSuccess: () => {
          toast.success('Experience created successfully');
          router.push('/agency/experiences');
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to create experience');
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = cn(
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
    'dark:border-gray-600 dark:bg-gray-800 dark:text-white'
  );

  return (
    <AgencyLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/agency/experiences">
            <button className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm font-medium">
              <ArrowLeft className="h-4 w-4" />
              Back to Experiences
            </button>
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Create New Experience
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                name="title"
                required
                placeholder="e.g. Sunset Beach Tour"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <Input
                name="slug"
                required
                placeholder="sunset-beach-tour"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                required
                rows={4}
                placeholder="Describe your experience in detail..."
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination <span className="text-red-500">*</span>
                </label>
                <Input
                  name="destination"
                  required
                  placeholder="e.g. Bali, Indonesia"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  required
                  className={inputClass}
                >
                  <option value="">Select category</option>
                  <option value="TOURS">Tours & Sightseeing</option>
                  <option value="ADVENTURES">Adventures</option>
                  <option value="CRUISES">Cruises</option>
                  <option value="CULTURAL">Cultural</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image URL <span className="text-red-500">*</span>
              </label>
              <Input
                name="coverImage"
                required
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Pricing & Capacity</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Price (per person) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    name="basePrice"
                    type="number"
                    step="0.01"
                    required
                    placeholder="99.00"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level <span className="text-red-500">*</span>
                </label>
                <select name="difficultyLevel" required className={inputClass}>
                  <option value="">Select level</option>
                  <option value="EASY">Easy</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="HARD">Hard</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Group Size <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    name="minGroupSize"
                    type="number"
                    min="1"
                    defaultValue="1"
                    required
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Group Size <span className="text-red-500">*</span>
                </label>
                <Input
                  name="maxGroupSize"
                  type="number"
                  min="1"
                  defaultValue="20"
                  required
                  className={inputClass}
                />
              </div>
            </div>
          </Card>

          <div className="flex items-center gap-4">
            <Link href="/agency/experiences">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>Creating Experience...</>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Create Experience
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AgencyLayout>
  );
}
