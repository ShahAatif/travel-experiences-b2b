'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-6 dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
              TravelHub
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {currentYear} Travel Experiences Hub. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/about" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              About
            </Link>
            <Link href="/contact" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Contact
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function MobileHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-950 sm:hidden">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-lg font-bold">
          TravelHub
        </Link>
        <button
          type="button"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <nav className="mt-4 mb-2 space-y-1">
          <Link href="/" className="block py-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            Home
          </Link>
          <Link href="/customer/dashboard" className="block py-2 text-sm text-gray-600 dark:text-gray-300">
            Dashboard
          </Link>
          <Link href="/customer/bookings" className="block py-2 text-sm text-gray-600 dark:text-gray-300">
            My Bookings
          </Link>
          <Link href="/customer/profile" className="block py-2 text-sm text-gray-600 dark:text-gray-300">
            Profile
          </Link>
        </nav>
      )}
    </header>
  );
}

import { useState } from 'react';
import { X, Menu } from 'lucide-react';