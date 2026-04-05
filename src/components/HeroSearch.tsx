'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { parseQuery, filtersToSearchParams } from '@/lib/query-parser';

const EXAMPLE_QUERIES = [
  'Looking for a 3 BHK semi-furnished apartment in Vrindavan Yojna by owner under 80 lakhs',
  '2 BHK ready to move flat in Gomti Nagar under 50 lakhs',
  'Independent house in Bangalore with parking under 1.5 crore',
  '4 BHK furnished villa in Pune by builder above 2 crore',
  '1 BHK apartment in Noida under 30 lakhs with gym and pool',
];

export default function HeroSearch() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<Record<string, string> | null>(null);
  const router = useRouter();

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (value.trim().length > 5) {
      const result = parseQuery(value);
      const preview: Record<string, string> = {};
      const f = result.filters;
      if (f.bhkConfig?.length) preview['Config'] = f.bhkConfig.join(', ').toUpperCase();
      if (f.propertyType?.length)
        preview['Type'] = f.propertyType.map((t) => t.replace(/_/g, ' ')).join(', ');
      if (f.city) preview['City'] = f.city;
      if (f.localities?.length) preview['Area'] = f.localities.join(', ');
      if (f.furnishingStatus?.length) preview['Furnishing'] = f.furnishingStatus.join(', ');
      if (f.constructionStatus?.length)
        preview['Status'] = f.constructionStatus.map((s) => s.replace(/_/g, ' ')).join(', ');
      if (f.listedBy?.length) preview['By'] = f.listedBy.join(', ');
      if (f.budget?.max)
        preview['Budget'] =
          `${f.budget.min ? `₹${(f.budget.min / 100000).toFixed(0)}L` : ''} – ₹${f.budget.max >= 10000000 ? `${(f.budget.max / 10000000).toFixed(1)}Cr` : `${(f.budget.max / 100000).toFixed(0)}L`}`;
      else if (f.budget?.min)
        preview['Budget'] = `From ₹${(f.budget.min / 100000).toFixed(0)}L`;
      setParsedPreview(Object.keys(preview).length > 0 ? preview : null);
    } else {
      setParsedPreview(null);
    }
  }, []);

  const [isParsing, setIsParsing] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setIsParsing(true);
    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.filters) {
          const params = filtersToSearchParams(data.filters);
          params.set('q', query);
          router.push(`/search?${params.toString()}`);
          return;
        }
      }
    } catch (e) {
      console.error('AI Parse failed, falling back to local regex', e);
    } finally {
      setIsParsing(false);
    }

    // Fallback
    const parsed = parseQuery(query);
    const params = filtersToSearchParams(parsed.filters);
    params.set('q', query);
    router.push(`/search?${params.toString()}`);
  }, [query, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isParsing) handleSearch();
  };

  const fillExample = (example: string) => {
    setQuery(example);
    handleQueryChange(example);
  };

  return (
    <section className="hero-gradient relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div
          className="absolute right-10 top-40 h-56 w-56 rounded-full bg-accent/8 blur-3xl animate-float"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute bottom-20 left-1/3 h-64 w-64 rounded-full bg-secondary/8 blur-3xl animate-float"
          style={{ animationDelay: '4s' }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 w-full">
        {/* Badge */}
        <div className="flex justify-center mb-6 animate-slide-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Aggregating from 99acres, MagicBricks & Housing.com
          </span>
        </div>

        {/* Heading */}
        <div className="text-center mb-10 animate-slide-up delay-100">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-4">
            <span className="text-base-content">Find Your Dream</span>
            <br />
            <span className="text-gradient">Home in India</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-base-content/60 leading-relaxed">
            Search across all major platforms at once. Just describe what you&apos;re looking
            for&nbsp;— we&apos;ll find it.
          </p>
        </div>

        {/* Search Bar */}
        <div className="animate-slide-up delay-200 mb-6">
          <div
            className={`search-glow relative rounded-2xl overflow-hidden transition-all duration-300 ${
              isFocused ? 'scale-[1.02]' : ''
            }`}
          >
            <div className="flex items-center bg-base-100/90 backdrop-blur-xl border border-base-content/10 rounded-2xl">
              <div className="pl-5 text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                id="hero-search-input"
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                onKeyDown={handleKeyDown}
                placeholder='Try: "3 BHK apartment in Gomti Nagar under 80 lakhs by owner"'
                className="flex-1 bg-transparent px-4 py-4 sm:py-5 text-sm sm:text-base text-base-content placeholder:text-base-content/30 focus:outline-none"
              />
              <div className="pr-3">
                <button
                  id="hero-search-button"
                  onClick={handleSearch}
                  disabled={!query.trim() || isParsing}
                  className="btn btn-primary rounded-xl px-5 sm:px-7 shadow-lg shadow-primary/30 disabled:opacity-40 disabled:shadow-none"
                >
                  <span className="hidden sm:inline">
                    {isParsing ? 'Parsing...' : 'Search'}
                  </span>
                  {isParsing ? (
                    <span className="loading loading-spinner loading-sm sm:ml-1"></span>
                  ) : (
                    <svg className="h-4 w-4 sm:ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Live parsed filters preview */}
          {parsedPreview && (
            <div className="mt-3 flex flex-wrap items-center gap-2 animate-fade-in px-2">
              <span className="text-xs text-base-content/40 font-medium">Detected:</span>
              {Object.entries(parsedPreview).map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-medium text-primary capitalize"
                >
                  <span className="text-primary/50">{key}:</span> {value}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Example queries */}
        <div className="animate-slide-up delay-300">
          <p className="text-center text-xs text-base-content/30 mb-3 font-medium uppercase tracking-wider">
            Try these searches
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLE_QUERIES.slice(0, 3).map((example, i) => (
              <button
                key={i}
                onClick={() => fillExample(example)}
                className="rounded-xl border border-base-content/10 bg-base-content/5 px-3 py-2 text-xs text-base-content/50 hover:border-primary/30 hover:bg-primary/5 hover:text-primary/80 transition-all duration-200 max-w-xs truncate"
              >
                &ldquo;{example}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto animate-slide-up delay-400">
          {[
            { label: 'Properties', value: '2.5M+' },
            { label: 'Cities', value: '50+' },
            { label: 'Platforms', value: '3' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gradient">{stat.value}</div>
              <div className="text-xs text-base-content/40 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-base-100 to-transparent" />
    </section>
  );
}
