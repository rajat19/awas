/* ═══════════════════════════════════════════════════════════
 *  Scraper-specific types shared between platform scrapers
 * ═══════════════════════════════════════════════════════════ */

import type { PropertyListing, PropertyFilters, Platform } from '../types';

/** Result from a single platform's scrape attempt */
export interface ScraperResult {
  platform: Platform;
  listings: PropertyListing[];
  totalFound: number;
  /** Time taken in ms */
  latency: number;
  error?: string;
}

/** Filter config translated into platform-specific URL params */
export interface PlatformUrlConfig {
  baseUrl: string;
  params: Record<string, string>;
}

/** Scraper interface — every platform implements this */
export interface PlatformScraper {
  platform: Platform;
  buildUrl(filters: PropertyFilters): string;
  scrape(filters: PropertyFilters): Promise<ScraperResult>;
}
