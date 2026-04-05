import type { Metadata } from 'next';
import { Suspense } from 'react';
import SearchPageClient from '@/components/SearchPageClient';

export const metadata: Metadata = {
  title: 'Search Properties — Awas',
  description:
    'Browse thousands of properties across 99acres, MagicBricks, and Housing.com with powerful filters.',
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      }
    >
      <SearchPageClient />
    </Suspense>
  );
}
