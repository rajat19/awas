/* ═══════════════════════════════════════════════════════════
 *  99acres Scraper
 *  Parses search result pages from 99acres.com
 *
 *  URL pattern:
 *    /3-bhk-flats-in-gomti-nagar-lucknow-ffid
 *    /property-in-lucknow-ffid
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

function build99acresUrl(filters: PropertyFilters): string {
  const city = (filters.city || 'Lucknow').toLowerCase().replace(/\s+/g, '-');

  // Determine the search path segments
  const segments: string[] = [];

  // BHK config
  if (filters.bhkConfig?.length === 1) {
    const bhk = filters.bhkConfig[0];
    const num = bhk.replace('bhk', '').replace('rk', '').replace('+', '');
    if (bhk === '1rk') {
      segments.push('1-rk');
    } else if (parseInt(num) >= 5) {
      segments.push('4-plus-bhk');
    } else {
      segments.push(`${num}-bhk`);
    }
  }

  // Property type  
  const hasFlats =
    !filters.propertyType?.length ||
    filters.propertyType.includes('apartment') ||
    filters.propertyType.includes('builder_floor');
  const hasHouse = filters.propertyType?.includes('independent_house');
  const hasVilla = filters.propertyType?.includes('villa');

  if (hasHouse || hasVilla) {
    segments.push('independent-house');
  } else if (hasFlats || !filters.propertyType?.length) {
    segments.push('flats');
  }

  // Locality
  let localitySlug = '';
  if (filters.localities?.length) {
    localitySlug = filters.localities[0]
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  // Build URL
  const prefix = segments.join('-');
  if (localitySlug) {
    return `https://www.99acres.com/${prefix}-in-${localitySlug}-${city}-ffid`;
  }
  return `https://www.99acres.com/${prefix}-in-${city}-ffid`;
}

// ── Parser ───────────────────────────────────────────────

function parse99acresHtml(
  html: string,
  filters: PropertyFilters
): PropertyListing[] {
  const $ = cheerio.load(html);
  const listings: PropertyListing[] = [];
  const city = filters.city || 'Lucknow';

  // 99acres pattern: link like [Title](url) followed by ## H2 heading
  // H2 headings: "3 BHK Flat in Locality, City"
  // Description text follows with details about area, floors, etc.
  
  // Find all h2 elements that match listing pattern
  $('h2').each((_i, el) => {
    const heading = $(el).text().trim();
    
    // Match: "3 BHK Flat in Locality, City" or "2, 3 BHK Apartment in..."
    const titleMatch = heading.match(
      /(?:(\d+)(?:,\s*\d+)*)\s*BHK\s+(Flat|Apartment|House|Villa|Farmhouse|Builder Floor)\s+in\s+(.+)/i
    );
    if (!titleMatch) return;

    const bhkNum = titleMatch[1];
    const propWord = titleMatch[2];
    const locationStr = titleMatch[3];

    // Parse location: "Locality, City"
    const locParts = locationStr.split(',').map((s) => s.trim());
    const locality = locParts[0] || '';
    const listingCity = locParts[1] || city;
    if (listingCity.toLowerCase() !== city.toLowerCase()) return;

    // Get the preceding link (which has the property URL) from the parent/sibling
    const parent = $(el).parent();

    // ── Extract images from card container ──
    // 99acres uses tupleNew__ class containers. Walk up to find the card.
    const cardImages: string[] = [];
    let cardContainer = $(el);
    for (let depth = 0; depth < 7; depth++) {
      cardContainer = cardContainer.parent();
      const cls = cardContainer.attr('class') || '';
      if (cls.includes('tupleNew__tuple') || cls.includes('srpTuple__')) break;
    }
    // Look for property images (imagecdn or newprojects)
    cardContainer.find('img').each((_j, imgEl) => {
      const src = $(imgEl).attr('src') || '';
      const dataSrc = $(imgEl).attr('data-src') || '';
      [src, dataSrc].forEach((u) => {
        if (
          (u.includes('imagecdn.99acres.com') || u.includes('newprojects.99acres.com'))
          && !cardImages.includes(u)
        ) {
          cardImages.push(u);
        }
      });
    });

    const prevLink = parent.prevAll('a').first();
    let url = prevLink.attr('href') || '';
    
    // Also try finding links that point to individual properties
    if (!url || url.includes('-ffid') || url.includes('-npxid-')) {
      // Look for links containing spid (specific property ID)
      const siblingLinks = parent.find('a[href*="spid"]');
      if (siblingLinks.length) {
        url = siblingLinks.first().attr('href') || '';
      }
    }
    
    // If we got a link, ensure it's absolute
    if (url && !url.startsWith('http')) {
      url = `https://www.99acres.com${url}`;
    }
    
    // Fallback
    if (!url) {
      url = `https://www.99acres.com/${bhkNum}-bhk-${propWord.toLowerCase().replace(/\s+/g, '-')}-in-${locality.toLowerCase().replace(/\s+/g, '-')}-${city.toLowerCase()}-ffid`;
    }

    // Get description text (all text in parent element following the heading)
    const descText = parent.text().trim();

    // Extract area from description
    let area = extractArea(descText);
    // Also try: "1,830 sq.ft" or "1830 sq.Ft."
    if (!area) {
      const areaMatch = descText.match(/([\d,]+)\s*(?:sqft|sq\.?\s*ft|sqyard)/i);
      if (areaMatch) area = parseInt(areaMatch[1].replace(/,/g, ''));
    }

    // Extract price from description
    // Patterns: "Rs. 2.63 - 3.64 Cr", "Rs. 82.19 L - 1.24 Cr"
    let price = 0;
    const priceRangeMatch = descText.match(
      /Rs\.\s*([\d.]+)\s*(?:-\s*[\d.]+\s*)?(Cr|L|Lakh?)/i
    );
    if (priceRangeMatch) {
      price = parseIndianPrice(`${priceRangeMatch[1]} ${priceRangeMatch[2]}`);
    }

    // Also extract RERA
    const reraMatch = descText.match(/RERA.*?(UPRERAPRJ\w+)/i);
    const isRera = !!reraMatch;

    // BHK config
    const bhk = extractBHK(`${bhkNum} BHK`) || '3bhk';

    // Filter by requested BHK if specified  
    if (filters.bhkConfig?.length && !filters.bhkConfig.includes(bhk)) return;

    // Property type mapping
    const ptMap: Record<string, PropertyListing['propertyType']> = {
      flat: 'apartment',
      apartment: 'apartment',
      house: 'independent_house',
      villa: 'villa',
      farmhouse: 'farm_house',
      'builder floor': 'builder_floor',
    };
    const propertyType = ptMap[propWord.toLowerCase()] || 'apartment';

    // Construction status
    let constructionStatus: PropertyListing['constructionStatus'] = 'ready_to_move';
    if (/under.?construction/i.test(descText)) constructionStatus = 'under_construction';
    if (/new\s*launch/i.test(descText)) constructionStatus = 'new_launch';

    // Bathrooms
    const bathMatch = descText.match(/(\d+)\s*bathroom/i);
    const bathrooms = bathMatch ? parseInt(bathMatch[1]) : undefined;

    // Floor
    const floorMatch = descText.match(/(\d+)(?:st|nd|rd|th)\s+floor/i);
    const floorNumber = floorMatch ? parseInt(floorMatch[1]) : undefined;
    const totalFloorsMatch = descText.match(/(\d+)\s+floors?\s+(?:tall|total|building)/i);
    const totalFloors = totalFloorsMatch ? parseInt(totalFloorsMatch[1]) : undefined;

    // Amenities extraction
    const amenityKeywords = [
      'swimming pool', 'gym', 'fitness centre', 'club house', 'park',
      'lift', 'security', 'parking', 'playground', 'cctv', 'power backup',
    ];
    const amenities = amenityKeywords.filter((a) =>
      descText.toLowerCase().includes(a)
    );

    // Furnishing
    let furnishing: PropertyListing['furnishing'] = 'unfurnished';
    if (/semi.?furnished/i.test(descText)) furnishing = 'semifurnished';
    else if (/\bfurnished\b/i.test(descText)) furnishing = 'furnished';

    listings.push({
      id: generateListingId('99acres', locality, String(bhkNum), String(area), String(price)),
      platform: '99acres',
      title: heading,
      description: descText.slice(0, 300),
      price,
      priceFormatted: price > 0 ? formatIndianPrice(price) : 'Price on request',
      propertyType,
      bhkConfig: bhk,
      furnishing,
      constructionStatus,
      area: area || 1500,
      areaUnit: 'sqft',
      location: {
        city,
        locality,
        address: `${locality}, ${city}`,
      },
      listedBy: 'dealer',
      isVerified: false,
      isReraApproved: isRera,
      postedDate: new Date().toISOString().split('T')[0],
      images: cardImages,
      amenities,
      floorNumber,
      totalFloors,
      bathrooms,
      url,
    });
  });

  return listings;
}

// ── Scraper ──────────────────────────────────────────────

export const ninetyNineAcresScraper: PlatformScraper = {
  platform: '99acres',

  buildUrl: build99acresUrl,

  async scrape(filters: PropertyFilters): Promise<ScraperResult> {
    const start = Date.now();
    try {
      const url = build99acresUrl(filters);
      const html = await fetchPage(url);
      const listings = parse99acresHtml(html, filters);

      return {
        platform: '99acres',
        listings,
        totalFound: listings.length,
        latency: Date.now() - start,
      };
    } catch (err) {
      return {
        platform: '99acres',
        listings: [],
        totalFound: 0,
        latency: Date.now() - start,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  },
};
