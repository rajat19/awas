'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PropertyCard from '@/components/PropertyCard';
import FilterSidebar from '@/components/FilterSidebar';
import { searchParamsToFilters, parseQuery, filtersToSearchParams } from '@/lib/query-parser';
import { formatPlatform } from '@/lib/formatters';
import type { PropertyFilters, PropertyListing, Platform, SortBy } from '@/lib/types';

export default function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<PropertyFilters>({});
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [platformBreakdown, setPlatformBreakdown] = useState<Record<Platform, number>>({
    '99acres': 0,
    magicbricks: 0,
    housing: 0,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [scraperErrors, setScraperErrors] = useState<string[]>([]);

  // Parse initial filters from URL
  useEffect(() => {
    const parsed = searchParamsToFilters(searchParams);
    const q = searchParams.get('q') || '';

    // If we have a raw query but no filters, parse it
    if (q && Object.keys(parsed).length <= 1) {
      const queryParsed = parseQuery(q);
      setFilters(queryParsed.filters);
      setQuery(q);
    } else {
      setFilters(parsed);
      setQuery(q);
    }
  }, [searchParams]);

  // Search when filters change — call real API
  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    const doSearch = async () => {
      try {
        // Build query params from filters using the unified utility
        const params = filtersToSearchParams(filters);

        const res = await fetch(`/api/search?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const data = await res.json();
        setListings(data.listings || []);
        setTotalCount(data.totalCount || 0);
        setPlatformBreakdown(
          data.platformBreakdown || { '99acres': 0, magicbricks: 0, housing: 0 }
        );

        // Collect scraper errors for display
        const errors = (data.scraperMeta || [])
          .filter((m: { error?: string }) => m.error)
          .map((m: { platform: string; error: string }) => `${m.platform}: ${m.error}`);
        setScraperErrors(errors);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.error('Search failed:', err);
        setListings([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    // Small debounce to avoid rapid re-fetches
    const timer = setTimeout(doSearch, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [filters]);

  const handleFiltersChange = useCallback(
    (newFilters: PropertyFilters) => {
      setFilters(newFilters);
      // Update URL
      const params = filtersToSearchParams(newFilters);
      if (query) params.set('q', query);
      router.replace(`/search?${params.toString()}`, { scroll: false });
    },
    [query, router]
  );

  const [isParsing, setIsParsing] = useState(false);

  const handleSearch = useCallback(
    async (newQuery: string) => {
      if (!newQuery.trim()) return;
      setQuery(newQuery);
      setIsParsing(true);
      
      try {
        const res = await fetch('/api/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: newQuery })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.filters) {
            setFilters(data.filters);
            const params = filtersToSearchParams(data.filters);
            params.set('q', newQuery);
            router.replace(`/search?${params.toString()}`, { scroll: false });
            return;
          }
        }
      } catch (e) {
        console.error('AI Parse failed', e);
      } finally {
        setIsParsing(false);
      }

      const parsed = parseQuery(newQuery);
      setFilters(parsed.filters);
      const params = filtersToSearchParams(parsed.filters);
      params.set('q', newQuery);
      router.replace(`/search?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  const handleSort = useCallback(
    (sortBy: SortBy) => {
      handleFiltersChange({ ...filters, sortBy });
    },
    [filters, handleFiltersChange]
  );

  return (
    <div className="min-h-screen bg-base-100 pt-16">
      {/* Search header */}
      <div className="border-b border-base-content/5 bg-base-100/80 backdrop-blur-xl sticky top-16 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="btn btn-ghost btn-sm lg:hidden"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
              Filters
            </button>

            {/* Search bar */}
            <div className="flex-1 relative">
              <div className="flex items-center bg-base-200/50 rounded-xl border border-base-content/5 overflow-hidden">
                <div className="pl-3.5 text-base-content/30">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  id="search-page-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isParsing && handleSearch(query)}
                  placeholder="Refine your search..."
                  className="flex-1 bg-transparent px-3 py-2.5 text-sm text-base-content placeholder:text-base-content/25 focus:outline-none"
                />
                <button
                  onClick={() => handleSearch(query)}
                  disabled={isParsing || !query.trim()}
                  className="btn btn-primary btn-sm rounded-lg mr-1.5"
                >
                  {isParsing ? <span className="loading loading-spinner loading-xs"></span> : 'Search'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Filter Sidebar (single instance — handles both mobile overlay & desktop static) */}
          <FilterSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
          />

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h1 className="text-lg font-bold text-base-content">
                  {isLoading ? (
                    <span className="animate-pulse">Searching...</span>
                  ) : (
                    <>
                      {totalCount} Properties{' '}
                      {filters.city && (
                        <span className="text-base-content/40 font-normal">
                          in {filters.city}
                          {filters.localities?.length
                            ? `, ${filters.localities.join(', ')}`
                            : ''}
                        </span>
                      )}
                    </>
                  )}
                </h1>

                {/* Platform breakdown */}
                {!isLoading && (
                  <div className="flex items-center gap-3 mt-1.5">
                    {(Object.entries(platformBreakdown) as [Platform, number][])
                      .filter(([, count]) => count > 0)
                      .map(([platform, count]) => (
                        <span key={platform} className="flex items-center gap-1 text-xs text-base-content/40">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              platform === '99acres'
                                ? 'bg-green-500'
                                : platform === 'magicbricks'
                                  ? 'bg-red-500'
                                  : 'bg-blue-500'
                            }`}
                          />
                          {formatPlatform(platform)}: {count}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Sort */}
                <select
                  id="sort-select"
                  className="select select-sm select-bordered text-xs rounded-lg bg-base-100"
                  value={filters.sortBy || 'relevance'}
                  onChange={(e) => handleSort(e.target.value as SortBy)}
                >
                  <option value="relevance">Relevance</option>
                  <option value="price_low_to_high">Price: Low to High</option>
                  <option value="price_high_to_low">Price: High to Low</option>
                  <option value="price_sqft_low_to_high">Price/sq.ft: Low to High</option>
                  <option value="price_sqft_high_to_low">Price/sq.ft: High to Low</option>
                  <option value="area_high_to_low">Area: High to Low</option>
                  <option value="area_low_to_high">Area: Low to High</option>
                  <option value="newest_first">Newest First</option>
                </select>

                {/* View toggle */}
                <div className="hidden sm:flex items-center border border-base-content/20 bg-base-200/50 rounded-lg p-0.5 shadow-sm gap-0.5 shrink-0">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`rounded-md transition-all flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 shrink-0 ${
                      viewMode === 'grid' 
                        ? 'bg-primary text-primary-content shadow-md' 
                        : 'text-base-content/60 hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`rounded-md transition-all flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 shrink-0 ${
                      viewMode === 'list' 
                        ? 'bg-primary text-primary-content shadow-md' 
                        : 'text-base-content/60 hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Active filter pills */}
            {(filters.bhkConfig?.length ||
              filters.propertyType?.length ||
              filters.furnishingStatus?.length ||
              filters.constructionStatus?.length ||
              filters.listedBy?.length) && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {filters.bhkConfig?.map((bhk) => (
                  <span key={bhk} className="badge badge-sm badge-primary gap-1">
                    {bhk.toUpperCase().replace('BHK', ' BHK')}
                    <button
                      onClick={() =>
                        handleFiltersChange({
                          ...filters,
                          bhkConfig: filters.bhkConfig?.filter((b) => b !== bhk),
                        })
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
                {filters.propertyType?.map((type) => (
                  <span key={type} className="badge badge-sm badge-secondary gap-1">
                    {type.replace(/_/g, ' ')}
                    <button
                      onClick={() =>
                        handleFiltersChange({
                          ...filters,
                          propertyType: filters.propertyType?.filter((t) => t !== type),
                        })
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
                {filters.furnishingStatus?.map((f) => (
                  <span key={f} className="badge badge-sm badge-accent gap-1">
                    {f.replace(/_/g, ' ')}
                    <button
                      onClick={() =>
                        handleFiltersChange({
                          ...filters,
                          furnishingStatus: filters.furnishingStatus?.filter((s) => s !== f),
                        })
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Loading skeleton */}
            {isLoading ? (
              <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-base-content/5 overflow-hidden">
                    <div className="h-48 bg-base-200/50 animate-shimmer" />
                    <div className="p-5 space-y-3">
                      <div className="h-6 w-1/3 bg-base-200/50 rounded animate-shimmer" />
                      <div className="h-4 w-2/3 bg-base-200/30 rounded animate-shimmer" />
                      <div className="h-4 w-1/2 bg-base-200/20 rounded animate-shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Property grid */}
                <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                  {listings.map((listing, i) => (
                    <PropertyCard key={listing.id} listing={listing} index={i} viewMode={viewMode} />
                  ))}
                </div>

                {/* Pagination */}
                {listings.length > 0 && (
                  <div className="flex justify-center mt-10">
                    <div className="join">
                      <button className="join-item btn btn-sm btn-ghost">«</button>
                      <button className="join-item btn btn-sm btn-primary">1</button>
                      <button className="join-item btn btn-sm btn-ghost">2</button>
                      <button className="join-item btn btn-sm btn-ghost">3</button>
                      <button className="join-item btn btn-sm btn-ghost">»</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
