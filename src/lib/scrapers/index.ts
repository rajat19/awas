/* ═══════════════════════════════════════════════════════════
 *  Scraper Aggregator
 *  Runs all platform scrapers in parallel, deduplicates,
 *  ranks, and paginates the combined results.
 * ═══════════════════════════════════════════════════════════ */

import type { PropertyFilters, PropertyListing, SearchResults, Platform, SortBy } from '../types';
import type { ScraperResult } from './types';
import { ninetyNineAcresScraper } from './99acres';
import { magicBricksScraper } from './magicbricks';
import { housingScraper } from './housing';

export interface AggregatedSearchResult extends SearchResults {
  scraperMeta: {
    platform: Platform;
    latency: number;
    count: number;
    error?: string;
  }[];
}

/**
 * Search all platforms in parallel and combine results.
 */
export async function aggregateSearch(
  filters: PropertyFilters,
  page: number = 1,
  pageSize: number = 24
): Promise<AggregatedSearchResult> {
  // Run all scrapers in parallel with Promise.allSettled
  const scraperPromises: Promise<ScraperResult>[] = [];
  if (!filters.platforms?.length || filters.platforms.includes('99acres')) {
    scraperPromises.push(ninetyNineAcresScraper.scrape(filters));
  }
  if (!filters.platforms?.length || filters.platforms.includes('magicbricks')) {
    scraperPromises.push(magicBricksScraper.scrape(filters));
  }
  if (!filters.platforms?.length || filters.platforms.includes('housing')) {
    scraperPromises.push(housingScraper.scrape(filters));
  }

  const results = await Promise.allSettled(scraperPromises);

  // Collect all listings
  let allListings: PropertyListing[] = [];
  const scraperMeta: AggregatedSearchResult['scraperMeta'] = [];
  const platformBreakdown: Record<Platform, number> = {
    '99acres': 0,
    magicbricks: 0,
    housing: 0,
  };

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      const sr: ScraperResult = result.value;
      allListings.push(...sr.listings);
      platformBreakdown[sr.platform] = sr.listings.length;
      scraperMeta.push({
        platform: sr.platform,
        latency: sr.latency,
        count: sr.listings.length,
        error: sr.error,
      });
    } else {
      // Promise rejected entirely
      scraperMeta.push({
        platform: '99acres', // We can't determine which, but this shouldn't happen with allSettled
        latency: 0,
        count: 0,
        error: result.reason?.message || 'Promise rejected',
      });
    }
  });

  // Deduplicate by a similarity key (title + price + area)
  const seen = new Set<string>();
  allListings = allListings.filter((listing) => {
    const key = `${listing.title.toLowerCase().slice(0, 40)}-${listing.price}-${listing.area}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Filter by budget if specified (post-scrape enforcement)
  if (filters.budget?.min || filters.budget?.max) {
    allListings = allListings.filter((l) => {
      if (l.price === 0) return true; // keep "price on request"
      if (filters.budget?.min && l.price < filters.budget.min) return false;
      if (filters.budget?.max && l.price > filters.budget.max) return false;
      return true;
    });
  }

  // Filter by propertyType if specified (post-scrape enforcement)
  if (filters.propertyType?.length) {
    allListings = allListings.filter((l) => filters.propertyType!.includes(l.propertyType));
  }

  // Filter by bhkConfig if specified (post-scrape enforcement)
  if (filters.bhkConfig?.length) {
    allListings = allListings.filter((l) => filters.bhkConfig!.includes(l.bhkConfig as any));
  }

  // Sort
  allListings = sortListings(allListings, filters.sortBy);

  // Paginate
  const totalCount = allListings.length;
  const startIdx = (page - 1) * pageSize;
  const paginatedListings = allListings.slice(startIdx, startIdx + pageSize);

  // Recount platform breakdown after dedup/filter
  const finalBreakdown: Record<Platform, number> = {
    '99acres': 0,
    magicbricks: 0,
    housing: 0,
  };
  allListings.forEach((l) => finalBreakdown[l.platform]++);

  return {
    listings: paginatedListings,
    totalCount,
    page,
    pageSize,
    appliedFilters: filters,
    platformBreakdown: finalBreakdown,
    scraperMeta,
  };
}

/**
 * Rank and sort listings.
 */
function sortListings(listings: PropertyListing[], sortBy?: SortBy): PropertyListing[] {
  const sorted = [...listings];

  switch (sortBy) {
    case 'price_low_to_high':
      sorted.sort((a, b) => (a.price || Infinity) - (b.price || Infinity));
      break;
    case 'price_high_to_low':
      sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case 'newest_first':
      sorted.sort(
        (a, b) =>
          new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
      );
      break;
    case 'area_high_to_low':
      sorted.sort((a, b) => (b.area || 0) - (a.area || 0));
      break;
    case 'area_low_to_high':
      sorted.sort((a, b) => (a.area || Infinity) - (b.area || Infinity));
      break;
    case 'price_sqft_low_to_high':
      sorted.sort((a, b) => {
        const psA = a.area ? (a.price || Infinity) / a.area : Infinity;
        const psB = b.area ? (b.price || Infinity) / b.area : Infinity;
        return psA - psB;
      });
      break;
    case 'price_sqft_high_to_low':
      sorted.sort((a, b) => {
        const psA = a.area && a.price ? a.price / a.area : 0;
        const psB = b.area && b.price ? b.price / b.area : 0;
        return psB - psA;
      });
      break;
    case 'relevance':
    default:
      // Default ranking: verified first, then RERA, then by price
      sorted.sort((a, b) => {
        // Verified listings first
        if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
        // RERA approved next
        if (a.isReraApproved !== b.isReraApproved) return a.isReraApproved ? -1 : 1;
        // Then by price (ascending, skip 0)
        const priceA = a.price || Infinity;
        const priceB = b.price || Infinity;
        return priceA - priceB;
      });
      break;
  }

  return sorted;
}
