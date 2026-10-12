'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/loading';
import { ArrowRight, MapPin, Star, Users, Shield, Clock, ChevronRight } from 'lucide-react';

interface Experience {
  id: string;
  title: string;
  slug: string;
  description: string;
  destination: string;
  category: string;
  coverImage: string;
  images: string[];
  basePrice: number;
  minGroupSize: number;
  maxGroupSize: number;
  difficultyLevel: string;
  agencyId: string;
  status: string;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
  agency?: { name: string; id: string };
}

function FeaturedExperiences() {
  const { data: experiences, isLoading } = useQuery<{ success: boolean; data: Experience[] }, Error>({
    queryKey: ['experiences', 'featured'],
    queryFn: async () => {
      const res = await fetch('/api/experiences?status=ACTIVE&limit=6', { cache: 'no-cache' });
      if (!res.ok) throw new Error('Failed to fetch experiences');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <div className="h-48 bg-gray-200 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const items = experiences?.data?.slice(0, 3) || [];

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No experiences available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((exp) => (
        <Card
          key={exp.id}
          className="overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
        >
          <div className="relative h-48 overflow-hidden">
            <Image
              src={exp.coverImage}
              alt={exp.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <span className="bg-white/90 backdrop-blur text-xs font-medium px-2 py-1 rounded">
                {exp.category}
              </span>
              <span className="bg-white/90 backdrop-blur text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-500" fill="currentColor" />
                {exp.averageRating > 0 ? exp.averageRating.toFixed(1) : 'New'}
              </span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{exp.title}</h3>
            <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {exp.destination}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-primary-600">${exp.basePrice.toFixed(0)}</p>
                <p className="text-xs text-gray-500">per person</p>
              </div>
              <Link
                href={`/experiences/${exp.id}`}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
              >
                View Details <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function StatsSection() {
  const stats = [
    { label: 'Verified Agencies', value: '50+', icon: Shield },
    { label: 'Unique Experiences', value: '200+', icon: MapPin },
    { label: 'Happy Travelers', value: '10,000+', icon: Users },
    { label: 'Average Rating', value: '4.8★', icon: Star },
  ];

  return (
    <section className="bg-white py-16 border-y border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 mb-3">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Discover Experiences',
      description: 'Browse our curated collection of unique travel experiences from verified agencies worldwide.',
      icon: MapPin,
    },
    {
      number: '02',
      title: 'Book with Confidence',
      description: 'Secure your spot with flexible payment options and instant confirmation.',
      icon: Shield,
    },
    {
      number: '03',
      title: 'Enjoy Your Adventure',
      description: 'Experience unforgettable moments with expert guides and seamless logistics.',
      icon: Clock,
    },
  ];

  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simple steps to your next unforgettable adventure
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative text-center">
                <div className="mb-6">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 mb-4">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="text-4xl font-bold text-primary-600/20">{step.number}</div>
                  <h3 className="mt-2 text-xl font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 right-0 w-full h-0.5 bg-gradient-to-r from-primary-200 to-transparent" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Emma Richardson',
      role: 'Adventure Seeker',
      content: 'The Alpine Mountain Retreat was absolutely life-changing. The guides were knowledgeable, the lodging was cozy, and the views were beyond anything I\'ve ever seen.',
      rating: 5,
    },
    {
      name: 'Marcus Chen',
      role: 'Family Traveler',
      content: 'Booking our safari expedition was seamless. Every detail was handled professionally, and the kids still talk about the elephants months later.',
      rating: 5,
    },
    {
      name: 'Sofia Martinez',
      role: 'Wellness Enthusiast',
      content: 'The Mediterranean Coastal Escape was exactly the reset I needed. Private boat tours, farm-to-table dining, and relaxation at its finest.',
      rating: 5,
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            What Travelers Are Saying
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real experiences from real adventurers who discovered their next favorite memory with us
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 bg-gray-50 border-0">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white font-semibold">
                  {testimonial.name.charAt(0)}
                  {testimonial.name.split(' ')[1].charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="bg-primary-600 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready for Your Next Adventure?
        </h2>
        <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
          Join thousands of travelers discovering unique experiences around the world.
          Create your free account today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup">
            <Button size="lg" className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-3 w-full sm:w-auto">
              Create Free Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/experiences">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-primary-700 px-8 py-3 w-full sm:w-auto">
              Browse Experiences
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-blue-50 py-20 sm:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80')] bg-cover bg-center opacity-5" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur rounded-full px-4 py-2 mb-6 border border-gray-200">
              <span className="text-sm font-medium text-primary-700">New: 2025 Experiences Added</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Discover Amazing{' '}
              <span className="text-primary-600">Travel Experiences</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Book unique, curated experiences from verified agencies worldwide.
              From mountain retreats to coastal escapes — your next adventure starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-primary-600 text-white hover:bg-primary-700 px-8 py-3 w-full sm:w-auto gap-2">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/experiences">
                <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 w-full sm:w-auto">
                  Browse Experiences
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              No credit card required · Free to join · Cancel anytime
            </p>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 items-center text-gray-400 text-sm">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Verified Agencies
            </span>
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              10K+ Happy Travelers
            </span>
            <span className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              4.8 Average Rating
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              24/7 Support
            </span>
          </div>
        </div>
      </section>

      {/* Featured Experiences */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Experiences</h2>
              <p className="mt-2 text-gray-600">Hand-picked adventures from our top-rated agencies</p>
            </div>
            <Link href="/experiences" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <FeaturedExperiences />
        </div>
      </section>

      {/* Stats */}
      <StatsSection />

      {/* How It Works */}
      <HowItWorks />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* CTA */}
      <CTASection />

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <Link href="/" className="text-2xl font-bold text-gray-900 block mb-4">
                TravelHub
              </Link>
              <p className="text-gray-500 max-w-sm">
                Book amazing travel experiences from verified agencies worldwide.
                Your next adventure is just a click away.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/about" className="hover:text-gray-900">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-gray-900">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-gray-900">Careers</Link></li>
                <li><Link href="/press" className="hover:text-gray-900">Press</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/help" className="hover:text-gray-900">Help Center</Link></li>
                <li><Link href="/terms" className="hover:text-gray-900">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link></li>
                <li><Link href="/faq" className="hover:text-gray-900">FAQ</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Travel Experiences Hub. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-gray-600">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-gray-600">Instagram</a>
              <a href="#" className="text-gray-400 hover:text-gray-600">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}