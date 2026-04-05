/* ═══════════════════════════════════════════════════════════
 *  MagicBricks Scraper
 *  Parses search result pages from magicbricks.com
 *
 *  URL pattern:
 *    /property-for-sale/residential-real-estate?bedroom=3
 *      &proptype=Multistorey-Apartment,Builder-Floor-Apartment
 *      &cityName=Lucknow
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

// ── URL Builder ──────────────────────────────────────────

function buildMagicBricksUrl(filters: PropertyFilters): string {
  const params = new URLSearchParams();

  // Bedroom
  if (filters.bhkConfig?.length) {
    const bedrooms = filters.bhkConfig
      .map((b) => b.replace('bhk', '').replace('rk', '').replace('+', ''))
      .join(',');
    params.set('bedroom', bedrooms);
  }

  // Property type mapping
  const propTypes: string[] = [];
  const typeMap: Record<string, string> = {
    apartment: 'Multistorey-Apartment',
    builder_floor: 'Builder-Floor-Apartment',
    villa: 'Penthouse',
    independent_house: 'Residential-House',
    farm_house: 'Villa',
    residential_land: 'Residential-Plot',
  };
  if (filters.propertyType?.length) {
    filters.propertyType.forEach((t) => {
      if (typeMap[t]) propTypes.push(typeMap[t]);
    });
  }
  if (propTypes.length === 0) {
    propTypes.push(
      'Multistorey-Apartment',
      'Builder-Floor-Apartment',
      'Penthouse',
      'Studio-Apartment',
      'Residential-House',
      'Villa'
    );
  }
  params.set('proptype', propTypes.join(','));

  // City
  params.set('cityName', filters.city || 'Lucknow');

  // Budget
  if (filters.budget?.min) params.set('budgetMin', String(filters.budget.min));
  if (filters.budget?.max) params.set('budgetMax', String(filters.budget.max));

  return `https://www.magicbricks.com/property-for-sale/residential-real-estate?${params.toString()}`;
}

// ── Parser ───────────────────────────────────────────────

function parseMagicBricksHtml(
  html: string,
  filters: PropertyFilters
): PropertyListing[] {
  const $ = cheerio.load(html);
  const listings: PropertyListing[] = [];
  const city = filters.city || 'Lucknow';

  // MagicBricks uses h2 headings for each listing title
  // Pattern: "3 BHK Flat for Sale in [Society], [Locality], [City]"
  $('h2').each((_i, el) => {
    const heading = $(el).text().trim();
    if (!heading.includes('for Sale in')) return;

    // Get the description paragraph right after h2
    const parent = $(el).parent();
    const grandParent = parent.parent();
    const fullText = parent.text().trim();

    // ── Extract images from card container ──
    // MagicBricks card images sit in grandparent: img[src*=staticmb] or img[data-src*=staticmb]
    const cardImages: string[] = [];
    grandParent.find('img').each((_j, imgEl) => {
      const src = $(imgEl).attr('src') || '';
      const dataSrc = $(imgEl).attr('data-src') || '';
      const imgUrl = (src.includes('staticmb.com') ? src : '')
        || (dataSrc.includes('staticmb.com') ? dataSrc : '');
      if (imgUrl && !cardImages.includes(imgUrl)) {
        cardImages.push(imgUrl);
      }
    });

    // Extract title components
    const titleMatch = heading.match(
      /(\d+\s*BHK)\s+(Flat|Apartment|House|Villa|Builder Floor)\s+for\s+Sale\s+in\s+(.+)/i
    );
    if (!titleMatch) return;

    const bhkStr = titleMatch[1];
    const propTypeStr = titleMatch[2];
    const locationStr = titleMatch[3];

    // Parse location: "Society Name, Locality, City"
    const locParts = locationStr.split(',').map((s) => s.trim());
    const society = locParts[0] || '';
    const locality = locParts.length >= 2 ? locParts[locParts.length - 2] : locParts[0];

    // Extract area
    const area = extractArea(fullText);

    // Extract price from description text
    // Look for patterns: "₹3.10 Cr", "price of ₹1.63 Cr", "₹60.5 Lac"
    const priceMatch = fullText.match(
      /(?:price\s+of\s+)?₹?\s*([\d.]+)\s*(Cr|Lac|Lakh|L)\b/i
    );
    let price = 0;
    if (priceMatch) {
      price = parseIndianPrice(`${priceMatch[1]} ${priceMatch[2]}`);
    }

    // Skip if no price found
    if (price === 0) return;

    // Extract RERA
    const reraMatch = fullText.match(/RERA\s+(?:number|approved).*?(UPRERAPRJ\w+)/i);
    const isRera = !!reraMatch;

    // Extract the property detail URL
    let url = '';
    const viewPropertyLink = parent.find('a[href*="propertyDetails"]');
    if (viewPropertyLink.length) {
      url = viewPropertyLink.attr('href') || '';
      if (url && !url.startsWith('http')) {
        url = `https://www.magicbricks.com${url}`;
      }
    } else {
      // Fallback: try any link in the parent
      const anyLink = parent.find('a[href*="magicbricks.com"]');
      if (anyLink.length) {
        url = anyLink.first().attr('href') || '';
      }
    }
    if (!url) {
      url = `https://www.magicbricks.com/property-for-sale/residential-real-estate?cityName=${encodeURIComponent(city)}`;
    }

    // BHK config
    const bhk = extractBHK(bhkStr) || '3bhk';

    // Property type mapping
    const ptMap: Record<string, PropertyListing['propertyType']> = {
      flat: 'apartment',
      apartment: 'apartment',
      house: 'independent_house',
      villa: 'villa',
      'builder floor': 'builder_floor',
    };
    const propertyType = ptMap[propTypeStr.toLowerCase()] || 'apartment';

    // Construction status from text
    let constructionStatus: PropertyListing['constructionStatus'] = 'ready_to_move';
    if (/under\s*construction/i.test(fullText)) constructionStatus = 'under_construction';
    if (/new\s*launch/i.test(fullText)) constructionStatus = 'new_launch';

    // Verified status
    const isVerified = /verified/i.test(fullText);

    listings.push({
      id: generateListingId('magicbricks', society, locality, String(area), String(price)),
      platform: 'magicbricks',
      title: heading,
      description: fullText.slice(0, 300),
      price,
      priceFormatted: formatIndianPrice(price),
      propertyType,
      bhkConfig: bhk,
      furnishing: 'unfurnished',
      constructionStatus,
      area: area || 1500,
      areaUnit: 'sqft',
      location: {
        city,
        locality,
        address: `${society}, ${locality}, ${city}`,
      },
      listedBy: 'dealer',
      isVerified,
      isReraApproved: isRera,
      postedDate: new Date().toISOString().split('T')[0],
      images: cardImages,
      amenities: [],
      url,
    });
  });

  return listings;
}

// ── Scraper ──────────────────────────────────────────────

export const magicBricksScraper: PlatformScraper = {
  platform: 'magicbricks',

  buildUrl: buildMagicBricksUrl,

  async scrape(filters: PropertyFilters): Promise<ScraperResult> {
    const start = Date.now();
    try {
      const url = buildMagicBricksUrl(filters);
      const html = await fetchPage(url);
      const listings = parseMagicBricksHtml(html, filters);

      return {
        platform: 'magicbricks',
        listings,
        totalFound: listings.length,
        latency: Date.now() - start,
      };
    } catch (err) {
      return {
        platform: 'magicbricks',
        listings: [],
        totalFound: 0,
        latency: Date.now() - start,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  },
};
