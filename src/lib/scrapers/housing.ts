/* ═══════════════════════════════════════════════════════════
 *  Housing.com Scraper
 *  Parses search result pages from housing.com
 *
 *  URL patterns:
 *    /buy-3bhk-flats-in-lucknow-for-sale-srpid-C8P64cykcp0bk9xl64i
 *    /buy-flats-in-gomti-nagar-lucknow-for-sale-srpid-...
 *
 *  Housing.com is heavily JS-rendered, so we use their API
 *  endpoint which returns JSON data.
 * ═══════════════════════════════════════════════════════════ */

import * as cheerio from 'cheerio';
import type { PropertyFilters, PropertyListing } from '../types';
import type { PlatformScraper, ScraperResult } from './types';
import {
  fetchPage,
  parseIndianPrice,
  formatIndianPrice,
  extractBHK,
  extractArea,
  generateListingId,
} from './utils';

// ── City ID mapping (Housing.com uses internal IDs) ─────

const CITY_SLUGS: Record<string, string> = {
  lucknow: 'lucknow',
  mumbai: 'mumbai',
  bangalore: 'bangalore',
  delhi: 'new-delhi',
  pune: 'pune',
  noida: 'noida',
  gurgaon: 'gurgaon',
  hyderabad: 'hyderabad',
  chennai: 'chennai',
  kolkata: 'kolkata',
  ahmedabad: 'ahmedabad',
};

// ── URL Builder ──────────────────────────────────────────

function buildHousingUrl(filters: PropertyFilters): string {
  const city = (filters.city || 'Lucknow').toLowerCase();
  const citySlug = CITY_SLUGS[city] || city.replace(/\s+/g, '-');

  // Housing.com uses a specific URL pattern
  const segments: string[] = ['buy'];

  // BHK config
  if (filters.bhkConfig?.length === 1) {
    const bhk = filters.bhkConfig[0];
    segments.push(bhk.replace('+', 'plus'));
  }

  // Property type
  if (filters.propertyType?.includes('independent_house') || filters.propertyType?.includes('villa')) {
    segments.push('independent-house-villa');
  } else {
    segments.push('flats');
  }

  // Location
  if (filters.localities?.length) {
    const locality = filters.localities[0].toLowerCase().replace(/\s+/g, '-');
    segments.push(`in-${locality}-${citySlug}`);
  } else {
    segments.push(`in-${citySlug}`);
  }

  segments.push('for-sale');

  return `https://housing.com/${segments.join('-')}`;
}

// ── Parser ───────────────────────────────────────────────

function parseHousingHtml(
  html: string,
  filters: PropertyFilters
): PropertyListing[] {
  const $ = cheerio.load(html);
  const listings: PropertyListing[] = [];
  const city = filters.city || 'Lucknow';

  // Housing.com renders mostly via JS, but has some SSR content
  // Look for JSON-LD structured data or listing cards
  
  // Try to find listing data in script tags (JSON-LD)
  $('script[type="application/ld+json"]').each((_i, el) => {
    try {
      const parsedData = JSON.parse($(el).text());
      const items = Array.isArray(parsedData) ? parsedData : [parsedData];

      items.forEach((json: any) => {
        const types = Array.isArray(json['@type']) ? json['@type'] : [json['@type']];

        // Process ApartmentComplex or Product items
        if (types.includes('ApartmentComplex') || types.includes('Product') || types.includes('SingleFamilyResidence')) {
          const name = json.name || '';
          const url = json.url || '';
          const desc = json.description || '';
          const price = json.offers?.price || json.offers?.lowPrice || 0;
          const image = json.image || '';

          if (!name || !price) return;

          const bhk = extractBHK(name) || '2bhk';
          const area = extractArea(desc);

          // Parse locality
          const locStr = json.address || city;
          const locParts = locStr.split(',').map((s: string) => s.trim());
          const locality = locParts[0] || city;

          listings.push({
            id: generateListingId('housing', name, String(price)),
            platform: 'housing',
            title: name,
            description: desc.slice(0, 300),
            price,
            priceFormatted: formatIndianPrice(price),
            propertyType: 'apartment',
            bhkConfig: bhk,
            furnishing: 'unfurnished',
            constructionStatus: 'ready_to_move',
            area: area || 1200,
            areaUnit: 'sqft',
            location: { city, locality, address: locStr },
            listedBy: 'dealer',
            isVerified: true,
            isReraApproved: false,
            postedDate: new Date().toISOString().split('T')[0],
            images: image ? [image] : [],
            amenities: json.amenityFeature || [],
            url: url.startsWith('http') ? url : `https://housing.com${url}`,
          });
        }
        
        // Retain ItemList support just in case
        if (json['@type'] === 'ItemList' && json.itemListElement) {
          json.itemListElement.forEach(
            (item: any) => {
              const name = item.name || '';
              const url = item.url || '';
              const desc = item.description || '';
              const price = item.offers?.price || item.offers?.lowPrice || 0;

              if (!name || !price) return;

              const bhk = extractBHK(name) || '2bhk';
              const area = extractArea(desc);

              const locMatch = name.match(/in\s+(.+)/i);
              const locStr = locMatch ? locMatch[1] : city;
              const locParts = locStr.split(',').map((s: string) => s.trim());
              const locality = locParts[0] || city;

              listings.push({
                id: generateListingId('housing', name, String(price)),
                platform: 'housing',
                title: name,
                description: desc.slice(0, 300),
                price,
                priceFormatted: formatIndianPrice(price),
                propertyType: 'apartment',
                bhkConfig: bhk,
                furnishing: 'unfurnished',
                constructionStatus: 'ready_to_move',
                area: area || 1200,
                areaUnit: 'sqft',
                location: { city, locality, address: locStr },
                listedBy: 'dealer',
                isVerified: true,
                isReraApproved: false,
                postedDate: new Date().toISOString().split('T')[0],
                images: [],
                amenities: [],
                url: url.startsWith('http') ? url : `https://housing.com${url}`,
              });
            }
          );
        }
      });
    } catch {
      // JSON parse failed, skip
    }
  });

  // Fallback: parse links and headings for project listings
  if (listings.length === 0) {
    // Housing.com homepage has links like "3 BHK Flats" that we can follow
    // Parse any visible listing text
    $('h2, h3').each((_i, el) => {
      const heading = $(el).text().trim();
      
      // Skip navigation headings
      if (
        heading.includes('top picks') ||
        heading.includes('Prominent') ||
        heading.includes('Research') ||
        heading.includes('News') ||
        heading.includes('Find')
      )
        return;

      // Try to extract listing info if it looks like a property
      const bhk = extractBHK(heading);
      if (!bhk) return;

      const parent = $(el).parent();
      const fullText = parent.text().trim();
      const area = extractArea(fullText);
      
      const priceMatch = fullText.match(/([\d.]+)\s*(L|Lac|Cr|Lakh)/i);
      if (!priceMatch) return;
      const price = parseIndianPrice(`${priceMatch[1]} ${priceMatch[2]}`);

      const locMatch = heading.match(/in\s+(.+)/i);
      const locality = locMatch
        ? locMatch[1].split(',')[0].trim()
        : city;

      const link = parent.find('a').first().attr('href') || '';
      const url = link.startsWith('http') ? link : `https://housing.com${link}`;

      listings.push({
        id: generateListingId('housing', heading, String(price)),
        platform: 'housing',
        title: heading,
        description: fullText.slice(0, 300),
        price,
        priceFormatted: formatIndianPrice(price),
        propertyType: 'apartment',
        bhkConfig: bhk,
        furnishing: 'unfurnished',
        constructionStatus: 'ready_to_move',
        area: area || 1200,
        areaUnit: 'sqft',
        location: { city, locality, address: `${locality}, ${city}` },
        listedBy: 'dealer',
        isVerified: true,
        isReraApproved: false,
        postedDate: new Date().toISOString().split('T')[0],
        images: [],
        amenities: [],
        url,
      });
    });
  }

  return listings;
}

// ── Scraper ──────────────────────────────────────────────

export const housingScraper: PlatformScraper = {
  platform: 'housing',

  buildUrl: buildHousingUrl,

  async scrape(filters: PropertyFilters): Promise<ScraperResult> {
    const start = Date.now();
    try {
      const url = buildHousingUrl(filters);
      const html = await fetchPage(url);
      const listings = parseHousingHtml(html, filters);

      return {
        platform: 'housing',
        listings,
        totalFound: listings.length,
        latency: Date.now() - start,
      };
    } catch (err) {
      return {
        platform: 'housing',
        listings: [],
        totalFound: 0,
        latency: Date.now() - start,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  },
};
